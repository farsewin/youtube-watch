import { Crown, Mic, User } from 'lucide-react';

export default function ParticipantsList({ users, hostId, currentUserId }) {
  if (!users || users.length === 0) return null;

  return (
    <div className="flex gap-4">
      {users.map((user) => {
        const isHost = user.id === hostId;
        const isMe = user.id === currentUserId;
        
        return (
          <div 
            key={user.id} 
            className="flex flex-col items-center gap-2 group w-16"
          >
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold uppercase transition-all duration-300
                ${isMe ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface border border-white/5 text-gray-300'}
                group-hover:-translate-y-1 group-hover:shadow-xl`}>
                {user.name.charAt(0)}
              </div>
              
              {isHost && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-950 p-1 rounded-full shadow-lg" title="Room Host">
                  <Crown className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center flex-1 w-full overflow-hidden">
               <span className="text-xs font-medium text-gray-300 truncate w-full text-center">
                 {user.name}
               </span>
               {isMe && <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">You</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
