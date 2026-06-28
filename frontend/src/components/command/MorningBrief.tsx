import { useState, useCallback } from "react";
import { Play, Square, Volume2 } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";

function generateBriefText(): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    `Good morning. Today is ${today}. ` +
    `Priority alert: SC2002 Lab 3 on Inheritance & Polymorphism is due in 2 days — ` +
    `current completion estimate is 60%. ` +
    `MH2802 Homework 8 on Eigenvalues is due tomorrow. ` +
    `SC2005 Midterm 2 is in 5 days — recommend reviewing virtual memory and process scheduling. ` +
    `Cross-domain insight: Linear transformations from MH2802 map directly to the weight matrices in SC4001 Deep Learning. ` +
    `Leverage this connection for study efficiency.`
  );
}

const WAVEFORM_BARS = 16;

export function MorningBrief() {
  const { speak, stop, isPlaying, isLoading } = useVoice();
  const [briefText] = useState(generateBriefText);

  const handleToggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      speak(briefText);
    }
  }, [isPlaying, speak, stop, briefText]);

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 size={14} className="text-[#FF8A80]" />
          <span className="text-[11px] font-medium tracking-[0.15em] text-white/40 uppercase">
            Morning Brief
          </span>
        </div>
        <span className="text-[10px] text-white/20 font-mono">
          {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className="w-10 h-10 rounded-full bg-[#FF6B6B]/20 border border-[#FF6B6B]/30 flex items-center justify-center text-[#FF8A80] hover:bg-[#FF6B6B]/30 transition-all shrink-0 disabled:opacity-50"
        >
          {isPlaying ? <Square size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        <div className="flex items-end gap-[3px] h-8 flex-1">
          {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
            <div
              key={i}
              className="waveform-bar flex-1 min-w-0"
              style={{
                animationDelay: `${i * 0.08}s`,
                animationPlayState: isPlaying ? "running" : "paused",
                height: isPlaying ? undefined : `${20 + Math.random() * 30}%`,
                opacity: isPlaying ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Transcript */}
      <p className="text-[13px] text-white/50 leading-relaxed flex-1 overflow-auto">
        {briefText}
      </p>
    </div>
  );
}
