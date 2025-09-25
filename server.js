const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.userName = userName;
    const clients = [...io.sockets.adapter.rooms.get(roomId) || []];
    const users = clients.map(id => ({
      id,
      userName: io.sockets.sockets.get(id)?.data.userName || "User"
    }));
    io.to(roomId).emit("users-update", users);
    socket.to(roomId).emit("user-joined", { id: socket.id, userName });
  });

  socket.on("offer", (data) => {
    socket.to(data.to).emit("offer", { from: socket.id, sdp: data.sdp });
  });

  socket.on("answer", (data) => {
    socket.to(data.to).emit("answer", { from: socket.id, sdp: data.sdp });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.to).emit("ice-candidate", { from: socket.id, candidate: data.candidate });
  });

  socket.on("mute-user", (data) => {
    socket.to(data.to).emit("force-mute");
  });

  socket.on("disconnect", () => {
    io.emit("user-left", socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});