import { Mic, MicOff } from "lucide-react";

interface VoiceFeedbackProps {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  commandFeedback: string | null;
}

export function VoiceFeedback({
  isListening,
  isSpeaking,
  transcript,
  commandFeedback,
}: VoiceFeedbackProps) {
  if (!isListening && !isSpeaking && !commandFeedback) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#100a0a]/95 border border-white/[0.08] backdrop-blur-xl shadow-2xl shadow-[#FF6B6B]/10">

        {/* Command feedback (non-listening state) */}
        {commandFeedback && !isListening && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF8A80] animate-pulse" />
            <span className="text-sm text-white/70 font-mono">{commandFeedback}</span>
          </div>
        )}

        {/* Listening state */}
        {isListening && (
          <>
            <div className="relative">
              <Mic size={16} className="text-[#FF8A80]" />
              <div className="absolute inset-0 rounded-full bg-[#FF8A80]/20 animate-ping" />
            </div>

            {/* Waveform bars */}
            <div className="flex items-center gap-0.5 h-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>

            <span className="text-sm text-white/50 max-w-[200px] truncate font-mono">
              {transcript || "Listening..."}
            </span>
          </>
        )}

        {/* Speaking state */}
        {isSpeaking && !isListening && !commandFeedback && (
          <>
            <div className="flex items-center gap-0.5 h-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    background: "linear-gradient(to top, #10B981, #3B82F6)",
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-white/40 font-mono">Speaking...</span>
            <MicOff size={14} className="text-white/20" />
          </>
        )}
      </div>
    </div>
  );
}
