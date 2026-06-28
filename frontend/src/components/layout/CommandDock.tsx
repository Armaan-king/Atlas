import { useState } from "react";
import { MessageCircle, Thermometer, Link2, Focus, ChevronUp, Layers } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { MASTERY_TIERS } from "@/types";
import type { GraphFilters } from "@/types";

interface CommandDockProps {
  currentView: "command" | "home" | "calendar";
  thermalMode: boolean;
  onNavigateThermal: (v: boolean) => void;
  prerequisiteMode: boolean;
  onNavigatePrerequisite: (v: boolean) => void;
  onResetCamera: () => void;
}

const VIEW_MODES: { id: GraphFilters["viewMode"]; label: string }[] = [
  { id: "semester", label: "Semester" },
  { id: "full", label: "Full" },
  { id: "week", label: "Week" },
];

export function CommandDock({
  currentView,
  thermalMode,
  onNavigateThermal,
  prerequisiteMode,
  onNavigatePrerequisite,
  onResetCamera,
}: CommandDockProps) {
  const courses = useAppStore((s) => s.courses);
  const graphFilters = useAppStore((s) => s.graphFilters);
  const setGraphFilters = useAppStore((s) => s.setGraphFilters);
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  const toggleCourse = (courseId: string) => {
    const next = graphFilters.courseIds.includes(courseId)
      ? graphFilters.courseIds.filter((id) => id !== courseId)
      : [...graphFilters.courseIds, courseId];
    setGraphFilters({ courseIds: next });
  };

  const activeTierIdx = MASTERY_TIERS.findIndex(
    (t) => graphFilters.masteryRange[0] === 0 && graphFilters.masteryRange[1] === t.max
  );
  const sliderIdx = activeTierIdx >= 0 ? activeTierIdx : MASTERY_TIERS.length - 1;
  const activeTier = MASTERY_TIERS[sliderIdx];
  const thumbColor = activeTier.color;
  const fillPct = (sliderIdx / (MASTERY_TIERS.length - 1)) * 100;

  const [filterOpen, setFilterOpen] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = Number(e.target.value);
    setGraphFilters({ masteryRange: [0, MASTERY_TIERS[idx].max] });
  };

  const activeCount = graphFilters.courseIds.length;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">

      {/* Filter dropdown — expands upward (only for Home view/graph) */}
      {filterOpen && currentView === "home" && (
        <div className="flex flex-col gap-3 px-4 py-3 rounded-2xl bg-[#110a0a]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl">
          {/* Course toggles */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-0.5">Courses</span>
            {courses.map((course) => {
              const active = graphFilters.courseIds.includes(course.id);
              return (
                <button
                  key={course.id}
                  onClick={() => toggleCourse(course.id)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all border"
                  style={active
                    ? { backgroundColor: course.color + "22", color: course.color, borderColor: course.color + "55" }
                    : { borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: active ? course.color : "rgba(255,255,255,0.15)" }}
                  />
                  <span className="font-semibold tracking-wider uppercase">{course.course_code}</span>
                  <span className="text-[10px] opacity-60 truncate">{course.name}</span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Mastery slider */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-0.5">Mastery</span>
            <style>{`
              .mastery-slider { -webkit-appearance: none; appearance: none; height: 3px; border-radius: 9999px; outline: none; cursor: pointer; }
              .mastery-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 9999px; border: 2px solid rgba(255,255,255,0.85); cursor: grab; transition: transform 0.15s, box-shadow 0.15s; background-color: var(--thumb-color); box-shadow: 0 0 6px var(--thumb-color); }
              .mastery-slider::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.25); }
              .mastery-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 9999px; border: 2px solid rgba(255,255,255,0.85); cursor: grab; background-color: var(--thumb-color); box-shadow: 0 0 6px var(--thumb-color); }
            `}</style>
            <input
              type="range"
              min={0}
              max={MASTERY_TIERS.length - 1}
              step={1}
              value={sliderIdx}
              onChange={handleSliderChange}
              className="mastery-slider w-full"
              style={{
                background: `linear-gradient(to right, ${thumbColor} 0%, ${thumbColor} ${fillPct}%, rgba(255,255,255,0.1) ${fillPct}%, rgba(255,255,255,0.1) 100%)`,
                "--thumb-color": thumbColor,
              } as React.CSSProperties}
            />
            <div className="flex justify-between px-[1px]">
              {MASTERY_TIERS.map((tier, i) => (
                <span
                  key={tier.id}
                  className="text-[9px] font-mono uppercase tracking-wider transition-colors"
                  style={{ color: activeTierIdx === i ? tier.color : "rgba(255,255,255,0.2)" }}
                >
                  {tier.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main controls row */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#110a0a]/80 border border-white/[0.08] backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.04]">
        {/* Left side: Graph view tabs (Only on Home) */}
        {currentView === "home" && (
          <>
            {/* View mode tabs */}
            <div className="flex items-center gap-0.5 mr-1">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setGraphFilters({ viewMode: mode.id })}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono tracking-[0.08em] uppercase transition-all duration-300 ${
                    graphFilters.viewMode === mode.id
                      ? "bg-red-500/20 text-red-400 shadow-[0_0_12px_rgba(232,69,69,0.2)]"
                      : "text-white/35 hover:text-white/60"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-white/[0.08]" />
          </>
        )}

        {/* Home-specific Controls */}
        {currentView === "home" && (
          <>
            {/* Filters toggle */}
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase transition-all duration-300 ${
                filterOpen || activeCount > 0
                  ? "bg-red-500/20 text-red-400 shadow-[0_0_12px_rgba(232,69,69,0.2)]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Layers size={13} />
              <span>Filters</span>
              {activeCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 text-[9px] font-bold">
                  {activeCount}
                </span>
              )}
              <ChevronUp
                size={11}
                className={`transition-transform duration-300 ${filterOpen ? "" : "rotate-180"}`}
              />
            </button>

            <div className="w-px h-6 bg-white/[0.08]" />

            <Toggle
              pressed={thermalMode}
              onPressedChange={onNavigateThermal}
              className="rounded-full h-8 h-8 data-[state=on]:bg-red-500/20 data-[state=on]:text-red-400 text-white/40 hover:text-white/70 transition-all duration-300"
            >
              <Thermometer size={14} className="mr-1.5" />
              <span className="text-[10px] font-mono tracking-wider uppercase">
                Thermal
              </span>
            </Toggle>

            <Toggle
              pressed={prerequisiteMode}
              onPressedChange={onNavigatePrerequisite}
              className="rounded-full h-8 h-8 data-[state=on]:bg-red-500/20 data-[state=on]:text-red-400 text-white/40 hover:text-white/70 transition-all duration-300"
            >
              <Link2 size={14} className="mr-1.5" />
              <span className="text-[10px] font-mono tracking-wider uppercase">
                Prereqs
              </span>
            </Toggle>

            <div className="w-px h-6 bg-white/[0.08] mx-0.5" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onResetCamera}
              className="rounded-full h-8 px-2.5 text-white/35 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-300"
            >
              <Focus size={14} className="mr-1.5" />
              <span className="text-[10px] font-mono tracking-wider uppercase">
                Reset
              </span>
            </Button>

            <div className="w-px h-6 bg-white/[0.08]" />
          </>
        )}

        {/* Global Chat Button */}
        <button
          onClick={() => setCurrentView("command")}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase whitespace-nowrap transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_0_15px_rgba(232,69,69,0.3)] hover:shadow-[0_0_20px_rgba(232,69,69,0.5)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageCircle size={14} className="shrink-0" />
          <span>Ask Atlas</span>
        </button>
      </div>
    </div>
  );
}
