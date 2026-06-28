import { BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface InlineStudyGuideProps {
  content: string;
}

export function InlineStudyGuide({ content }: InlineStudyGuideProps) {
  // Pre-process markdown to remove literal asterisks from headings
  const cleanContent = content.replace(/^(#+)\s*\*\*(.*?)\*\*\s*$/gm, "$1 $2");

  return (
    <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/[0.05] overflow-hidden w-[500px] max-w-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
        <BookOpen size={12} className="text-red-400/70" />
        <span className="text-[10px] font-mono text-red-400/70 uppercase tracking-wider">
          Study Guide
        </span>
      </div>
      {/* Content */}
      <div className="px-4 py-3 max-h-[500px] overflow-y-auto overscroll-contain">
        <div className="prose prose-invert prose-sm max-w-none text-white/80 prose-headings:text-[#FF8A80] prose-a:text-[#FFAB91] prose-code:text-[#FFAB91] prose-pre:bg-white/[0.04] prose-pre:border prose-pre:border-white/[0.06] prose-pre:text-[#FFAB91]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {cleanContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
