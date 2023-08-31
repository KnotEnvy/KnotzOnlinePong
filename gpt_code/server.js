
const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
app.use(cors());

// Serve static files
app.use(express.static('public'));

const server = http.Server(app);

const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

let gameInitiated = false;
let playerReadyCount = 0;

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('sendPlayerData', (data) => {
    socket.broadcast.emit('updateOpponent', data);
  });
  
  socket.on('initGame', () => {
    gameInitiated = true;
    io.emit('showReadyScreen');
  });

  socket.on('playerReady', () => {
    playerReadyCount++;
    if (gameInitiated && playerReadyCount >= 2) {
      io.emit('startGame');
      gameInitiated = false;  // Reset for the next round
      playerReadyCount = 0;  // Reset for the next round
    }
  });
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
