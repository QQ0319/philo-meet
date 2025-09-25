const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

io.on('connection', socket => {
  socket.on('join', ({ username, room }) => {
    socket.join(room);
    socket.to(room).emit('user-joined', { id: socket.id, username });
  });
  socket.on('chat', ({ username, room, msg }) => {
    io.to(room).emit('chat', { username, msg });
  });
});

http.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
