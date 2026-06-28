import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  correctIndex?: number; // support both naming conventions
  explanation?: string;
}

interface InlineQuizProps {
  questions: QuizQuestion[];
}

export function InlineQuiz({ questions }: InlineQuizProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  if (!questions.length) return null;

  const q = questions[current];
  // Normalize correct index — backend uses correct_index, store uses correctIndex
  const correctIdx = q.correct_index ?? q.correctIndex ?? 0;
  const isAnswered = selected !== null;
  const isCorrect = selected === correctIdx;

  const handleSelect = (i: number) => {
    if (isAnswered) return;
    setSelected(i);
    setAnswers((prev) => [...prev, i]);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setShowResults(true);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowResults(false);
  };

  if (showResults) {
    const correct = answers.filter(
      (a, i) => a === (questions[i].correct_index ?? questions[i].correctIndex ?? 0)
    ).length;
    const pct = Math.round((correct / questions.length) * 100);

    return (
      <div className="mt-2 rounded-xl border border-[#FF6B6B]/20 bg-[#FF6B6B]/[0.05] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
          <span className="text-[10px] font-mono text-[#FF8A80]/70 uppercase tracking-wider">Quiz Results</span>
          <button
            onClick={restart}
            className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
          >
            <RotateCcw size={10} />
            Retry
          </button>
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF5252]/20 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-[#FF8A80]" />
          </div>
          <div>
            <p className="text-base font-bold text-white/90">{pct}%</p>
            <p className="text-[11px] text-white/40">
              {correct} of {questions.length} correct
            </p>
          </div>
        </div>
        <div className="px-3 pb-3 space-y-1">
          {questions.map((question, i) => {
            const ci = question.correct_index ?? question.correctIndex ?? 0;
            const wasCorrect = answers[i] === ci;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] ${
                  wasCorrect
                    ? "bg-emerald-500/10 text-emerald-400/80"
                    : "bg-red-500/10 text-red-400/80"
                }`}
              >
                {wasCorrect ? (
                  <CheckCircle2 size={12} className="shrink-0" />
                ) : (
                  <XCircle size={12} className="shrink-0" />
                )}
                <span className="truncate">{question.question}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-[#FF6B6B]/20 bg-[#FF6B6B]/[0.05] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <span className="text-[10px] font-mono text-[#FF8A80]/70 uppercase tracking-wider">
          Quiz
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i < current
                  ? "bg-[#FF6B6B]"
                  : i === current
                    ? "bg-[#FF8A80] scale-125"
                    : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-sm text-white/85 leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="px-3 pb-3 space-y-1.5">
        {q.options.map((opt, i) => {
          let cls =
            "border-white/[0.08] bg-white/[0.03] text-white/65 hover:bg-white/[0.06] hover:text-white/85";
          if (isAnswered) {
            if (i === correctIdx)
              cls = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
            else if (i === selected && !isCorrect)
              cls = "border-red-500/40 bg-red-500/10 text-red-300";
            else cls = "border-white/[0.04] bg-white/[0.01] text-white/25";
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className={`w-full text-left px-3 py-2 rounded-lg border text-[12px] transition-all ${cls}`}
            >
              <span className="font-mono text-[10px] mr-2 opacity-50">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}

        {isAnswered && (
          <div className="space-y-2 pt-1 animate-fade-in-up">
            {q.explanation && (
              <p className="text-[11px] text-white/40 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] leading-relaxed">
                {q.explanation}
              </p>
            )}
            <button
              onClick={handleNext}
              className="w-full py-2 rounded-lg bg-[#FF5252] hover:bg-[#FF6B6B] text-white text-xs font-medium transition-all"
            >
              {current < questions.length - 1 ? "Next Question →" : "See Results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
