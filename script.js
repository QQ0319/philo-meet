const socket = io();
const joinBtn = document.getElementById("joinBtn");
const joinScreen = document.getElementById("join-screen");
const meetingScreen = document.getElementById("meeting-screen");
const usernameInput = document.getElementById("username");
const videos = document.getElementById("videos");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");

joinBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("請輸入暱稱！");
  joinScreen.classList.add("hidden");
  meetingScreen.classList.remove("hidden");
  socket.emit("join", name);
};

socket.on("user-joined", (name) => {
  const div = document.createElement("div");
  div.textContent = `${name} 加入會議`;
  div.className = "text-green-500 animate-bounce";
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    const msg = messageInput.value.trim();
    if (!msg) return;
    socket.emit("chat", msg);
    messageInput.value = "";
  }
});

socket.on("chat", ({ name, message }) => {
  const div = document.createElement("div");
  div.innerHTML = `<span class="font-bold">${name}:</span> ${message}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
