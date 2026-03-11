require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const setupSocketHandlers = require('./socket/socket.handler');
const livekitController = require('./modules/voice/livekit.controller');

const path = require('path');

const app = express();
const server = http.createServer(app);

// Serving static files from the frontend/dist folder
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

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

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/voice/token', livekitController.getToken);

// Catch-all: serve frontend index.html for all non-API routes (SPA support)
// Using app.use() to avoid Express 5 path-to-regexp wildcard restrictions
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend not built. Run: cd frontend && npm run build');
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
