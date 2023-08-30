const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('sendPlayerData', (data) => {
    socket.broadcast.emit('updateOpponent', data);
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
