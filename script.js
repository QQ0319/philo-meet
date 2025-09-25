const socket = io();
let localStream;
let peers = {};
let username = '';
let room = '';

function joinRoom() {
  username = document.getElementById('username').value;
  room = document.getElementById('room').value;
  if (!username || !room) return alert('請輸入暱稱和房間代碼');
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    localStream = stream;
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    document.getElementById('video-grid').appendChild(video);
    socket.emit('join', { username, room });
  });
}

socket.on('user-joined', ({ id, username }) => {
  const msg = document.createElement('div');
  msg.textContent = `${username} 加入了房間`;
  document.getElementById('system').appendChild(msg);
});

function sendMessage(e) {
  if (e.key === 'Enter') {
    const msg = e.target.value;
    if (msg) {
      socket.emit('chat', { username, room, msg });
      appendMessage(`${username}：${msg}`);
      e.target.value = '';
    }
  }
}

function appendMessage(text) {
  const msg = document.createElement('div');
  msg.textContent = text;
  document.getElementById('messages').appendChild(msg);
}

socket.on('chat', ({ username, msg }) => {
  appendMessage(`${username}：${msg}`);
});

function showTab(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
