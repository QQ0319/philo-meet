const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const peerServer = ExpressPeerServer(httpServer, { debug: true });

app.use('/peerjs', peerServer);
app.use(express.static('.'));

const users = {};

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, name) => {
    socket.join(roomId);
    if (!users[roomId]) users[roomId] = [];
    users[roomId].push({ id: userId, name });
    io.to(roomId).emit('user-connected', userId, name);
    io.to(roomId).emit('user-list', users[roomId]);

    socket.on('send-message', (roomId, msg) => {
      io.to(roomId).emit('chat-message', { name, message: msg });
    });

    socket.on('disconnect', () => {
      users[roomId] = users[roomId].filter(u => u.id !== userId);
      io.to(roomId).emit('user-list', users[roomId]);
    });
  });
});

httpServer.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});