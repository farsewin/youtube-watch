import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractYouTubeId } from '../utils/youtube';
import { Play, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    const videoId = extractYouTubeId(url);
    if (!videoId && url.trim()) {
      setError('Invalid YouTube URL');
      return;
    }

    const roomId = Math.random().toString(36).substring(2, 8);
    navigate(`/room/${roomId}?name=${encodeURIComponent(name.trim())}${videoId ? `&videoId=${videoId}` : ''}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6 shadow-lg shadow-primary/20 backdrop-blur-md">
          <Play className="w-12 h-12 text-primary" fill="currentColor" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-white">
          Sync<span className="text-gradient">Watch</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-lg mx-auto">
          Experience YouTube together in perfect sync with real-time text and voice chat.
        </p>
      </div>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 transition-all duration-300 hover:shadow-primary/10">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-danger/10 text-danger px-4 py-3 rounded-xl text-sm border border-danger/20 flex items-center gap-2">
               <Sparkles className="w-4 h-4" /> {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Your Name</label>
            <input 
              type="text" 
              placeholder="Enter your nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">YouTube URL <span className="text-gray-500">(Optional)</span></label>
            <input 
              type="text" 
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field"
            />
          </div>

          <button type="submit" className="btn-primary w-full py-3.5 mt-4 text-lg font-semibold rounded-xl">
            <Sparkles className="w-5 h-5" />
            Create Watch Party
          </button>
        </form>
      </div>
      
      <p className="text-gray-500 mt-12 text-sm flex items-center gap-2">
        No accounts required. Instant rooms.
      </p>
    </div>
  );
}
