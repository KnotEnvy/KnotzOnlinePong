document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const socket = io.connect("http://localhost:3000");

  let paddleHeight = 100, paddleWidth = 10;
  let myPaddleY = 250, opponentPaddleY = 250;
  let ballX = 400, ballY = 300, ballSpeedX = 5, ballSpeedY = 3;
  let isReady = false;
  let gameStarted = false;
  let player1Score = 0, player2Score = 0;

  // Ready button click event
  document.getElementById("ready-button").addEventListener("click", function() {
    isReady = true;
    document.getElementById("ready-screen").style.display = "none";
    socket.emit('playerReady', isReady);
  });

  // Start button click event
  document.getElementById("start-button").addEventListener("click", function() {
    document.getElementById("start-button").style.display = "none";
    document.getElementById("ready-screen").style.display = "block";
    socket.emit('initGame', true);
  });

  // Listen for 'showReadyScreen' event from the server
  socket.on('showReadyScreen', function() {
    document.getElementById("start-button").style.display = "none";
    document.getElementById("ready-screen").style.display = "block";
  });

  // Listen for 'startGame' event from the server
  socket.on('startGame', function() {
    gameStarted = true;
    document.getElementById("ready-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    requestAnimationFrame(draw);
  });
  // Player Controls
  window.addEventListener("keydown", function(evt) {
    switch(evt.key) {
      case "ArrowUp":
        myPaddleY -= 20;
        break;
      case "ArrowDown":
        myPaddleY += 20;
        break;
    }
    socket.emit('sendPlayerData', { paddleY: myPaddleY });
  });

  socket.on('updateOpponent', (data) => {
    opponentPaddleY = data.paddleY;
  });

  function draw() {
    if (!gameStarted) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles and ball
    ctx.fillStyle = "white";
    ctx.fillRect(0, myPaddleY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, opponentPaddleY, paddleWidth, paddleHeight);
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Ball physics and collision detection
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    if (ballY <= 0 || ballY >= canvas.height) {
      ballSpeedY = -ballSpeedY;
    }
    if (ballX <= paddleWidth && ballY > myPaddleY && ballY < myPaddleY + paddleHeight ||
        ballX >= canvas.width - paddleWidth && ballY > opponentPaddleY && ballY < opponentPaddleY + paddleHeight) {
      ballSpeedX = -ballSpeedX;
    }
    if (ballX <= 0) {
      player2Score++;
      document.getElementById("player2-score").textContent = player2Score;
      ballX = canvas.width / 2;
    } else if (ballX >= canvas.width) {
      player1Score++;
      document.getElementById("player1-score").textContent = player1Score;
      ballX = canvas.width / 2;
    }

    requestAnimationFrame(draw);
  }
});