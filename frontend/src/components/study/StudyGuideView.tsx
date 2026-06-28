import { useVoice } from "@/hooks/useVoice";
import { Volume2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StudyGuideViewProps {
  content: string;
}

export function StudyGuideView({ content }: StudyGuideViewProps) {
  const { speak, isPlaying, isLoading } = useVoice();

  if (!content) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        No study guide generated yet.
      </div>
    );
  }

  // Pre-process markdown to remove literal asterisks from headings if needed
  // This is similar to what we did in InlineStudyGuide.tsx
  const cleanContent = content.replace(/^(#+)\s*\*\*(.*?)\*\*\s*$/gm, "$1 $2");

  return (
    <div className="space-y-4">
      {/* Read aloud button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => speak(content.slice(0, 500))}
          disabled={isLoading || isPlaying}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white/40 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/60 transition-all disabled:opacity-30"
        >
          {isLoading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Volume2 size={12} />
          )}
          Read aloud
        </button>
      </div>

      <div className="prose prose-invert max-w-none text-white/80 prose-headings:text-[#FF8A80] prose-a:text-[#FFAB91] prose-code:text-[#FFAB91]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {cleanContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
