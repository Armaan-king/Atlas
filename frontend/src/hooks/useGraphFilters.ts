import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { getCurrentSemesterWeek } from "./useWeekGraph";
import type { Concept } from "../types";

/**
 * Centralized graph filtering pipeline.
 * Reads graphFilters from the store and returns filtered concepts + connections.
 *
 * Pipeline order:
 *   1. courseIds  — keep only selected courses (empty = all)
 *   2. masteryRange — keep concepts whose mastery is within [min, max]
 *   3. viewMode
 *      - "full"     → no additional filtering
 *      - "week"     → intersect with current syllabus week concept IDs
 *      - "overview" → collapse to one synthetic node per course
 */
export function useGraphFilters() {
  const concepts = useAppStore((s) => s.concepts);
  const connections = useAppStore((s) => s.connections);
  const syllabi = useAppStore((s) => s.syllabi);
  const courses = useAppStore((s) => s.courses);
  const graphFilters = useAppStore((s) => s.graphFilters);

  const { courseIds, masteryRange, viewMode } = graphFilters;

  const filtered = useMemo(() => {
    // 1. Course filter
    let fc: Concept[] =
      courseIds.length > 0
        ? concepts.filter((c) => courseIds.includes(c.course_id))
        : concepts;

    // 2. Mastery range filter
    fc = fc.filter(
      (c) => c.mastery >= masteryRange[0] && c.mastery <= masteryRange[1]
    );

    // Determine active semester courses
    const now = new Date();
    const semesterCourseIds = new Set(
      courses
        .filter((course) => {
          if (!course.start_at) return false;
          const start = new Date(course.start_at);
          const end = course.end_at ? new Date(course.end_at) : null;
          // Course is current if it started before now and ends after now (or hasn't ended)
          return start <= now && (!end || end >= now);
        })
        .map((c) => c.id)
    );

    // 3. View mode
    if (viewMode === "semester") {
      fc = fc.filter((c) => semesterCourseIds.has(c.course_id));
    }

    if (viewMode === "week") {
      const currentWeek = getCurrentSemesterWeek();
      const weekIds = new Set<string>();
      syllabi.forEach((syllabus) => {
        // Only pull week concepts for active semester courses
        if (semesterCourseIds.has(syllabus.course_id)) {
          if (courseIds.length === 0 || courseIds.includes(syllabus.course_id)) {
            const week = syllabus.weeks.find((w) => w.week === currentWeek);
            if (week) week.concept_ids.forEach((id) => weekIds.add(id));
          }
        }
      });
      if (weekIds.size > 0) {
        fc = fc.filter((c) => weekIds.has(c.id));
      }
    }



    // Filter connections so both endpoints are in the filtered concept set
    const conceptIds = new Set(fc.map((c) => c.id));
    const fc_conn = connections.filter(
      (conn) => conceptIds.has(conn.source_id) && conceptIds.has(conn.target_id)
    );

    return { concepts: fc, connections: fc_conn };
  }, [concepts, connections, syllabi, courses, courseIds, masteryRange, viewMode]);

  return filtered;
}
