const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://127.0.0.1:3000",
    methods: ["GET", "POST"]
  }
});


let players = {};
let playerCount = 0;
let ball = { x: 400, y: 300, dx: 5, dy: 5, radius: 10 };
let winner = null;
let scores = { 'Player 1': 0, 'Player 2': 0 };

io.on('connection', (socket) => {
  // Assign the x position based on the order of connection
  const xPos = playerCount === 0 ? 0 : 790;
  players[socket.id] = { x: xPos, y: 0, width: 10, height: 100 };
  playerCount++;

  socket.on('startGame', () => {
    ball = { x: 400, y: 300, dx: 5, dy: 5, radius: 10 };
    winner = null;
    scores = { 'Player 1': 0, 'Player 2': 0 };
  });

  socket.on('keyPress', (keyCode) => {
    const paddle = players[socket.id];
    if (keyCode === 38) {
      paddle.y -= 10;
    } else if (keyCode === 40) {
      paddle.y += 10;
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    playerCount--;
  });
});

function gameLoop() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y + ball.dy < 0 || ball.y + ball.dy > 600) {
    ball.dy = -ball.dy;
  }

  for (const [id, paddle] of Object.entries(players)) {
    if (ball.x < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y) {
      ball.dx = -ball.dx;
    }
  }

  if (ball.x < 0) {
    winner = 'Player 2';
    scores['Player 2']++;
  } else if (ball.x > 800) {
    winner = 'Player 1';
    scores['Player 1']++;
  }

  if (scores['Player 1'] >= 10) {
    winner = 'Player 1';
  } else if (scores['Player 2'] >= 10) {
    winner = 'Player 2';
  }

  io.emit('gameState', { players, ball, winner, scores });
}

setInterval(gameLoop, 1000 / 60);

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
