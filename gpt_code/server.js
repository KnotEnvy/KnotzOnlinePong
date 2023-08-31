const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let gameInitiated = false;
let playerReadyCount = 0;
let player1Score = 0, player2Score = 0;
let gameOver = false;

io.on('connection', (socket) => {
  socket.on('gameInit', () => {
    gameInitiated = true;
    io.emit('showReadyScreen');
  });

  socket.on('playerReady', () => {
    playerReadyCount++;
    if (gameInitiated && playerReadyCount >= 2) {
      io.emit('startGame');
      gameInitiated = false;
      playerReadyCount = 0;
    }
  });

  socket.on('updateScore', (data) => {
    player1Score = data.player1Score;
    player2Score = data.player2Score;
    if (player1Score >= 5 || player2Score >= 5) {
      gameOver = true;
      io.emit('gameOver', player1Score >= 5 ? "Player 1" : "Player 2");
    }
  });

  socket.on('sendPlayerData', (data) => {
    socket.broadcast.emit('updateOpponent', data);
  });

  socket.on('restartGame', () => {
    player1Score = 0;
    player2Score = 0;
    gameOver = false;
    io.emit('restartGame');
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
