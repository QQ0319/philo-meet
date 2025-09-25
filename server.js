const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("."));

const users = {};

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("user list", Object.values(users));
  });

  socket.on("chat message", (msg) => {
    const user = users[socket.id] || "匿名";
    io.emit("chat message", { user, message: msg });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user list", Object.values(users));
  });
});

const PORT = 3000;
http.listen(PORT, () => {
  console.log("伺服器啟動於 http://localhost:" + PORT);
});