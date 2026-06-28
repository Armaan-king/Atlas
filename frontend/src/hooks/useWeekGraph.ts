import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { layoutGraph } from "../lib/graph-layout";
import type { Node, Edge } from "@xyflow/react";

const SEMESTER_START = new Date("2026-01-22T00:00:00Z");

/** Returns the current week number (1-indexed, clamped to 1–15). */
export function getCurrentSemesterWeek(): number {
  const now = new Date();
  const elapsed = now.getTime() - SEMESTER_START.getTime();
  const week = Math.ceil(elapsed / (7 * 24 * 60 * 60 * 1000));
  return Math.min(15, Math.max(1, week));
}

export function useWeekGraph() {
  const syllabi = useAppStore((s) => s.syllabi);
  const concepts = useAppStore((s) => s.concepts);
  const connections = useAppStore((s) => s.connections);
  const courses = useAppStore((s) => s.courses);
  const storedHighlightWeek = useAppStore((s) => s.highlightWeek);
  const activeCourseId = useAppStore((s) => s.activeCourseId);

  // Fall back to auto-detected current week when no manual week is set
  const highlightWeek = storedHighlightWeek ?? getCurrentSemesterWeek();

  const courseColorMap = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((c) => map.set(c.id, c.color));
    return map;
  }, [courses]);

  const weekConceptIds = useMemo(() => {
    if (highlightWeek === null) return null;

    const ids = new Set<string>();
    const targetSyllabi = activeCourseId
      ? syllabi.filter((s) => s.course_id === activeCourseId)
      : syllabi;

    for (const syllabus of targetSyllabi) {
      const week = syllabus.weeks.find((w) => w.week === highlightWeek);
      if (week) {
        week.concept_ids.forEach((id) => ids.add(id));
      }
    }
    return ids;
  }, [syllabi, highlightWeek, activeCourseId]);

  const { nodes, edges } = useMemo(() => {
    if (!weekConceptIds || weekConceptIds.size === 0) {
      return { nodes: [], edges: [] };
    }

    const weekConcepts = concepts.filter((c) => weekConceptIds.has(c.id));

    const weekConnections = connections.filter(
      (c) => weekConceptIds.has(c.source_id) && weekConceptIds.has(c.target_id),
    );

    const positions = layoutGraph(weekConcepts, weekConnections);
    const posMap = new Map(positions.map((p) => [p.id, p]));

    const nodes: Node[] = weekConcepts.map((concept) => {
      const pos = posMap.get(concept.id) ?? { x: 0, y: 0 };
      return {
        id: concept.id,
        type: "concept",
        position: { x: pos.x, y: pos.y },
        data: {
          label: concept.label,
          description: concept.description,
          mastery: concept.mastery,
          course_id: concept.course_id,
          color: courseColorMap.get(concept.course_id) ?? "#6b7280",
          week: highlightWeek,
        },
      };
    });

    const edges: Edge[] = weekConnections.map((conn) => ({
      id: conn.id,
      source: conn.source_id,
      target: conn.target_id,
      label: conn.label,
      animated: conn.cross_course,
      style: {
        stroke: conn.cross_course
          ? "#f59e0b"
          : courseColorMap.get(
              concepts.find((c) => c.id === conn.source_id)?.course_id ?? "",
            ) ?? "#6b7280",
        strokeWidth: 2,
      },
    }));

    return { nodes, edges };
  }, [weekConceptIds, concepts, connections, courseColorMap, highlightWeek]);

  return { nodes, edges, highlightWeek, currentWeek: highlightWeek };
}
