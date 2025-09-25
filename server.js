const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '/')));

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    socket.to(room).emit('message', { username: '系統', message: `${username} 加入了房間` });
  });

  socket.on('chatMessage', ({ room, username, message }) => {
    io.to(room).emit('message', { username, message });
  });

  socket.on('leaveRoom', ({ username, room }) => {
    socket.leave(room);
    socket.to(room).emit('message', { username: '系統', message: `${username} 離開了房間` });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));