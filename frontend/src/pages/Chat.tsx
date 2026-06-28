import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { VoiceFeedback } from "@/components/voice/VoiceFeedback";
import { useAppStore } from "@/store/useAppStore";
import { ArtifactRenderer } from "@/components/chat/ArtifactRenderer";
import { StudyLabPane } from "@/components/study/StudyLabPane";
import { Send, Volume2, Loader2, X, Mic, MicOff, MessageSquare, Sparkles } from "lucide-react";

type ChatTab = "chat" | "lab";

interface ChatProps {
  onClose: () => void;
}

export function Chat({ onClose: onCloseProp }: ChatProps) {
  const { messages, loading, send, clearChat } = useChat();
  const { speak, isPlaying, isLoading: voiceLoading } = useVoice();
  const {
    startListening,
    stopListening,
    cancel,
    isListening,
    transcript,
    isSpeaking,
    isSpeakLoading,
    conversationMode,
    toggleConversationMode,
    commandFeedback,
    speechSupported,
  } = useVoiceChat();
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<ChatTab>("chat");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingChatPrompt = useAppStore((s) => s.pendingChatPrompt);
  const setPendingChatPrompt = useAppStore((s) => s.setPendingChatPrompt);
  const specializedAgentLabel = useAppStore((s) => s.specializedAgentLabel);
  const setSpecializedAgent = useAppStore((s) => s.setSpecializedAgent);

  const onClose = () => {
    setSpecializedAgent(null);
    onCloseProp();
  };

  const hasAutoSent = useRef(false);

  // Auto-send pending prompt from InspectorPanel "Ask AI" action
  useEffect(() => {
    if (pendingChatPrompt && !hasAutoSent.current) {
      hasAutoSent.current = true;
      send(pendingChatPrompt);
      setPendingChatPrompt(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingChatPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    send(input);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div className="relative w-[95vw] max-w-6xl h-[85vh] mx-4 flex flex-col rounded-2xl border border-white/[0.08] bg-[#100a0a]/95 backdrop-blur-xl shadow-2xl shadow-[#FF6B6B]/5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${
            tab === "chat" ? "from-[#FF6B6B] to-[#FF5252]" : "from-[#FF6B6B] to-[#FF5252]"
          }`}>
            {tab === "chat"
              ? <span className="text-white font-bold text-sm">A</span>
              : <Sparkles size={16} className="text-white" />
            }
          </div>

          {/* Focus badge */}
          {specializedAgentLabel && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/25 text-red-300">
              <Sparkles size={10} />
              <span className="text-[10px] font-mono truncate max-w-[120px]">Focus: {specializedAgentLabel}</span>
              <button
                onClick={() => setSpecializedAgent(null)}
                className="text-red-400/60 hover:text-red-300 transition-colors ml-0.5"
                title="Clear topic focus"
              >
                <X size={10} />
              </button>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1">
            <button
              onClick={() => setTab("chat")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                tab === "chat"
                  ? "bg-white/[0.08] text-white/90"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setTab("lab")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                tab === "lab"
                  ? "bg-[#FF6B6B]/20 text-[#FFAB91]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <Sparkles size={11} />
              Study Lab
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {tab === "chat" && (
              <button
                onClick={clearChat}
                className="text-[11px] text-white/30 hover:text-white/60 font-mono transition-colors px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Study Lab tab */}
            {tab === "lab" && (
              <motion.div
                key="lab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col overflow-hidden"
              >
                <StudyLabPane />
              </motion.div>
            )}

            {/* Chat tab */}
            {tab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF5252]/20 flex items-center justify-center mb-4">
                        <span className="text-2xl">🧠</span>
                      </div>
                      <p className="text-white/50 text-sm">
                        {specializedAgentLabel
                          ? `Focused on ${specializedAgentLabel}`
                          : "Ask Atlas about your current modules, prerequisites, or next-step planning"}
                      </p>
                      {!specializedAgentLabel && (
                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                          {[
                            "What's due this week?",
                            "Explain eigenvalues simply",
                            "Quiz me on OOP design patterns",
                            "Study plan for SC2005 finals",
                          ].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => setInput(suggestion)}
                              className="px-3 py-1.5 rounded-lg text-xs text-white/50 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70 transition-all"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const isLastMsg = idx === messages.length - 1;
                    const isComplete =
                      msg.role === "user" ||
                      !loading ||
                      !isLastMsg;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-[#FF5252]/80 text-white"
                              : "bg-white/[0.05] text-white/80 border border-white/[0.06]"
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
                              className="mt-2 text-white/30 hover:text-white/60 transition-colors"
                              title="Read aloud"
                            >
                              {voiceLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Volume2 size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {loading && messages[messages.length - 1]?.content === "" && (
                    <div className="flex justify-start">
                      <div className="bg-white/[0.05] border border-white/[0.06] rounded-xl px-4 py-3">
                        <Loader2
                          size={16}
                          className="animate-spin text-[#FF8A80]"
                        />
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Listening indicator */}
                {isListening && (
                  <div className="px-5 py-2 border-t border-white/[0.06] bg-[#FF6B6B]/[0.08] shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                      <span className="text-xs text-white/60 font-mono">Listening...</span>
                      {transcript && (
                        <span className="text-xs text-white/80 ml-2 truncate flex-1">"{transcript}"</span>
                      )}
                      <button onClick={cancel} className="text-xs text-white/30 hover:text-white/60 transition-colors ml-auto">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Speaking indicator */}
                {(isSpeaking || isSpeakLoading) && !isListening && (
                  <div className="px-5 py-2 border-t border-white/[0.06] bg-[#FF6B6B]/[0.08] shrink-0">
                    <div className="flex items-center gap-2">
                      {isSpeakLoading
                        ? <Loader2 size={12} className="animate-spin text-[#FF8A80]" />
                        : <Volume2 size={12} className="text-[#FF8A80] animate-pulse" />
                      }
                      <span className="text-xs text-white/60 font-mono">
                        {isSpeakLoading ? "Generating speech..." : "Atlas is speaking..."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="px-5 py-4 border-t border-white/[0.06] shrink-0">
                  <div className="flex gap-2">
                    {speechSupported && (
                      <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={loading}
                        className={`px-3 rounded-xl transition-all ${
                          isListening
                            ? "bg-red-500/80 hover:bg-red-500 text-white"
                            : "bg-white/[0.06] hover:bg-white/[0.1] text-white/50 hover:text-white/80"
                        } disabled:opacity-30`}
                        title={isListening ? "Stop listening" : "Speak to Atlas"}
                      >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>
                    )}
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder={isListening ? "Listening..." : specializedAgentLabel ? `Ask about ${specializedAgentLabel}...` : "Ask Atlas..."}
                      autoFocus
                      disabled={isListening}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#FF6B6B]/50 transition-colors disabled:opacity-40"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className="px-4 rounded-xl bg-[#FF5252] hover:bg-[#FF6B6B] disabled:bg-white/[0.06] disabled:text-white/20 text-white transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  {speechSupported && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={toggleConversationMode}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                          conversationMode
                            ? "bg-[#FF6B6B]/20 text-[#FFAB91] border border-[#FF6B6B]/30"
                            : "text-white/25 hover:text-white/40"
                        }`}
                      >
                        <MessageSquare size={10} />
                        Conversation mode {conversationMode ? "on" : "off"}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <VoiceFeedback
        isListening={isListening}
        isSpeaking={isSpeaking}
        transcript={transcript}
        commandFeedback={commandFeedback}
      />
    </div>
  );
}
