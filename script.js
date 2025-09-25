let socket;
let username = "";

function joinChat() {
  username = document.getElementById("username").value.trim();
  if (!username) return alert("請輸入暱稱");

  document.getElementById("chatArea").style.display = "block";
  document.getElementById("username").style.display = "none";
  socket = io();
  socket.emit("join", username);

  socket.on("chat message", ({ user, message }) => {
    const box = document.getElementById("chatBox");
    const msgDiv = document.createElement("div");
    msgDiv.innerHTML = "<strong>" + user + ":</strong> " + message;
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
  });

  socket.on("user list", users => {
    document.getElementById("userList").innerHTML =
      "<strong>使用者列表：</strong> " + users.join(", ");
  });
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (message) {
    socket.emit("chat message", message);
    input.value = "";
  }
}