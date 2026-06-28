import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface Card {
  front: string;
  back: string;
}

interface InlineFlashcardsProps {
  cards: Card[];
}

export function InlineFlashcards({ cards }: InlineFlashcardsProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  const next = useCallback(() => {
    if (index < cards.length - 1) {
      setFlipped(false);
      setIndex((i) => i + 1);
    }
  }, [index, cards.length]);

  const prev = useCallback(() => {
    if (index > 0) {
      setFlipped(false);
      setIndex((i) => i - 1);
    }
  }, [index]);

  if (!cards.length) return null;

  return (
    <div className="mt-2 rounded-xl border border-[#FF6B6B]/20 bg-[#FF6B6B]/[0.05] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <span className="text-[10px] font-mono text-[#FF8A80]/70 uppercase tracking-wider">
          Flashcards
        </span>
        <span className="text-[10px] font-mono text-white/30">
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* Card */}
      <div
        className="px-4 py-3 cursor-pointer select-none min-h-[80px] flex items-center justify-center"
        style={{ perspective: "600px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="w-full text-center transition-transform duration-400 relative"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "60px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-sm text-white/85 leading-relaxed">{card.front}</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-sm text-[#FFAB91] leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-[10px] text-white/20 font-mono pb-1">
        {flipped ? "showing answer — tap to flip back" : "tap to reveal answer"}
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.06]">
        <button
          onClick={prev}
          disabled={index === 0}
          className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1">
          {cards.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index ? "bg-[#FF8A80] scale-125" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => { setIndex(0); setFlipped(false); }}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
            title="Restart"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={next}
            disabled={index === cards.length - 1}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
