import { useState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { useMasteryTracker } from "@/hooks/useMasteryTracker";

interface QuizQuestionData {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizModeProps {
  questions: QuizQuestionData[];
  topic?: string;
}

export function QuizMode({ questions, topic = "" }: QuizModeProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { trackQuizResults } = useMasteryTracker();
  const masteryTracked = useRef(false);

  const q = questions[current];
  const isAnswered = selected !== null;
  const isCorrect = selected === q?.correctIndex;

  const handleSelect = (optIndex: number) => {
    if (isAnswered) return;
    setSelected(optIndex);
    setAnswers((prev) => [...prev, optIndex]);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setShowResults(true);
    }
  };

  useEffect(() => {
    if (showResults && topic && !masteryTracked.current) {
      masteryTracked.current = true;
      trackQuizResults(questions, answers, topic);
    }
  }, [showResults, topic, questions, answers, trackQuizResults]);

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowResults(false);
    masteryTracked.current = false;
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        No quiz questions generated yet.
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const correct = answers.filter(
      (a, i) => a === questions[i].correctIndex
    ).length;
    const pct = Math.round((correct / questions.length) * 100);

    return (
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF5252]/20 flex items-center justify-center">
          <Trophy size={36} className="text-[#FF8A80]" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white/90">{pct}%</h3>
          <p className="text-sm text-white/40 mt-1">
            {correct} of {questions.length} correct
          </p>
        </div>

        {/* Per-question breakdown */}
        <div className="w-full max-w-md space-y-2">
          {questions.map((question, i) => {
            const userAnswer = answers[i];
            const wasCorrect = userAnswer === question.correctIndex;
            return (
              <div
                key={question.id}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm ${
                  wasCorrect
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400/80"
                    : "border-red-500/20 bg-red-500/5 text-red-400/80"
                }`}
              >
                {wasCorrect ? (
                  <CheckCircle2 size={16} className="shrink-0" />
                ) : (
                  <XCircle size={16} className="shrink-0" />
                )}
                <span className="truncate">{question.question}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={restart}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5252] hover:bg-[#FF6B6B] text-white text-sm transition-all"
        >
          <RotateCcw size={14} />
          Retry Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 font-mono">
          Question {current + 1} of {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
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
      <h3 className="text-lg text-white/90 leading-relaxed">{q.question}</h3>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt, i) => {
          let style =
            "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white/90";

          if (isAnswered) {
            if (i === q.correctIndex) {
              style =
                "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
            } else if (i === selected && !isCorrect) {
              style = "border-red-500/40 bg-red-500/10 text-red-300";
            } else {
              style = "border-white/[0.04] bg-white/[0.01] text-white/30";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${style}`}
            >
              <span className="font-mono text-xs mr-3 opacity-50">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation + Next */}
      {isAnswered && (
        <div className="space-y-4 animate-fade-in-up">
          {q.explanation && (
            <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/50 leading-relaxed">
              {q.explanation}
            </div>
          )}
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl bg-[#FF5252] hover:bg-[#FF6B6B] text-white text-sm font-medium transition-all"
          >
            {current < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}
