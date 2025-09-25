const socket = io();

const joinBtn = document.getElementById('join-btn');
const leaveBtn = document.getElementById('leave-btn');
const sendBtn = document.getElementById('send-btn');
const usernameInput = document.getElementById('username');
const roomInput = document.getElementById('room');
const messageInput = document.getElementById('message');
const chatBox = document.getElementById('chat-box');
const roomContainer = document.getElementById('room-container');
const chatContainer = document.getElementById('chat-container');
const roomNameDisplay = document.getElementById('room-name');

let currentRoom = '';
let username = '';

joinBtn.addEventListener('click', () => {
  username = usernameInput.value.trim();
  currentRoom = roomInput.value.trim();
  if (username && currentRoom) {
    socket.emit('joinRoom', { username, room: currentRoom });
    roomContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    roomNameDisplay.textContent = '聊天室：' + currentRoom;
  }
});

leaveBtn.addEventListener('click', () => {
  socket.emit('leaveRoom', { username, room: currentRoom });
  chatBox.innerHTML = '';
  chatContainer.classList.add('hidden');
  roomContainer.classList.remove('hidden');
});

sendBtn.addEventListener('click', () => {
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit('chatMessage', { room: currentRoom, username, message: msg });
    messageInput.value = '';
  }
});

socket.on('message', (data) => {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `${data.username}：${data.message}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});