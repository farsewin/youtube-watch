const rooms = require('./room.store');

function createRoom(roomId, hostId, videoId = '') {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      hostId,
      videoId,
      playing: false,
      currentTime: 0,
      users: [],
      lastUpdate: Date.now()
    };
  }
  return rooms[roomId];
}

function getRoom(roomId) {
  return rooms[roomId];
}

function joinRoom(roomId, user) {
  const room = rooms[roomId];
  if (room) {
    const exists = room.users.find(u => u.id === user.id);
    if (!exists) {
      room.users.push(user);
    }
  }
  return room;
}

function leaveRoom(roomId, userId) {
  const room = rooms[roomId];
  if (room) {
    room.users = room.users.filter(u => u.id !== userId);
    // If the room is empty, we delete it to save memory
    if (room.users.length === 0) {
      delete rooms[roomId];
    } else if (room.hostId === userId) {
      // Reassign host if the host leaves
      room.hostId = room.users[0].id;
    }
  }
  return rooms[roomId]; // Returns undefined if deleted
}

function updateVideoState(roomId, state) {
  const room = rooms[roomId];
  if (room) {
    room.videoId = state.videoId !== undefined ? state.videoId : room.videoId;
    room.playing = state.playing !== undefined ? state.playing : room.playing;
    room.currentTime = state.currentTime !== undefined ? state.currentTime : room.currentTime;
    room.lastUpdate = Date.now();
  }
  return room;
}

module.exports = {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  updateVideoState
};
