const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let gameState = {
  playerY: 250,
  opponentY: 250,
  ballX: 400,
  ballY: 300,
  ballSpeedX: 5,
  ballSpeedY: 3,
};

let gameInterval;

function updateGame() {
  gameState.ballX += gameState.ballSpeedX;
  gameState.ballY += gameState.ballSpeedY;

  if (gameState.ballY <= 0 || gameState.ballY >= 600) {
    gameState.ballSpeedY = -gameState.ballSpeedY;
  }

  if (gameState.ballX <= 0 || gameState.ballX >= 800) {
    gameState = {
      playerY: 250,
      opponentY: 250,
      ballX: 400,
      ballY: 300,
      ballSpeedX: 5,
      ballSpeedY: 3,
      winner: gameState.ballX <= 0 ? 'Player 2' : 'Player 1'
    };
  }

  broadcast(gameState);
}

function broadcast(state) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(state));
    }
  });
}

wss.on('connection', function connection(ws, req) {
    ws.isPlayerOne = !ws.isPlayerOne;
    
    ws.on('message', function incoming(data) {
      const received = JSON.parse(data);
      if (received.action === 'start') {
        if (!gameInterval) {
          gameInterval = setInterval(updateGame, 1000 / 60);
        }
      } else if (received.action === 'restart') {
        gameState.winner = null;
        gameState.ballX = 400;
        gameState.ballY = 300;
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, 1000 / 60);
      } else if (received.action === 'move') {
        if (ws.isPlayerOne) {
          gameState.playerY = received.y;
        } else {
          gameState.opponentY = received.y;
        }
      }
    });
  });
  
  server.listen(8080);