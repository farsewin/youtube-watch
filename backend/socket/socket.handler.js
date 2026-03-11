const roomService = require('../modules/room/room.service');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Room Events
    socket.on('room:create', ({ roomId, username, videoId }) => {
      const user = { id: socket.id, name: username };
      const room = roomService.createRoom(roomId, socket.id, videoId);
      roomService.joinRoom(roomId, user);
      
      socket.join(roomId);
      socket.emit('room:joined', room);
      io.to(roomId).emit('user:joined', { user, users: room.users });
      console.log(`Room created: ${roomId} by ${username}`);
    });

    socket.on('room:join', ({ roomId, username }) => {
      let room = roomService.getRoom(roomId);
      if (!room) {
        // Feature: Auto-create room if joining doesn't exist
        room = roomService.createRoom(roomId, socket.id, '');
      }
      
      const user = { id: socket.id, name: username };
      roomService.joinRoom(roomId, user);
      
      socket.join(roomId);
      socket.emit('room:joined', room);
      socket.to(roomId).emit('user:joined', { user, users: room.users });
      console.log(`${username} joined room: ${roomId}`);
    });

    socket.on('room:leave', ({ roomId }) => {
      leaveRoomHandler(socket, roomId);
    });

    // Video Sync Events
    socket.on('video:play', ({ roomId, time }) => {
      roomService.updateVideoState(roomId, { playing: true, currentTime: time });
      socket.to(roomId).emit('video:play', { time });
    });

    socket.on('video:pause', ({ roomId, time }) => {
      roomService.updateVideoState(roomId, { playing: false, currentTime: time });
      socket.to(roomId).emit('video:pause', { time });
    });

    socket.on('video:seek', ({ roomId, time }) => {
      roomService.updateVideoState(roomId, { currentTime: time });
      socket.to(roomId).emit('video:seek', { time });
    });

    socket.on('video:state', ({ roomId, state }) => {
      const room = roomService.getRoom(roomId);
      // Only host should send authoritative state
      if (room && room.hostId === socket.id) {
        roomService.updateVideoState(roomId, state);
        socket.to(roomId).emit('video:state', state);
      }
    });

    socket.on('video:change', ({ roomId, videoId }) => {
      const room = roomService.getRoom(roomId);
      if (room && room.hostId === socket.id) {
        roomService.updateVideoState(roomId, { videoId, playing: false, currentTime: 0 });
        io.to(roomId).emit('video:change', { videoId });
      }
    });

    // Chat Events
    socket.on('chat:message', ({ roomId, message, username }) => {
      const msgData = {
        id: Date.now().toString(),
        userId: socket.id,
        username,
        text: message,
        timestamp: new Date()
      };
      io.to(roomId).emit('chat:message', msgData);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Find which rooms the user was in (could be tracked per socket as well)
      // For MVP, we can iterate all rooms since it's in-memory and small
      const rooms = require('../modules/room/room.store');
      for (const roomId in rooms) {
        const room = rooms[roomId];
        if (room.users.find(u => u.id === socket.id)) {
          leaveRoomHandler(socket, roomId, true);
        }
      }
    });
    
    function leaveRoomHandler(socketObj, roomId, disconnected = false) {
       const user = require('../modules/room/room.store')[roomId]?.users.find(u => u.id === socketObj.id);
       const updatedRoom = roomService.leaveRoom(roomId, socketObj.id);
       if (user) {
         io.to(roomId).emit('user:left', { 
           userId: socketObj.id, 
           username: user.name,
           users: updatedRoom ? updatedRoom.users : []
         });
       }
       if (!disconnected) {
         socketObj.leave(roomId);
       }
    }
  });
}

module.exports = setupSocketHandlers;
