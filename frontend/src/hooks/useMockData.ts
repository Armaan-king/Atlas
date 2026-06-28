import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { apiGet } from "../lib/api";
import type { Course, Assignment, Announcement, Concept, Connection, Syllabus } from "../types";

// ─── API response shapes (backend may have fewer fields than frontend types) ──

interface RawCourse {
  id: string;
  course_code: string;
  name: string;
  workflow_state?: string;
  start_at?: string;
  end_at?: string;
  created_at?: string;
  time_zone?: string;
  color: string;
  instructor: string;
  credits: number;
  progress: number;
}

interface RawConcept {
  id: string;
  course_id: string;
  label: string;
  description?: string;
  mastery?: number;
  created_at?: string;
  updated_at?: string;
}

interface RawConnection {
  id: string;
  source_id: string;
  target_id: string;
  label?: string;
  cross_course?: boolean;
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

function normalizeCourse(raw: RawCourse): Course {
  return {
    ...raw,
    workflow_state: (raw.workflow_state as Course["workflow_state"]) ?? "available",
    time_zone: raw.time_zone ?? "America/New_York",
  };
}

function normalizeConcept(raw: RawConcept): Concept {
  return {
    ...raw,
    description: raw.description ?? "",
    mastery: raw.mastery ?? 50,
  };
}

function normalizeConnection(raw: RawConnection): Connection {
  return {
    ...raw,
    label: raw.label ?? "related",
    cross_course: raw.cross_course ?? false,
  };
}

/**
 * Fetches all app data from the backend API on mount and populates the store.
 * Falls back gracefully if any endpoint fails.
 */
export function useMockData() {
  const setCourses       = useAppStore((s) => s.setCourses);
  const setAssignments   = useAppStore((s) => s.setAssignments);
  const setAnnouncements = useAppStore((s) => s.setAnnouncements);
  const setConcepts      = useAppStore((s) => s.setConcepts);
  const setConnections   = useAppStore((s) => s.setConnections);
  const setSyllabi       = useAppStore((s) => s.setSyllabi);

  useEffect(() => {
    async function loadAll() {
      // Run all fetches in parallel — each fails independently
      const [courses, assignments, announcements, concepts, connections, syllabi] =
        await Promise.allSettled([
          apiGet<RawCourse[]>("/courses"),
          apiGet<Assignment[]>("/assignments"),
          apiGet<Announcement[]>("/announcements"),
          apiGet<RawConcept[]>("/concepts"),
          apiGet<RawConnection[]>("/connections"),
          apiGet<Syllabus[]>("/syllabi"),
        ]);

      if (courses.status === "fulfilled") {
        setCourses(courses.value.map(normalizeCourse));
      } else {
        console.warn("Failed to load courses:", courses.reason);
      }

      if (assignments.status === "fulfilled") {
        setAssignments(assignments.value);
      } else {
        console.warn("Failed to load assignments:", assignments.reason);
      }

      if (announcements.status === "fulfilled") {
        setAnnouncements(announcements.value);
      } else {
        console.warn("Failed to load announcements:", announcements.reason);
      }

      if (concepts.status === "fulfilled") {
        setConcepts(concepts.value.map(normalizeConcept));
      } else {
        console.warn("Failed to load concepts:", concepts.reason);
      }

      if (connections.status === "fulfilled") {
        setConnections(connections.value.map(normalizeConnection));
      } else {
        console.warn("Failed to load connections:", connections.reason);
      }

      if (syllabi.status === "fulfilled") {
        setSyllabi(syllabi.value);
      } else {
        console.warn("Failed to load syllabi:", syllabi.reason);
      }
    }

    loadAll();
  }, [setCourses, setAssignments, setAnnouncements, setConcepts, setConnections, setSyllabi]);
}
