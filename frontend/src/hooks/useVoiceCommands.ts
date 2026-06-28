/**
 * useVoiceCommands
 * ================
 * Intercepts voice transcripts and checks them against known command patterns
 * before sending to chat. Returns null if the text is a command (handled
 * locally), or the original text if it should go to chat.
 *
 * Supported commands:
 *   "show me {course}"            → filter graph to that course
 *   "focus on {course}"           → same
 *   "filter low mastery"          → masteryRange [0, 50]
 *   "filter high mastery"         → masteryRange [75, 100]
 *   "show all"                    → reset all filters
 *   "quiz me on {topic}"          → opens StudyLab with quiz mode (sets pendingStudyTopic)
 *   "study {topic}"               → opens StudyLab (sets pendingStudyTopic)
 *   "week view"                   → switch graph to week view
 *   "full view" / "overview"      → switch graph view mode
 */

import { useCallback } from "react";
import { useAppStore } from "../store/useAppStore";

// Course name / code synonyms
const COURSE_ALIASES: Record<string, string> = {
  "cmsc": "sc2002",
  "sc2002": "sc2002",
  "programming languages": "sc2002",
  "pl": "sc2002",
  "math": "mh2802",
  "mh2802": "mh2802",
  "linear algebra": "mh2802",
  "linalg": "mh2802",
  "bio": "biol105",
  "biol": "biol105",
  "biol105": "biol105",
  "biology": "biol105",
  "econ": "econ200",
  "econ200": "econ200",
  "economics": "econ200",
  "microeconomics": "econ200",
};

function normalizeSpeech(text: string): string {
  return text.toLowerCase().trim().replace(/[.,!?]$/, "");
}

function matchCourse(text: string): string | null {
  for (const [alias, courseId] of Object.entries(COURSE_ALIASES)) {
    if (text.includes(alias)) return courseId;
  }
  return null;
}

export interface CommandResult {
  handled: boolean;
  feedback?: string; // text to display as voice feedback
}

export function useVoiceCommands() {
  const setGraphFilters = useAppStore((s) => s.setGraphFilters);
  const courses = useAppStore((s) => s.courses);
  const setPendingStudyTopic = useAppStore((s) => s.setPendingStudyTopic);

  const processCommand = useCallback(
    (rawText: string): CommandResult => {
      const text = normalizeSpeech(rawText);

      // ── Show / focus on a course ────────────────────────────────────────
      if (
        text.startsWith("show me") ||
        text.startsWith("focus on") ||
        text.startsWith("show")
      ) {
        const courseId = matchCourse(text);
        if (courseId) {
          setGraphFilters({ courseIds: [courseId] });
          const course = courses.find((c) => c.id === courseId);
          return {
            handled: true,
            feedback: `Filtering graph to ${course?.course_code ?? courseId}`,
          };
        }
      }

      // ── Show all / reset ────────────────────────────────────────────────
      if (
        text === "show all" ||
        text === "reset" ||
        text === "reset filters" ||
        text === "clear filters"
      ) {
        setGraphFilters({ courseIds: [], masteryRange: [0, 100], viewMode: "full" });
        return { handled: true, feedback: "Showing all concepts" };
      }

      // ── Mastery filters ─────────────────────────────────────────────────
      if (
        text.includes("low mastery") ||
        text.includes("struggling") ||
        text.includes("weak")
      ) {
        setGraphFilters({ masteryRange: [0, 50] });
        return { handled: true, feedback: "Showing low mastery concepts" };
      }

      if (
        text.includes("high mastery") ||
        text.includes("mastered") ||
        text.includes("strong")
      ) {
        setGraphFilters({ masteryRange: [75, 100] });
        return { handled: true, feedback: "Showing high mastery concepts" };
      }

      // ── View mode ───────────────────────────────────────────────────────
      if (text.includes("week view") || text.includes("this week")) {
        setGraphFilters({ viewMode: "week" });
        return { handled: true, feedback: "Switching to week view" };
      }

      if (text.includes("overview") || text === "full view" || text.includes("full graph")) {
        setGraphFilters({ viewMode: "full" });
        return { handled: true, feedback: "Showing full graph" };
      }

      // ── Study / quiz commands ───────────────────────────────────────────
      const quizMatch = text.match(/^(?:quiz me on|quiz|test me on)\s+(.+)$/);
      if (quizMatch) {
        const topic = quizMatch[1].trim();
        setPendingStudyTopic(topic);
        return { handled: true, feedback: `Opening quiz on ${topic}` };
      }

      const studyMatch = text.match(/^(?:study|explain|show me notes on|notes on)\s+(.+)$/);
      if (studyMatch) {
        const topic = studyMatch[1].trim();
        setPendingStudyTopic(topic);
        return { handled: true, feedback: `Opening study guide for ${topic}` };
      }

      // ── Not a command — send to chat ────────────────────────────────────
      return { handled: false };
    },
    [setGraphFilters, courses, setPendingStudyTopic],
  );

  return { processCommand };
}
