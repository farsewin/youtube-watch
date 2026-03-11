import { useState, useEffect } from 'react';
import { 
  LiveKitRoom, 
  RoomAudioRenderer,
  useLocalParticipant,
  TrackToggle,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Mic, MicOff, Loader2, AlertCircle, Settings } from 'lucide-react';
import { Track } from 'livekit-client';

const API_URL = import.meta.env.VITE_API_URL || '';
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://your-project.livekit.cloud';

function VoiceControlsInner() {
  const { isMicrophoneEnabled } = useLocalParticipant();
  
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="relative">
         <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 ${isMicrophoneEnabled ? 'bg-primary/50 opacity-100 animate-pulse' : 'opacity-0'}`} />
         <TrackToggle source={Track.Source.Microphone} className="!bg-transparent !border-0 !p-0">
           <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${isMicrophoneEnabled ? 'bg-primary text-white hover:bg-primary/90' : 'bg-surface border border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}>
             {isMicrophoneEnabled ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
           </div>
         </TrackToggle>
      </div>
      <div className="text-center">
        <p className="font-medium text-sm text-gray-200">{isMicrophoneEnabled ? 'Mic Active' : 'Mic Muted'}</p>
        <p className="text-xs text-gray-500 mt-0.5">Click to toggle</p>
      </div>
      <RoomAudioRenderer />
    </div>
  );
}

export default function VoiceControls({ roomId, username }) {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUnconfigured, setIsUnconfigured] = useState(false);

  useEffect(() => {
    if (LIVEKIT_URL.includes('your-project')) {
      setIsUnconfigured(true);
    }
  }, []);

  const handleJoinVoice = () => {
    if (!roomId || !username) return;
    setIsConnecting(true);
    setError(false);
    
    fetch(`${API_URL}/voice/token?roomId=${roomId}&username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.token && data.token !== 'local-fallback-token') {
          setToken(data.token);
        } else {
          setError(true);
        }
      })
      .catch(err => {
        console.error('Failed to fetch LiveKit token:', err);
        setError(true);
      })
      .finally(() => {
        setIsConnecting(false);
      });
  };

  if (isUnconfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 w-full gap-2 px-2">
        <div className="w-10 h-10 rounded-full bg-surface border border-white/5 flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400">Voice Setup Needed</p>
          <p className="text-[10px] mt-0.5 opacity-60 leading-tight">Add LiveKit keys to backend .env</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 w-full gap-2 px-2">
        <AlertCircle className="w-6 h-6 text-danger/50" />
        <p className="text-xs font-medium text-gray-400">Connection Failed</p>
        <button onClick={handleJoinVoice} className="text-[10px] text-primary hover:underline">Retry</button>
      </div>
    );
  }

  if (token) {
    return (
      <LiveKitRoom
        video={false}
        audio={true}
        token={token}
        serverUrl={LIVEKIT_URL}
        connect={true}
        onDisconnected={() => setToken(null)}
      >
        <VoiceControlsInner />
      </LiveKitRoom>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-3">
       <button 
         onClick={handleJoinVoice}
         disabled={isConnecting}
         className="group relative"
       >
         <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all" />
         <div className="relative w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-white">
           {isConnecting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Mic className="w-7 h-7" />}
         </div>
       </button>
       <div className="text-center">
         <p className="text-sm font-semibold text-gray-200">Join Voice Chat</p>
         <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Required for audio</p>
       </div>
    </div>
  );
}
