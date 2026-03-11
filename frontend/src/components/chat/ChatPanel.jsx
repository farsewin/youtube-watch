import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";

export default function ChatPanel({ socket, username, roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.on("chat:message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("chat:message");
    };
  }, [socket]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && socket) {
      socket.emit("chat:message", { roomId, username, message: input.trim() });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 bg-black/20 flex items-center gap-2 shrink-0">
        <MessageSquare className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-gray-200">Room Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.username === username;
          return (
            <div
              key={idx}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={`text-xs font-medium ${isMe ? "text-purple-400" : "text-primary"}`}
                >
                  {msg.username}
                </span>
                <span className="text-[10px] text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div
                className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? "bg-purple-500/20 text-purple-100 rounded-tr-none border border-purple-500/20" : "bg-white/5 text-gray-200 rounded-tl-none border border-white/5"}`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 bg-black/40 border-t border-white/5 shrink-0 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="input-field flex-1 py-2.5 text-sm bg-black/60 border-transparent focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="btn-primary !p-3 !bg-purple-500 hover:!bg-purple-600 !shadow-purple-500/20 rounded-xl"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
