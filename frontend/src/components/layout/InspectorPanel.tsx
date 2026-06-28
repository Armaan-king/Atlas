import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useCommandStore } from "@/store/useCommandStore";
import { TriageAlertFeed } from "@/components/command/TriageAlertFeed";
import { AssignmentInspector } from "@/components/command/AssignmentInspector";
import { ConceptInspector } from "@/components/graph/ConceptInspector";

interface InspectorPanelProps {
  onClose?: () => void;
}

export function InspectorPanel({ onClose }: InspectorPanelProps) {
  const selectedConceptId = useAppStore((s) => s.selectedConceptId);
  const activeRemediation = useCommandStore((s) => s.activeRemediation);

  // Determine current view
  let mode: "triage" | "assignment" | "concept" = "triage";
  if (activeRemediation) mode = "assignment";
  else if (selectedConceptId) mode = "concept";

  return (
    <div className="h-full w-full relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {mode === "triage" && (
          <motion.div
            key="triage"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <TriageAlertFeed variant="sidebar" />
          </motion.div>
        )}

        {mode === "assignment" && (
          <motion.div
            key="assignment"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <AssignmentInspector onClose={onClose} />
          </motion.div>
        )}

        {mode === "concept" && (
          <motion.div
            key="concept"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <ConceptInspector onClose={onClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
