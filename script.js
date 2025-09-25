const socket = io();
let localStream, peers = {}, isHost = false;
let roomId, userName;

document.getElementById("joinBtn").onclick = async () => {
  roomId = document.getElementById("roomId").value;
  userName = document.getElementById("userName").value;
  if (!roomId || !userName) return alert("請輸入房間代碼與暱稱");

  document.getElementById("join-screen").classList.add("hidden");
  document.getElementById("meeting-screen").classList.remove("hidden");

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  addVideoStream(localStream, "我");

  socket.emit("join-room", { roomId, userName });
};

socket.on("users-update", (users) => {
  isHost = users[0].id === socket.id;
});

socket.on("user-joined", async ({ id }) => {
  const pc = createPeerConnection(id);
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("offer", { to: id, sdp: offer });
});

socket.on("offer", async ({ from, sdp }) => {
  const pc = createPeerConnection(from);
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("answer", { to: from, sdp: answer });
});

socket.on("answer", async ({ from, sdp }) => {
  await peers[from].setRemoteDescription(new RTCSessionDescription(sdp));
});

socket.on("ice-candidate", async ({ from, candidate }) => {
  await peers[from].addIceCandidate(new RTCIceCandidate(candidate));
});

function createPeerConnection(id) {
  const pc = new RTCPeerConnection();
  pc.onicecandidate = (e) => {
    if (e.candidate) socket.emit("ice-candidate", { to: id, candidate: e.candidate });
  };
  pc.ontrack = (e) => addVideoStream(e.streams[0], "👤");
  peers[id] = pc;
  return pc;
}

function addVideoStream(stream, label) {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.className = "rounded-lg shadow-lg";
  document.getElementById("videos").appendChild(video);
}