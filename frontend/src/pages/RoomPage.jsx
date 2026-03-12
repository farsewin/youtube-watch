import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/video/VideoPlayer';
import ChatPanel from '../components/chat/ChatPanel';
import VoiceControls from '../components/voice/VoiceControls';
import ParticipantsList from '../components/voice/ParticipantsList';
import useSocket from '../hooks/useSocket';
import { LayoutGrid, Users, LogOut } from 'lucide-react';

export default function RoomPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialName = searchParams.get('name');
  const initialVideoId = searchParams.get('videoId');

  const [name, setName] = useState(initialName || '');
  const [tempName, setTempName] = useState('');
  const [joined, setJoined] = useState(!!initialName);
  
  const { socket, roomData, users } = useSocket({ 
    roomId, 
    username: name,
    videoId: initialVideoId,
    autoJoin: joined 
  });

  const handleLeave = () => {
    if (socket) {
      socket.emit('room:leave', { roomId });
      socket.disconnect();
    }
    navigate('/');
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setName(tempName.trim());
      setJoined(true);
    }
  };

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0d]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="glass-panel p-8 rounded-3xl w-full max-w-sm relative z-10 shadow-2xl">
           <h2 className="text-2xl font-bold mb-6 text-center text-white">Join Room <span className="text-primary">{roomId}</span></h2>
           <form onSubmit={handleJoin} className="space-y-4">
             <input 
               type="text" 
               placeholder="Enter your name" 
               className="input-field" 
               autoFocus 
               value={tempName} 
               onChange={e => setTempName(e.target.value)} 
               maxLength={20}
             />
             <button type="submit" className="btn-primary w-full py-3.5 shadow-lg shadow-primary/20">
               Join Watch Party
             </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0d] text-white overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface/30 backdrop-blur-xl z-20 shrink-0">
        <div className="flex items-center gap-3 cursor-default">
          <div className="p-2 bg-primary/20 rounded-lg">
            <LayoutGrid className="text-primary w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-wide">Sync<span className="text-gradient">Watch</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 text-sm bg-black/40 px-4 py-1.5 rounded-full border border-white/5 hover:border-white/10 transition-colors shadow-inner">
              <span className="text-gray-400">Room</span>
              <span className="font-mono text-primary font-bold tracking-wider select-all">{roomId}</span>
           </div>
           
           <div className="flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 text-gray-300">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">{users.length}</span>
           </div>

           <button
             onClick={handleLeave}
             title="Leave Room"
             className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
           >
             <LogOut className="w-4 h-4" />
             <span className="hidden sm:inline">Leave</span>
           </button>
         </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 w-full max-w-[1920px] mx-auto gap-4 p-4">
         {/* Video and Voice Section */}
         <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
            {/* Video Container */}
            <div className="flex-1 rounded-3xl overflow-hidden glass-panel flex items-center justify-center bg-black/40 shadow-2xl border border-white/5 relative">
               <VideoPlayer socket={socket} roomData={roomData} isHost={roomData?.hostId === socket?.id} roomId={roomId} />
            </div>
            
             {/* Voice Controls / Participants Panel */}
            <div className="shrink-0 h-40 glass-panel rounded-3xl p-5 overflow-hidden border border-white/5 shadow-xl flex gap-6">
               <div className="w-48 shrink-0 flex flex-col justify-center items-center border-r border-white/5 pr-6">
                 <VoiceControls roomId={roomId} username={name} />
               </div>
               <div className="flex-1 overflow-x-auto flex items-center">
                 <ParticipantsList users={users} hostId={roomData?.hostId} currentUserId={socket?.id} />
               </div>
            </div>
         </div>
         
         {/* Chat Panel */}
         <div className="w-full lg:w-96 flex-shrink-0 flex flex-col rounded-3xl overflow-hidden glass-panel border border-white/5 shadow-2xl relative">
            <ChatPanel socket={socket} username={name} roomId={roomId} />
         </div>
      </div>
    </div>
  );
}
