require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const setupSocketHandlers = require('./socket/socket.handler');
const livekitController = require('./modules/voice/livekit.controller');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' })); // Allow all origins for MVP
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup Socket.io
setupSocketHandlers(io);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/voice/token', livekitController.getToken);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
