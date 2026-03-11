import { useEffect, useRef, useState } from 'react';
import { extractYouTubeId } from '../../utils/youtube';

export default function VideoPlayer({ socket, roomData, isHost, roomId }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [urlInput, setUrlInput] = useState('');
  const [isApiReady, setIsApiReady] = useState(false);

  // 1. Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) {
      setIsApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };
  }, []);

  // 2. Initialize Player
  useEffect(() => {
    if (!isApiReady || !containerRef.current) return;

    const currentVideoId = roomData?.videoId || 'dQw4w9WgXcQ';

    const player = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: currentVideoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin
      },
      events: {
        onStateChange: (event) => {
          if (!isHost) return;
          
          const time = player.getCurrentTime();
          // YT.PlayerState.PLAYING = 1
          // YT.PlayerState.PAUSED = 2
          if (event.data === window.YT.PlayerState.PLAYING) {
            socket.emit('video:play', { roomId, time });
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            socket.emit('video:pause', { roomId, time });
          }
        },
      }
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isApiReady]);

  // 3. Handle Guest Syncing
  useEffect(() => {
    if (!socket || isHost) return;

    const handlePlay = ({ time }) => {
      const p = playerRef.current;
      if (p && p.getPlayerState) {
        if (Math.abs(p.getCurrentTime() - time) > 1.5) {
          p.seekTo(time, true);
        }
        p.playVideo();
      }
    };

    const handlePause = ({ time }) => {
      const p = playerRef.current;
      if (p && p.getPlayerState) {
        if (Math.abs(p.getCurrentTime() - time) > 1.5) {
          p.seekTo(time, true);
        }
        p.pauseVideo();
      }
    };

    const handleSeek = ({ time }) => {
      const p = playerRef.current;
      if (p && p.seekTo) {
        p.seekTo(time, true);
      }
    };

    const handleState = (state) => {
      const p = playerRef.current;
      if (!p || !p.getPlayerState) return;

      const drift = Math.abs(p.getCurrentTime() - state.currentTime);
      if (drift > 2.5) {
        p.seekTo(state.currentTime, true);
      }

      if (state.playing && p.getPlayerState() !== window.YT.PlayerState.PLAYING) {
        p.playVideo();
      } else if (!state.playing && p.getPlayerState() === window.YT.PlayerState.PLAYING) {
        p.pauseVideo();
      }
    };

    socket.on('video:play', handlePlay);
    socket.on('video:pause', handlePause);
    socket.on('video:seek', handleSeek);
    socket.on('video:state', handleState);

    return () => {
      socket.off('video:play', handlePlay);
      socket.off('video:pause', handlePause);
      socket.off('video:seek', handleSeek);
      socket.off('video:state', handleState);
    };
  }, [socket, isHost]);

  // 4. Host Periodic Sync
  useEffect(() => {
    if (!isHost || !socket) return;

    const interval = setInterval(() => {
      const p = playerRef.current;
      if (p && p.getPlayerState) {
        socket.emit('video:state', {
          roomId,
          state: {
            playing: p.getPlayerState() === window.YT.PlayerState.PLAYING,
            currentTime: p.getCurrentTime()
          }
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHost, socket, roomId]);

  // 5. Handle Video Change
  useEffect(() => {
    const p = playerRef.current;
    if (roomData?.videoId && p && p.loadVideoById) {
      const currentUrl = p.getVideoUrl();
      if (!currentUrl.includes(roomData.videoId)) {
        p.loadVideoById(roomData.videoId);
      }
    }
  }, [roomData?.videoId]);

  const handleChangeVideo = (e) => {
    e.preventDefault();
    const videoId = extractYouTubeId(urlInput);
    if (videoId && socket && isHost) {
      socket.emit('video:change', { roomId, videoId });
      setUrlInput('');
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-black overflow-hidden group">
      <div className="flex-1 w-full relative h-[calc(100%-50px)]">
         <div className="absolute inset-0 w-full h-full pointer-events-auto">
            <div ref={containerRef} />
         </div>
         
         {/* Overlay to block guest interactions but keep UI visible */}
         {!isHost && (
           <div className="absolute inset-0 z-10 cursor-not-allowed" title="Only the host can control the video" />
         )}
      </div>
      
      {/* Host Control Bar Overlay */}
      {isHost && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          <form onSubmit={handleChangeVideo} className="flex gap-2 bg-black/60 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-2xl">
            <input 
              type="text" 
              placeholder="Paste YouTube Link..." 
              className="input-field py-1.5 px-3 text-sm flex-1 bg-black/40 border-transparent focus:ring-1 focus:ring-primary/50"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
            />
            <button type="submit" className="btn-primary py-1.5 px-4 text-sm font-semibold rounded-lg shrink-0">Change</button>
          </form>
        </div>
      )}
    </div>
  );
}
