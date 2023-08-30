document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const socket = io.connect("http://localhost:3000");

  let paddleHeight = 100, paddleWidth = 10;
  let myPaddleY = 250, opponentPaddleY = 250;
  let ballX = 400, ballY = 300, ballSpeedX = 5, ballSpeedY = 3;

  document.getElementById("start-button").addEventListener("click", startGame);
  document.getElementById("restart-button").addEventListener("click", resetGame);

  function init() {
    socket.on('updateOpponent', (data) => {
      opponentPaddleY = data.paddleY;
      ballX = data.ballX;
      ballY = data.ballY;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "white";
    ctx.fillRect(0, myPaddleY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, opponentPaddleY, paddleWidth, paddleHeight);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
    ctx.fill();
    
    requestAnimationFrame(draw);
  }

  function resetGame() {
    myPaddleY = 250;
    opponentPaddleY = 250;
    ballX = 400;
    ballY = 300;
    document.getElementById("restart-button").style.display = "none";
    document.getElementById("start-button").style.display = "block";
  }

  function startGame() {
    document.getElementById("start-button").style.display = "none";
    document.getElementById("restart-button").style.display = "block";
    init();
    draw();
  }

  init();
});
