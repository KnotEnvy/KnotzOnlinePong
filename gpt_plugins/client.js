const socket = io('http://localhost:3000');

let canvas, ctx;
let gameStarted = false;

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  document.addEventListener('keydown', keyDownHandler);
  socket.on('gameState', drawGame);
});

function startGame() {
  gameStarted = true;
  document.getElementById('startScreen').style.display = 'none';
  socket.emit('startGame');
}

function restartGame() {
  document.getElementById('endScreen').style.display = 'none';
  startGame();
}

function keyDownHandler(e) {
  socket.emit('keyPress', e.keyCode);
}

function drawGame(gameState) {
  if (!gameStarted) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const [id, paddle] of Object.entries(gameState.players)) {
    ctx.fillStyle = 'black';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  const ball = gameState.ball;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.closePath();

  if (gameState.winner) {
    document.getElementById('winner').innerText = `${gameState.winner} wins! Score: ${gameState.scores[gameState.winner]}`;
    document.getElementById('endScreen').style.display = 'block';
  }
}

// Attach the functions to the window object
window.startGame = startGame;
window.restartGame = restartGame;
