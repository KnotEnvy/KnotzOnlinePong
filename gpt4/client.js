const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const endScreen = document.getElementById('endScreen');
const winnerDisplay = document.getElementById('winner');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

let ws;
let playerY = 250;
const paddleHeight = 100;

function initialize() {
  startButton.addEventListener('click', () => {
    ws.send(JSON.stringify({ action: 'start' }));
  });

  restartButton.addEventListener('click', () => {
    ws.send(JSON.stringify({ action: 'restart' }));
  });

  ws = new WebSocket('ws://localhost:8080');
  ws.addEventListener('open', () => {
    startScreen.style.display = 'block';
  });
  
  ws.addEventListener('message', function(event) {
    const state = JSON.parse(event.data);
    if (state.winner) {
      endGame(state.winner);
    } else {
      draw(state);
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') {
      playerY -= 20;
    }
    if (e.key === 'ArrowDown') {
      playerY += 20;
    }
    ws.send(JSON.stringify({ action: 'move', y: playerY }));
  });
}

function draw(state) {
  startScreen.style.display = 'none';
  endScreen.style.display = 'none';
  canvas.style.display = 'block';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';

  ctx.fillRect(0, state.playerY, 10, 100);
  ctx.fillRect(canvas.width - 10, state.opponentY, 10, 100);
  ctx.beginPath();
  ctx.arc(state.ballX, state.ballY, 10, 0, Math.PI * 2);
  ctx.fill();
}

function endGame(winner) {
  canvas.style.display = 'none';
  endScreen.style.display = 'block';
  winnerDisplay.textContent = `${winner} wins!`;
}

window.addEventListener('DOMContentLoaded', initialize);
