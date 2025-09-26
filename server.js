const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  socket.on("join", (name) => {
    socket.username = name;
    io.emit("user-joined", name);
  });

  socket.on("chat", (msg) => {
    io.emit("chat", { name: socket.username, message: msg });
  });
});

http.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
