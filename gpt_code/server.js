const path = require('path');
const express = require('express');
const cors = require('cors');  // <-- add this line
const http = require('http');
const socketIO = require('socket.io');

const app = express();
app.use(cors());  // <-- add this line

const server = http.Server(app);

// Include CORS options
const io = socketIO(server, {
  cors: {
    origin: "http://127.0.0.1:3000",
    methods: ["GET", "POST"]
  }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('sendPlayerData', (data) => {
    socket.broadcast.emit('updateOpponent', data);
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
