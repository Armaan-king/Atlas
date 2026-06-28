import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { Flashcard } from "@/types";

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
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

  const flip = useCallback(() => setFlipped((f) => !f), []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, flip]);

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        No flashcards generated yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/40 font-mono">
          {index + 1} / {cards.length}
        </span>
        <div className="w-40 h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FF6B6B] rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={flip}
      >
        <div
          className="relative w-full h-64 transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#FF6B6B]/10 to-[#FF5252]/10 backdrop-blur-xl flex items-center justify-center p-8"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-white/90 text-center text-lg leading-relaxed">
              {card.front}
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#FF5252]/10 to-[#FF6B6B]/10 backdrop-blur-xl flex items-center justify-center p-8"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-white/80 text-center text-base leading-relaxed">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-[11px] text-white/20 font-mono">
        click to flip &middot; arrow keys to navigate
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          disabled={index === 0}
          className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => {
            setIndex(0);
            setFlipped(false);
          }}
          className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-all"
          title="Restart"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={next}
          disabled={index === cards.length - 1}
          className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
