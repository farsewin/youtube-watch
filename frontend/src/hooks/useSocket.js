import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

// Use environment variable or default to local backend port
const SOCKET_URL = import.meta.env.VITE_API_URL || '';

export default function useSocket({ roomId, username, videoId, autoJoin = true }) {
  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [users, setUsers] = useState([]);
  
  const hasJoined = useRef(false);

  useEffect(() => {
    if (!autoJoin || !roomId || !username) return;
    if (hasJoined.current) return;
    
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('room:join', { roomId, username });
    });

    newSocket.on('room:joined', (room) => {
      // If we joined and there's no video in the room but we passed one in URL
      if (!room.videoId && videoId && room.hostId === newSocket.id) {
        newSocket.emit('video:change', { roomId, videoId });
        room.videoId = videoId;
      }
      setRoomData(room);
      setUsers(room.users);
      hasJoined.current = true;
    });

    newSocket.on('user:joined', ({ users }) => {
      setUsers(users);
    });

    newSocket.on('user:left', ({ users }) => {
      setUsers(users);
    });

    newSocket.on('video:change', ({ videoId }) => {
      setRoomData(prev => prev ? { ...prev, videoId } : null);
    });

    return () => {
      newSocket.emit('room:leave', { roomId });
      newSocket.disconnect();
      hasJoined.current = false;
    };
  }, [roomId, username, videoId, autoJoin]);

  return { socket, roomData, users };
}
