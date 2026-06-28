import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Particles } from "@/components/background/Particles";
import { WheelNav } from "./WheelNav";
import { InspectorPanel } from "./InspectorPanel";
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";
import { CommandCenter } from "@/pages/CommandCenter";
import { Calendar } from "@/pages/Calendar";
import { CommandDock } from "./CommandDock";
import { useAppStore } from "@/store/useAppStore";
import { Profile } from "@/pages/Profile";
import { Career } from "@/pages/Career";
import { Modules } from "@/pages/Modules";
import { Digest } from "@/pages/Digest";

type ViewId = "command" | "home" | "calendar" | "profile" | "career" | "modules" | "digest";

const VIEW_ORDER: ViewId[] = ["command", "home", "calendar", "modules", "digest", "profile", "career"];

function viewIndex(id: ViewId) {
  return VIEW_ORDER.indexOf(id);
}

const TRANSITION = {
  duration: 0.92,
  ease: [0.32, 0.72, 0, 1] as const,
};

function getRotationDirection(from: ViewId, to: ViewId): number {
  return viewIndex(to) > viewIndex(from) ? 1 : -1;
}

const rotateVariants = {
  enter: (dir: number) => ({
    rotateX: dir * -90,
    opacity: 0,
    scale: 0.88,
    translateZ: -200,
  }),
  center: {
    rotateX: 0,
    opacity: 1,
    scale: 1,
    translateZ: 0,
  },
  exit: (dir: number) => ({
    rotateX: dir * 90,
    opacity: 0,
    scale: 0.88,
    translateZ: -200,
  }),
};

export function PageShell() {
  const currentView = useAppStore((s) => s.currentView);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const prevView = useRef<ViewId>("home");
  const [direction, setDirection] = useState(0);

  // Lifted Graph Controls (only relevant for HomeView)
  const [thermalMode, setThermalMode] = useState(false);
  const [prerequisiteMode, setPrerequisiteMode] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const setSelectedConceptId = useAppStore((s) => s.setSelectedConceptId);

  const navigateTo = useCallback(
    (view: ViewId) => {
      if (view === currentView) return;
      const dir = getRotationDirection(currentView, view);
      setDirection(dir);
      prevView.current = currentView;
      setCurrentView(view);
    },
    [currentView, setCurrentView],
  );

  const handleWheelRoute = useCallback(
    (path: string) => {
      const map: Record<string, ViewId> = {
        "/": "command",
        "/lattice": "home",
        "/calendar": "calendar",
        "/modules": "modules",
        "/digest": "digest",
        "/profile": "profile",
        "/career": "career",
      };
      const view = map[path];
      if (view) navigateTo(view);
    },
    [navigateTo],
  );

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#0d0a0a]">
      {/* Left: WheelNav (fixed overlay) */}
      <WheelNav
        onNavigate={handleWheelRoute}
        activeIndex={VIEW_ORDER.indexOf(currentView)}
      />

      {/* Main Content Area (Now spans full width/height for centering) */}
      <div className="relative flex-1 h-full min-w-0 flex flex-col">
        {/* 3D perspective container for the rotating views */}
        <div
          className="flex-1 relative overflow-hidden min-h-0"
          style={{ perspective: "1200px" }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentView}
              custom={direction}
              variants={rotateVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANSITION}
              className="absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                transformOrigin: "center center",
              }}
            >
              {currentView === "home" && (
                <HomeView
                  thermalMode={thermalMode}
                  prerequisiteMode={prerequisiteMode}
                  resetNonce={resetNonce}
                />
              )}
              {currentView === "command" && <CommandCentralView />}
              {currentView === "calendar" && <CalendarView />}
              {currentView === "profile" && <ProfileView />}
              {currentView === "career" && <CareerView />}
              {currentView === "modules" && <ModulesView />}
              {currentView === "digest" && <DigestView />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom: Unified Command HUD */}
        <AnimatePresence>
          {currentView !== "command" && currentView !== "profile" && currentView !== "career" && currentView !== "modules" && currentView !== "digest" && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={TRANSITION}
              className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
            >
              <div className="pointer-events-auto">
                <CommandDock
                  currentView={currentView}
                  thermalMode={thermalMode}
                  onNavigateThermal={setThermalMode}
                  prerequisiteMode={prerequisiteMode}
                  onNavigatePrerequisite={setPrerequisiteMode}
                  onResetCamera={() => setResetNonce((n) => n + 1)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Elevated Triage panel (Overlay) */}
      <AnimatePresence>
        {currentView === "home" && (
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              mass: 0.8
            }}
            className="fixed right-6 top-6 bottom-6 w-[320px] z-[90] pointer-events-auto"
          >
            <div className="h-full rounded-2xl border border-white/[0.08] bg-[#0d0a0a]/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
              <InspectorPanel
                onClose={() => {
                  setSelectedConceptId(null);
                  setResetNonce(n => n + 1);
                }}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function HomeView({
  thermalMode,
  prerequisiteMode,
  resetNonce,
}: {
  thermalMode: boolean;
  prerequisiteMode: boolean;
  resetNonce: number;
}) {
  return (
    <div className="w-full h-full bg-[#0d0a0a] relative overflow-hidden">
      <Particles
        className="z-[1]"
        quantity={100}
        staticity={55}
        ease={60}
        size={0.4}
        color="#ffffff"
      />

      <KnowledgeGraph
        thermalMode={thermalMode}
        prerequisiteMode={prerequisiteMode}
        resetCameraTrigger={resetNonce}
      />
    </div>
  );
}

function CommandCentralView() {
  return (
    <div className="w-full h-full overflow-auto mesh-gradient-bg relative">
      <CommandCenter />
    </div>
  );
}

function CalendarView() {
  return (
    <div className="w-full h-full overflow-auto mesh-gradient-bg">
      <Calendar />
    </div>
  );
}

function ProfileView() {
  return (
    <div className="w-full h-full overflow-auto mesh-gradient-bg relative">
      <Profile />
    </div>
  );
}

function CareerView() {
  return (
    <div className="w-full h-full overflow-auto mesh-gradient-bg relative">
      <Career />
    </div>
  );
}

function ModulesView() {
  return (
    <div className="w-full h-full overflow-auto mesh-gradient-bg relative">
      <Modules />
    </div>
  );
}

function DigestView() {
  return (
    <div className="w-full h-full overflow-auto mesh-gradient-bg relative">
      <Digest />
    </div>
  );
}
