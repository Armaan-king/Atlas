import { useRef } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Network, ArrowRight } from "lucide-react";
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";
import { useGraphData } from "@/hooks/useGraphData";
import { useAppStore } from "@/store/useAppStore";

export function LatticePreview() {
  const navigate = useNavigate();
  const { nodes, edges } = useGraphData();
  const setSelectedConceptId = useAppStore((s) => s.setSelectedConceptId);

  const lastClickRef = useRef<number>(0);

  const handlePreviewClick = (nodeId?: string) => {
    const now = Date.now();
    // 350ms window for double click detection
    if (now - lastClickRef.current < 350) {
      if (nodeId) {
        setSelectedConceptId(nodeId);
      }
      
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          flushSync(() => navigate("/lattice"));
        });
      } else {
        navigate("/lattice");
      }
    }
    lastClickRef.current = now;
  };

  return (
    <div
      className="bg-[#0d0a0a] border border-white/[0.06] rounded-[16px] h-full flex flex-col overflow-hidden relative cursor-pointer group transition-all hover:ring-1 hover:ring-white/20"
      style={{ viewTransitionName: "lattice-canvas" }}
      onClick={() => handlePreviewClick()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2 z-10 relative pointer-events-none">
        <div className="flex items-center gap-2">
          <Network size={14} className="text-[#FF8A80] group-hover:text-[#FFAB91] transition-colors" />
          <span className="text-[11px] font-medium tracking-[0.15em] text-white/40 uppercase group-hover:text-white/60 transition-colors">
            Neural Lattice Canvas
          </span>
        </div>
        <span className="text-[10px] text-white/20 font-mono">
          {nodes.length} nodes • {edges.length} edges
        </span>
      </div>

      {/* React Force Graph 3D Preview */}
      <div className="flex-1 relative">
        <KnowledgeGraph preview onPreviewClick={handlePreviewClick} />

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgba(10,10,15,0.95)] to-transparent pointer-events-none z-10" />
      </div>

      {/* Enter Full Lattice button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <button
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-[12px] text-white/60 transition-all backdrop-blur-md group-hover:text-white group-hover:bg-white/[0.1] glow-button"
        >
          Double click to Enter Full Lattice
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
