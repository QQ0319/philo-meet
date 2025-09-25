const socket = io();
const videoGrid = document.getElementById('thumbnails');
const mainVideo = document.getElementById('main-video');
const mainUsername = document.getElementById('main-username');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');
const userList = document.getElementById('users');
const muteBtn = document.getElementById('mute-btn');
const shareBtn = document.getElementById('share-btn');

let myVideoStream;
let myPeer;
let myId;
let myName;
let roomId;
let peers = {};

document.getElementById('leave-btn').onclick = () => location.reload();

function joinRoom() {
  myName = document.getElementById('username').value;
  roomId = document.getElementById('room').value;
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');

  myPeer = new Peer(undefined, {
    host: '/',
    port: location.port || (location.protocol === 'https:' ? 443 : 80),
    path: '/peerjs'
  });

  myPeer.on('open', id => {
    myId = id;
    socket.emit('join-room', roomId, id, myName);
  });

  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    myVideoStream = stream;
    addVideoStream(myId, stream, myName, true);

    myPeer.on('call', call => {
      call.answer(stream);
      call.on('stream', userVideoStream => {
        addVideoStream(call.peer, userVideoStream);
      });
    });

    socket.on('user-connected', (userId, name) => {
      const call = myPeer.call(userId, stream);
      call.on('stream', userVideoStream => {
        addVideoStream(userId, userVideoStream, name);
      });
    });
  });

  socket.on('chat-message', data => {
    const el = document.createElement('div');
    el.textContent = `${data.name}: ${data.message}`;
    messages.appendChild(el);
  });

  socket.on('user-list', users => {
    userList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.name;
      userList.appendChild(li);
    });
  });
}

function sendMessage() {
  const msg = messageInput.value;
  if (msg) {
    socket.emit('send-message', roomId, msg);
    messageInput.value = '';
  }
}

function addVideoStream(id, stream, name = '', isSelf = false) {
  if (document.getElementById(`video-${id}`)) return;

  const video = document.createElement('video');
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.id = `video-${id}`;
  video.onclick = () => setMainVideo(stream, name);
  videoGrid.appendChild(video);

  if (isSelf) setMainVideo(stream, name);
}

function setMainVideo(stream, name = '') {
  mainVideo.srcObject = stream;
  mainUsername.textContent = name;
}