import { X, BookOpen, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { effectiveStatusMap } from "@/lib/modules";
import { useAppStore } from "@/store/useAppStore";
import { useCallback } from "react";


interface InspectorPanelProps {
  onClose: () => void;
}

export function InspectorPanel({ onClose }: InspectorPanelProps) {
  const selectedConceptId = useAppStore((s) => s.selectedConceptId);
  const concepts = useAppStore((s) => s.concepts);
  const connections = useAppStore((s) => s.connections);
  const courses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const setPendingChatPrompt = useAppStore((s) => s.setPendingChatPrompt);
  const setPendingStudyTopic = useAppStore((s) => s.setPendingStudyTopic);
  const setChatModalOpen = useAppStore((s) => s.setChatModalOpen);
  const setStudyLabModalOpen = useAppStore((s) => s.setStudyLabModalOpen);
  const setSpecializedAgent = useAppStore((s) => s.setSpecializedAgent);

  const concept = concepts.find((c) => c.id === selectedConceptId);
  if (!concept) return null;

  const handleStudy = useCallback(() => {
    setPendingStudyTopic({ topic: concept.label, courseId: concept.course_id });
    setStudyLabModalOpen(true);
  }, [concept.course_id, concept.label, setPendingStudyTopic, setStudyLabModalOpen]);

  const course = courses.find((c) => c.id === concept.course_id);
  const color = course?.color ?? "#6b7280";
  const statusLookup = effectiveStatusMap(courses, customCourses, courseStatus);
  const moduleStatus = statusLookup[concept.course_id] ?? "current";
  const courseLabel = course?.course_code ?? concept.course_id.toUpperCase();

  const handleAskAI = useCallback(() => {
    setSpecializedAgent("focus", concept.label);
    setPendingChatPrompt(
      `Explain ${concept.label} in the context of ${courseLabel}. This module is currently marked ${moduleStatus}.`,
    );
    setChatModalOpen(true);
  }, [concept.label, courseLabel, moduleStatus, setPendingChatPrompt, setChatModalOpen, setSpecializedAgent]);

  // Find connected concepts
  const connectedIds = new Set<string>();
  connections.forEach((conn) => {
    if (conn.source_id === concept.id) connectedIds.add(conn.target_id);
    if (conn.target_id === concept.id) connectedIds.add(conn.source_id);
  });
  const connectedConcepts = concepts.filter((c) => connectedIds.has(c.id));

  return (
    <div className="fixed top-6 right-6 w-[280px] z-50 animate-fade-in-up">
      <div className="glass-card p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge
              variant="outline"
              className="text-[10px] font-mono mb-2"
              style={{
                background: `${color}15`,
                color,
                borderColor: `${color}30`,
              }}
            >
              {course?.course_code ?? concept.course_id.toUpperCase()}
            </Badge>
            <h3 className="text-sm font-medium text-white/90">
              {concept.label}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Description */}
        <p className="text-[12px] text-white/50 leading-relaxed mb-4">
          {concept.description}
        </p>

        {/* Mastery */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-white/30 font-mono uppercase">Mastery</span>
            <span className="text-[11px] font-mono" style={{ color }}>
              {concept.mastery}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${concept.mastery}%`, background: color }}
            />
          </div>
        </div>

        {/* Connected Concepts */}
        {connectedConcepts.length > 0 && (
          <div className="mb-4">
            <span className="text-[10px] text-white/30 font-mono uppercase block mb-2">
              Linked Concepts
            </span>
            <div className="flex flex-wrap gap-1">
              {connectedConcepts.map((c) => (
                <span
                  key={c.id}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.06] text-white/40"
                >
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleStudy}
            className="flex-1 text-[11px] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.06]"
          >
            <BookOpen size={12} className="mr-1.5" />
            Study
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAskAI}
            className="flex-1 text-[11px] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.06]"
          >
            <MessageSquare size={12} className="mr-1.5" />
            Ask AI
          </Button>
        </div>
      </div>
    </div>
  );
}
