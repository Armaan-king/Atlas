/**
 * StudyLabPane — the inner content of Study Lab with no modal wrapper.
 * Used both inside the standalone StudyLab modal and embedded in Atlas Chat.
 */
import { useState, useEffect, useMemo } from "react";
import { BookOpen, Brain, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { currentCourseIds } from "@/lib/modules";
import { useAppStore } from "@/store/useAppStore";
import { apiPost } from "@/lib/api";
import { FlashcardDeck } from "@/components/study/FlashcardDeck";
import { QuizMode } from "@/components/study/QuizMode";
import { StudyGuideView } from "@/components/study/StudyGuideView";

type ArtifactType = "flashcards" | "quiz" | "study-guide";

const ARTIFACT_OPTIONS: {
  type: ArtifactType;
  icon: typeof BookOpen;
  label: string;
  description: string;
}[] = [
  { type: "flashcards",   icon: Brain,       label: "Flashcards",   description: "Active recall flip cards" },
  { type: "quiz",         icon: HelpCircle,  label: "Quiz",         description: "Multiple choice + scoring" },
  { type: "study-guide",  icon: BookOpen,    label: "Study Guide",  description: "Comprehensive breakdown" },
];

interface FlashcardData  { front: string; back: string; course_id: string }
interface QuizQuestionData { question: string; options: string[]; correct_index: number; explanation: string }
 
export function StudyLabPane({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const courses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const pendingStudyTopic = useAppStore((s) => s.pendingStudyTopic);
  const setPendingStudyTopic = useAppStore((s) => s.setPendingStudyTopic);

  const currentIds = useMemo(
    () => currentCourseIds(courses, customCourses, courseStatus),
    [courses, customCourses, courseStatus],
  );

  const visibleCourses = useMemo(() => {
    const current = courses.filter((course) => currentIds.has(course.id));
    return current.length ? current : courses;
  }, [courses, currentIds]);

  const [courseId, setCourseId]       = useState("");
  const [focusedCourseId, setFocusedCourseId] = useState<string | null>(null);
  const [topic, setTopic]             = useState("");
  const [artifactType, setArtifactType] = useState<ArtifactType>("flashcards");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [generated, setGenerated]     = useState(false);

  const [flashcards, setFlashcards]           = useState<{ id: string; front: string; back: string }[]>([]);
  const [quizQuestions, setQuizQuestions]     = useState<{ id: string; question: string; options: string[]; correctIndex: number; explanation?: string }[]>([]);
  const [studyGuide, setStudyGuide]           = useState("");

  const scopedCourses = useMemo(() => {
    if (!focusedCourseId || visibleCourses.some((course) => course.id === focusedCourseId)) {
      return visibleCourses;
    }
    const focused = courses.find((course) => course.id === focusedCourseId);
    return focused ? [focused, ...visibleCourses] : visibleCourses;
  }, [courses, focusedCourseId, visibleCourses]);

  useEffect(() => {
    if (scopedCourses.some((course) => course.id === courseId)) return;
    setCourseId(scopedCourses[0]?.id ?? "");
  }, [courseId, scopedCourses]);

  // Consume pending topic set from inspector / voice commands
  useEffect(() => {
    if (pendingStudyTopic) {
      if (typeof pendingStudyTopic === "string") {
        setTopic(pendingStudyTopic);
        setFocusedCourseId(null);
      } else {
        setTopic(pendingStudyTopic.topic ?? "");
        setFocusedCourseId(pendingStudyTopic.courseId ?? null);
        if (pendingStudyTopic.courseId) setCourseId(pendingStudyTopic.courseId);
      }
      setPendingStudyTopic(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCourse = scopedCourses.find((c) => c.id === courseId) ?? courses.find((c) => c.id === courseId);

  const handleGenerate = async () => {
    if (!topic.trim() || !courseId) return;
    setLoading(true);
    setError("");
    setGenerated(false);

    try {
      if (artifactType === "flashcards") {
        const res = await apiPost<{ cards: FlashcardData[] }>("/generate/flashcards", {
          course_id: courseId, topic: topic.trim(),
        });
        setFlashcards(res.cards.map((c, i) => ({ id: `fc-${i}`, front: c.front, back: c.back })));

      } else if (artifactType === "quiz") {
        const res = await apiPost<{ questions: QuizQuestionData[] }>("/generate/quiz", {
          course_id: courseId, topic: topic.trim(),
        });
        setQuizQuestions(res.questions.map((q, i) => ({
          id: `q-${i}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correct_index,
          explanation: q.explanation,
        })));

      } else {
        const res = await apiPost<{ content: string }>("/generate/study-guide", {
          course_id: courseId, topic: topic.trim(),
        });
        setStudyGuide(res.content);
      }
      setGenerated(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      // Surface a friendlier message for quota errors
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        setError("AI quota reached — please wait ~30 seconds and try again.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex-1 ${!isEmbedded ? "overflow-y-auto px-5 py-5" : ""}`}>
      {!generated ? (
        <div className="space-y-5">
          {/* Course selector */}
          <div>
            <label className="text-[11px] font-medium tracking-[0.1em] text-white/30 uppercase mb-2 block">
              Course
            </label>
            {visibleCourses.length !== courses.length && (
              <p className="mb-2 text-[11px] leading-relaxed text-white/35">
                Study Lab defaults to your Current modules. Directly focused prerequisite or planned modules stay available when you open them on purpose.
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              {scopedCourses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCourseId(c.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    courseId === c.id
                      ? "border-white/20 bg-white/[0.08] text-white/90"
                      : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: c.color }} />
                  {c.course_code}
                </button>
              ))}
            </div>
          </div>

          {/* Topic input */}
          <div>
            <label className="text-[11px] font-medium tracking-[0.1em] text-white/30 uppercase mb-2 block">
              Topic
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleGenerate()}
              placeholder={selectedCourse ? `e.g. "eigenvalues", "deadlock & scheduling"...` : "Select a module first..."}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#FF6B6B]/50 transition-colors"
            />
          </div>

          {/* Artifact type */}
          <div>
            <label className="text-[11px] font-medium tracking-[0.1em] text-white/30 uppercase mb-2 block">
              Generate
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ARTIFACT_OPTIONS.map(({ type, icon: Icon, label, description }) => (
                <button
                  key={type}
                  onClick={() => setArtifactType(type)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                    artifactType === type
                      ? "border-[#FF6B6B]/40 bg-[#FF6B6B]/10 text-white/90"
                      : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-[10px] text-white/25 leading-tight">{description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || !courseId || loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white text-sm font-medium shadow-lg shadow-[#FF6B6B]/25 hover:shadow-[#FF6B6B]/40 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" />Generating...</>
            ) : (
              <><Sparkles size={16} />Generate {ARTIFACT_OPTIONS.find((a) => a.type === artifactType)?.label}</>
            )}
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setGenerated(false)}
            className="mb-4 text-xs text-white/30 hover:text-white/60 font-mono transition-colors"
          >
            &larr; Generate another
          </button>

          <div className="mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCourse?.color }} />
            <span className="text-xs text-white/40 font-mono">{selectedCourse?.course_code}</span>
            <span className="text-xs text-white/20">/</span>
            <span className="text-xs text-white/60">{topic}</span>
          </div>

          {artifactType === "flashcards" && <FlashcardDeck cards={flashcards} />}
          {artifactType === "quiz"       && <QuizMode questions={quizQuestions} topic={topic} />}
          {artifactType === "study-guide"&& <StudyGuideView content={studyGuide} />}
        </div>
      )}
    </div>
  );
}
