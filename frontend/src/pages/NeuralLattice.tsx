import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";

export function NeuralLattice() {
  return (
    <div
      className="w-full h-full bg-[#0d0a0a] relative overflow-hidden"
      style={{ viewTransitionName: "lattice-canvas" }}
    >
      <KnowledgeGraph />
    </div>
  );
}
