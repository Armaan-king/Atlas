import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";
import { AetherOrb } from "@/components/voice/AetherOrb";
import { ArtifactRenderer } from "@/components/chat/ArtifactRenderer";
import {
  Send,
  Volume2,
  Loader2,
  Mic,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

interface AetherChatAreaProps {
  onFocusEnter: () => void;
  isExpanded: boolean;
}

export function AetherChatArea({ onFocusEnter, isExpanded }: AetherChatAreaProps) {
  const { messages, loading, send, clearChat } = useChat();
  const { speak, stop, isPlaying, isLoading: voiceLoading } = useVoice();
  const [input, setInput] = useState("");
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [briefText] = useState(() => {
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    return (
      `Good morning. Today is ${today}. ` +
      `Priority alert: SC2002 Lab 5 on Design Patterns is due in 2 days. ` +
      `SC2005 Project 2: Memory Allocator is due tomorrow. ` +
      `SC2001 Assignment 5: Graph Algorithms is due tomorrow. ` +
      `Cross-domain insight: Graph algorithms from SC2001 connect directly to state-space search in SC3000 Artificial Intelligence.`
    );
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onFocusEnter();
    send(input);
    setInput("");
  };

  const handleInputFocus = () => {
    onFocusEnter();
  };

  const handleOrbClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(briefText);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full flex flex-col items-center relative">
      {/* Orb section — shrinks when chat has messages & expanded */}
      <div
        className={`flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          hasMessages && isExpanded
            ? "pt-6 pb-3"
            : "flex-1 min-h-0"
        }`}
      >
        <AetherOrb
          isSpeaking={isPlaying}
          isBriefAvailable={!hasMessages}
          onClick={handleOrbClick}
          isLoading={voiceLoading}
        />
      </div>

      {/* Chat History Overlay — slides down from beneath the orb */}
      <AnimatePresence>
        {isHistoryVisible && hasMessages && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="w-full max-w-xl mx-auto overflow-hidden"
          >
            <div
              className="max-h-[45vh] overflow-y-auto px-4 py-3 rounded-2xl mx-4"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                backdropFilter: "blur(40px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="space-y-3">
                {messages.map((msg, idx) => {
                  const isLastMsg = idx === messages.length - 1;
                  const isComplete =
                    msg.role === "user" || !loading || !isLastMsg;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-4 py-2.5 text-[13px] leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#FF5252]/70 text-white"
                            : "bg-white/[0.04] text-white/75 border border-white/[0.06]"
                        }`}
                      >
                        <ArtifactRenderer
                          content={msg.content}
                          isComplete={isComplete}
                        />
                        {msg.role === "assistant" && msg.content && (
                          <button
                            onClick={() => speak(msg.content)}
                            disabled={voiceLoading || isPlaying}
                            className="mt-1.5 text-white/25 hover:text-white/50 transition-colors"
                          >
                            {voiceLoading ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Volume2 size={12} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading &&
                  messages[messages.length - 1]?.content === "" && (
                    <div className="flex justify-start">
                      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5">
                        <Loader2
                          size={14}
                          className="animate-spin text-[#FF8A80]"
                        />
                      </div>
                    </div>
                  )}
                <div ref={bottomRef} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History toggle + Clear */}
      {hasMessages && (
        <div className="flex items-center gap-3 mt-2 mb-2">
          <button
            onClick={() => setHistoryVisible((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider text-white/30 hover:text-white/60 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
          >
            {isHistoryVisible ? (
              <ChevronUp size={10} />
            ) : (
              <ChevronDown size={10} />
            )}
            {isHistoryVisible ? "Hide" : "Show"} History ({messages.length})
          </button>
          <button
            onClick={clearChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-mono text-white/20 hover:text-white/50 transition-colors"
          >
            <X size={9} />
            Clear
          </button>
        </div>
      )}

      {/* Chat Input */}
      <div className="w-full max-w-xl mx-auto px-4 pb-6 mt-auto">
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3 transition-all duration-300"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          <button
            className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
            title="Voice input"
          >
            <Mic size={16} />
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSend()
            }
            onFocus={handleInputFocus}
            placeholder="Ask Atlas anything..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-[#FF5252] hover:bg-[#FF6B6B] disabled:bg-white/[0.04] disabled:text-white/15 text-white transition-all"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
