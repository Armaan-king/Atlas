import {
  X,
  BookOpen,
  Brain,
  HelpCircle,
  MessageSquare,
  Loader2,
  ChevronLeft,
  Network,
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { effectiveStatusMap } from "@/lib/modules";
import { useAppStore } from "@/store/useAppStore";
import { useCallback, useState } from "react";
import { apiPost } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlashcardDeck } from "@/components/study/FlashcardDeck";
import { QuizMode } from "@/components/study/QuizMode";
import { StudyGuideView } from "@/components/study/StudyGuideView";

interface ConceptInspectorProps {
  onClose?: () => void;
}

type ArtifactType = "flashcards" | "quiz" | "study-guide";

interface FlashcardData { front: string; back: string; course_id: string }
interface QuizQuestionData { question: string; options: string[]; correct_index: number; explanation: string }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ConceptInspector({ onClose }: ConceptInspectorProps) {
  const selectedConceptId = useAppStore((s) => s.selectedConceptId);
  const setSelectedConceptId = useAppStore((s) => s.setSelectedConceptId);
  const concepts = useAppStore((s) => s.concepts);
  const connections = useAppStore((s) => s.connections);
  const courses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const setPendingChatPrompt = useAppStore((s) => s.setPendingChatPrompt);
  const conceptArtifacts = useAppStore((s) => s.conceptArtifacts);
  const setConceptArtifact = useAppStore((s) => s.setConceptArtifact);
  const setSpecializedAgent = useAppStore((s) => s.setSpecializedAgent);
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  const concept = concepts.find((c) => c.id === selectedConceptId);

  // Artifact modal state
  const [activeArtifact, setActiveArtifact] = useState<ArtifactType | null>(null);
  const [artifactLoading, setArtifactLoading] = useState(false);
  const [artifactError, setArtifactError] = useState("");
  const [flashcards, setFlashcards] = useState<{ id: string; front: string; back: string }[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<{ id: string; question: string; options: string[]; correctIndex: number; explanation?: string }[]>([]);
  const [studyGuide, setStudyGuide] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const statusLookup = effectiveStatusMap(courses, customCourses, courseStatus);

  const handleAskAI = useCallback(() => {
    if (!concept) return;
    const course = courses.find((item) => item.id === concept.course_id);
    const courseLabel = course?.course_code ?? concept.course_id.toUpperCase();
    const moduleStatus = statusLookup[concept.course_id] ?? "current";
    setSpecializedAgent("focus", concept.label);
    setPendingChatPrompt(
      `Explain ${concept.label} in the context of ${courseLabel}. This module is currently marked ${moduleStatus}.`,
    );
    setCurrentView("command");
    onClose?.(); // Close the sidebar so they enter command center cleanly
  }, [concept, courses, statusLookup, setPendingChatPrompt, setSpecializedAgent, setCurrentView, onClose]);

  const handleGenerateArtifact = useCallback(async (type: ArtifactType) => {
    if (!concept) return;
    setActiveArtifact(type);
    setArtifactLoading(true);
    setArtifactError("");
    setHasGenerated(false);

    try {
      const now = new Date().toISOString();

      if (type === "flashcards") {
        const res = await apiPost<{ cards: FlashcardData[] }>("/generate/flashcards", {
          course_id: concept.course_id, topic: concept.label,
        });
        const cards = res.cards.map((c, i) => ({ id: `fc-${i}`, front: c.front, back: c.back }));
        setFlashcards(cards);
        setConceptArtifact(concept.id, { flashcards: { cards, savedAt: now } });
      } else if (type === "quiz") {
        const res = await apiPost<{ questions: QuizQuestionData[] }>("/generate/quiz", {
          course_id: concept.course_id, topic: concept.label,
        });
        const questions = res.questions.map((q, i) => ({
          id: `q-${i}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correct_index,
          explanation: q.explanation,
        }));
        setQuizQuestions(questions);
        setConceptArtifact(concept.id, { quiz: { questions, savedAt: now } });
      } else {
        const res = await apiPost<{ content: string }>("/generate/study-guide", {
          course_id: concept.course_id, topic: concept.label,
        });
        setStudyGuide(res.content);
        setConceptArtifact(concept.id, { studyGuide: { content: res.content, savedAt: now } });
      }
      setHasGenerated(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        setArtifactError("AI quota reached — please wait ~30 seconds and try again.");
      } else {
        setArtifactError(msg);
      }
    } finally {
      setArtifactLoading(false);
    }
  }, [concept, setConceptArtifact]);

  const handleViewSaved = useCallback((type: ArtifactType) => {
    if (!concept) return;
    const saved = conceptArtifacts[concept.id];
    if (!saved) return;

    if (type === "flashcards" && saved.flashcards) {
      setFlashcards(saved.flashcards.cards);
      setActiveArtifact("flashcards");
      setHasGenerated(true);
    } else if (type === "quiz" && saved.quiz) {
      setQuizQuestions(saved.quiz.questions);
      setActiveArtifact("quiz");
      setHasGenerated(true);
    } else if (type === "study-guide" && saved.studyGuide) {
      setStudyGuide(saved.studyGuide.content);
      setActiveArtifact("study-guide");
      setHasGenerated(true);
    }
    setArtifactError("");
    setArtifactLoading(false);
  }, [concept, conceptArtifacts]);

  const handleCloseArtifact = useCallback(() => {
    setActiveArtifact(null);
    setHasGenerated(false);
    setArtifactError("");
  }, []);

  if (!concept) return null;

  const course = courses.find((c) => c.id === concept.course_id);
  const color = course?.color ?? "#6b7280";

  // Find connected concepts
  const connectedIds = new Set<string>();
  connections.forEach((conn) => {
    if (conn.source_id === concept.id) connectedIds.add(conn.target_id);
    if (conn.target_id === concept.id) connectedIds.add(conn.source_id);
  });
  const connectedConcepts = concepts.filter((c) => connectedIds.has(c.id));

  // Saved artifacts for this concept
  const saved = conceptArtifacts[concept.id];
  const hasSavedArtifacts = saved && (saved.flashcards || saved.quiz || saved.studyGuide);

  const artifactLabel =
    activeArtifact === "study-guide" ? "Study Guide"
    : activeArtifact === "flashcards" ? "Flashcards"
    : "Quiz";

  return (
    <>
      {/* ── Artifact Center Modal ── */}
      <Dialog open={!!activeArtifact} onOpenChange={(open) => !open && handleCloseArtifact()}>
        <DialogContent
          className="w-[85vw] sm:max-w-4xl h-[85vh] flex flex-col bg-[#100a0a]/98 border-white/[0.08] text-white p-0 data-open:zoom-in-100 data-closed:zoom-out-100 data-open:slide-in-from-right-[50%] data-closed:slide-out-to-right-[50%] data-open:duration-500 data-closed:duration-300 ease-out"
          showCloseButton={false}
        >
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  {activeArtifact === "flashcards" && <Brain size={12} className="text-red-400" />}
                  {activeArtifact === "quiz" && <HelpCircle size={12} className="text-red-400" />}
                  {activeArtifact === "study-guide" && <BookOpen size={12} className="text-red-400" />}
                  <span className="text-[11px] text-red-400 font-medium">{artifactLabel}</span>
                </div>
                <DialogTitle className="text-sm font-medium text-white/80">
                  {concept.label}
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                {hasGenerated && !artifactLoading && (
                  <button
                    onClick={() => handleGenerateArtifact(activeArtifact!)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] text-white/25 bg-white/[0.03] border border-white/[0.06] hover:text-white/50 hover:bg-white/[0.06] transition-all"
                  >
                    <RefreshCw size={10} />
                    Regenerate
                  </button>
                )}
                <button
                  onClick={handleCloseArtifact}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="px-6 py-5">
              {/* Loading */}
              {artifactLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                    <Sparkles size={20} className="text-red-400 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-red-400" />
                    <span className="text-xs text-white/40 font-mono">
                      Generating {activeArtifact === "study-guide" ? "study guide" : activeArtifact}...
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {artifactError && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-4">
                  {artifactError}
                  <button
                    onClick={() => handleGenerateArtifact(activeArtifact!)}
                    className="block mt-2 text-xs text-red-300 hover:text-red-200 underline transition-colors"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Rendered artifact */}
              {hasGenerated && !artifactLoading && (
                <>
                  {activeArtifact === "flashcards" && <FlashcardDeck cards={flashcards} />}
                  {activeArtifact === "quiz" && <QuizMode questions={quizQuestions} topic={concept.label} />}
                  {activeArtifact === "study-guide" && <StudyGuideView content={studyGuide} />}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Right Sidebar (always visible) ── */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06]">
          <button
            onClick={() => {
              setSelectedConceptId(null);
              onClose?.();
            }}
            className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors mb-4 uppercase tracking-wider"
          >
            <ChevronLeft size={12} />
            Back to Lattice
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Network size={12} className="text-blue-400" />
            <span className="text-blue-400 text-[10px] font-mono tracking-[0.1em] uppercase">
              Knowledge Node
            </span>
          </div>

          <h2 className="text-base font-medium text-white/90 mb-2">{concept.label}</h2>

          <Badge
            variant="outline"
            className="text-[10px] font-mono"
            style={{
              background: `${color}15`,
              color,
              borderColor: `${color}30`,
            }}
          >
            {course?.course_code ?? concept.course_id.toUpperCase()}
          </Badge>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-6">
            {/* Description */}
            <section>
              <h3 className="text-[10px] font-mono tracking-wider text-white/30 uppercase mb-2">Context</h3>
              <p className="text-[12px] text-white/50 leading-relaxed font-outfit">
                {concept.description}
              </p>
            </section>

            {/* Mastery Section */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Mastery Index</span>
                <span className="text-[12px] font-mono" style={{ color }}>
                  {concept.mastery}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${concept.mastery}%`, background: color }}
                />
              </div>
            </section>

            {/* Connections Section */}
            {connectedConcepts.length > 0 && (
              <section>
                <h3 className="text-[10px] font-mono tracking-wider text-white/30 uppercase mb-3">
                  Lattice Connections
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {connectedConcepts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConceptId(c.id)}
                      className="text-[10px] px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Saved Study Materials */}
            {hasSavedArtifacts && (
              <section>
                <h3 className="text-[10px] font-mono tracking-wider text-white/30 uppercase mb-3">
                  Saved Materials
                </h3>
                <div className="flex flex-col gap-1.5">
                  {saved?.flashcards && (
                    <button
                      onClick={() => handleViewSaved("flashcards")}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-red-500/15 bg-red-500/[0.04] text-white/60 hover:text-white/90 hover:bg-red-500/10 transition-all w-full text-left"
                    >
                      <Brain size={13} className="text-red-400/70 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium">Flashcards</span>
                        <span className="text-[10px] text-white/25 ml-1.5">
                          {saved.flashcards.cards.length} cards
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-white/20 shrink-0">
                        <Clock size={9} />
                        {timeAgo(saved.flashcards.savedAt)}
                      </div>
                    </button>
                  )}
                  {saved?.quiz && (
                    <button
                      onClick={() => handleViewSaved("quiz")}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-red-500/15 bg-red-500/[0.04] text-white/60 hover:text-white/90 hover:bg-red-500/10 transition-all w-full text-left"
                    >
                      <HelpCircle size={13} className="text-red-400/70 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium">Quiz</span>
                        <span className="text-[10px] text-white/25 ml-1.5">
                          {saved.quiz.questions.length} questions
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-white/20 shrink-0">
                        <Clock size={9} />
                        {timeAgo(saved.quiz.savedAt)}
                      </div>
                    </button>
                  )}
                  {saved?.studyGuide && (
                    <button
                      onClick={() => handleViewSaved("study-guide")}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-red-500/15 bg-red-500/[0.04] text-white/60 hover:text-white/90 hover:bg-red-500/10 transition-all w-full text-left"
                    >
                      <BookOpen size={13} className="text-red-400/70 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium">Study Guide</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-white/20 shrink-0">
                        <Clock size={9} />
                        {timeAgo(saved.studyGuide.savedAt)}
                      </div>
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Generate Study Material */}
            <section>
              <h3 className="text-[10px] font-mono tracking-wider text-white/30 uppercase mb-3">
                {hasSavedArtifacts ? "Generate New" : "Study Material"}
              </h3>
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {[
                  { type: "flashcards" as ArtifactType, icon: Brain, label: "Flashcards" },
                  { type: "quiz" as ArtifactType, icon: HelpCircle, label: "Quiz" },
                  { type: "study-guide" as ArtifactType, icon: BookOpen, label: "Guide" },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => handleGenerateArtifact(type)}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/80 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
                  >
                    <Icon size={16} className="group-hover:text-red-400 transition-colors" />
                    <span className="text-[10px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Intelligence Actions */}
            <section className="space-y-2">
              <h3 className="text-[10px] font-mono tracking-wider text-white/30 uppercase mb-3">
                Intelligence Actions
              </h3>
              <Button
                variant="outline"
                onClick={handleAskAI}
                className="w-full text-[11px] h-9 border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.06]"
              >
                <MessageSquare size={12} className="mr-1.5" />
                Ask AI
              </Button>
            </section>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
