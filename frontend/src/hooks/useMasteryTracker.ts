import { useCallback } from "react";
import { useAppStore } from "../store/useAppStore";
import { MASTERY_TIERS, getMasteryTier } from "../types";

function fuzzyMatch(label: string, topic: string): boolean {
  const l = label.toLowerCase();
  const t = topic.toLowerCase();
  if (l.includes(t) || t.includes(l)) return true;
  const labelWords = l.split(/\s+/);
  const topicWords = t.split(/\s+/);
  return labelWords.some(
    (lw) => lw.length >= 4 && topicWords.some((tw) => tw.includes(lw) || lw.includes(tw))
  );
}

interface QuizQuestionData {
  id: string;
  correctIndex: number;
}

/**
 * Snaps mastery up or down one tier based on quiz performance.
 *   score ≥ 60%  → move up one tier (snap to that tier's representative value)
 *   score ≤ 40%  → move down one tier
 *   otherwise    → no change
 */
export function useMasteryTracker() {
  const concepts = useAppStore((s) => s.concepts);
  const updateConceptMastery = useAppStore((s) => s.updateConceptMastery);

  const trackQuizResults = useCallback(
    (
      questions: QuizQuestionData[],
      answers: (number | null)[],
      topic: string
    ) => {
      const matchedConcepts = concepts.filter((c) => fuzzyMatch(c.label, topic));
      if (matchedConcepts.length === 0) return;

      const answered = answers.filter((a) => a !== null).length;
      if (answered === 0) return;

      const correctCount = answers.filter(
        (a, i) => a !== null && a === questions[i]?.correctIndex
      ).length;
      const score = correctCount / answered;

      for (const concept of matchedConcepts) {
        const currentTierIdx = MASTERY_TIERS.findIndex(
          (t) => t.id === getMasteryTier(concept.mastery).id
        );

        let targetTierIdx = currentTierIdx;
        if (score >= 0.6 && currentTierIdx < MASTERY_TIERS.length - 1) {
          targetTierIdx = currentTierIdx + 1;
        } else if (score <= 0.4 && currentTierIdx > 0) {
          targetTierIdx = currentTierIdx - 1;
        }

        if (targetTierIdx !== currentTierIdx) {
          const targetValue = MASTERY_TIERS[targetTierIdx].value;
          const delta = targetValue - concept.mastery;
          updateConceptMastery(concept.id, delta, "quiz");
        }
      }
    },
    [concepts, updateConceptMastery]
  );

  return { trackQuizResults };
}
