const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
// join chat room
socket.emit("joinRoom", {
  username,
  room,
});
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room); // to display the room name
  outputUsers(users); // to display the users name
});
//message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //get message text
  const msg = e.target.elements.msg.value;
  //console.log(msg)
  //msg =msg.trim()

  if (!msg) {
    return false;
  }
  //emit message to server
  socket.emit("chatMessage", msg);
  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});
//output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class ="meta"> ${message.username} <span>
   </span></p><p class="text">${message.text} </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//add room to dom
function outputRoomName(room) {
  roomName.innerText = room;
}
// add users to dom
function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}
// promt the user before leave the chat room

document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("are you sure to leave the room ? ");
  if (leaveRoom) {
    window.location = "../index.html";
  } else {
  }
});
