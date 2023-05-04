const express = require("express");
const formatMessage = require("./utils/messages");
const botName = "karim errebai";
require("dotenv").config();
const { success, error } = require("consola");
const http = require("http");
const path = require("path");
const PORT = process.env.APP_PORT;
const DOMAIN = process.env.APP_DOMAIN;
const socketio = require("socket.io");

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

// intializing ourr project
const app = express();
// create our http server
const server = http.createServer(app);
const io = socketio(server);
// set static folder
app.use(express.static(path.join(__dirname, "public")));

//run wher clients connects
io.on("connection", (socket) => {
  //console.log("new websocket connection ... ");
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //send with emit and respect with on
    socket.emit("message", formatMessage(botName, "salut"));
    //broadcasst when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, ` ${user.username} has joined the chat`)
      );
    //send users and room info

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    // to all clients in the name space expect the
    socket.on("chatMessage", (msg) => {
      console.log(msg);
      io.emit("message", formatMessage("user", msg));
    });
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, "a user has left the chat")
      );

      //send user and room info

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

//start listnig on the port
server.listen(PORT, async () => {
  try {
    success({
      message: `server start on ${PORT} ` + `URL: ${DOMAIN}`,
      badge: true,
    });
  } catch (err) {
    error({
      message: "failed" + err.message,
      badge: true,
    });
  }
});

// io input and output en temps reél
