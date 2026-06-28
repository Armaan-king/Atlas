import { InlineFlashcards } from "./InlineFlashcards";
import { InlineQuiz } from "./InlineQuiz";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArtifactRendererProps {
  content: string;
  /** True when the message is fully received (not mid-stream). */
  isComplete: boolean;
}

/**
 * Detects the format of a chat message and renders the appropriate component.
 *
 * Detection order (only attempted when isComplete=true):
 *   1. JSON with `cards` key  → InlineFlashcards
 *   2. JSON with `questions` key → InlineQuiz
 *   3. Everything else → ReactMarkdown (handles headers, lists, bold, etc.)
 */
export function ArtifactRenderer({ content, isComplete }: ArtifactRendererProps) {
  // 1. Try JSON parsing (only if complete to avoid syntax errors)
  if (isComplete && (content.trim().startsWith("{") || content.trim().startsWith("["))) {
    try {
      const parsed = JSON.parse(content.trim());

      if (parsed.cards && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
        return <InlineFlashcards cards={parsed.cards} />;
      }

      if (
        parsed.questions &&
        Array.isArray(parsed.questions) &&
        parsed.questions.length > 0
      ) {
        return <InlineQuiz questions={parsed.questions} />;
      }
    } catch {
      // Not valid JSON — fall through to markdown
    }
  }

  // 2. Render as rich Markdown (handles headers, lists, bold, code, etc.)
  return (
    <div className="prose prose-invert prose-sm max-w-none text-white/90">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
