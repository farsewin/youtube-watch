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

// Catch-all route to serve the frontend for any other requests (SPA support)
app.get('(.*)', (req, res) => {
  if (!req.path.startsWith('/voice/token') && !req.path.startsWith('/api/health')) {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        // If index.html doesn't exist (e.g. hasn't been built yet), just send a message
        res.status(404).send('Frontend not found. Please run npm run build in the frontend folder.');
      }
    });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
