import { X, Sparkles } from "lucide-react";
import { StudyLabPane } from "@/components/study/StudyLabPane";

interface StudyLabProps {
  onClose: () => void;
}

export function StudyLab({ onClose }: StudyLabProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[80vh] mx-4 flex flex-col rounded-2xl border border-white/[0.08] bg-[#100a0a]/95 backdrop-blur-xl shadow-2xl shadow-[#FF6B6B]/5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white/90">Study Lab</h1>
            <p className="text-[11px] text-white/30 font-mono">AI-generated study artifacts</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <StudyLabPane />
      </div>
    </div>
  );
}
