import { 
  CalendarPlus, 
  Check, 
  Circle, 
  Clock, 
  X, 
  Loader2,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCommandStore } from "@/store/useCommandStore";
import { useAppStore } from "@/store/useAppStore";

const COURSE_COLORS: Record<string, string> = {
  sc2002: "#8B5CF6",
  mh2802: "#3B82F6",
  mh1812: "#06B6D4",
  sc2001: "#F43F5E",
  sc2005: "#F97316",
  sc4001: "#A855F7",
  sc4002: "#EC4899",
  sc3000: "#DC2626",
};

interface AssignmentInspectorProps {
  onClose?: () => void;
}

export function AssignmentInspector({ onClose }: AssignmentInspectorProps) {
  const plan = useCommandStore((s) => s.activeRemediation);
  const dismiss = useCommandStore((s) => s.dismissRemediation);
  const courses = useAppStore((s) => s.courses);

  if (!plan) return null;

  const course = courses.find((c) => c.id === plan.course_id);
  const courseColor = COURSE_COLORS[plan.course_id] ?? "#666";
  const scorePercent = plan.maxScore > 0 ? Math.round((plan.score / plan.maxScore) * 100) : 0;

  // Determine display mode based on score
  const isHealthy = scorePercent >= 70;
  const isModerate = scorePercent >= 40 && scorePercent < 70;
  const isDanger = scorePercent < 40 && (plan.conceptsMissed.length > 0 || plan.score > 0);
  const isNotStarted = scorePercent === 0 && plan.conceptsMissed.length === 0;

  const headerLabel = isNotStarted ? "Assignment Preview" : isHealthy ? "Performance Review" : isModerate ? "Progress Tracker" : "Remediation Protocol";
  const headerDotColor = isNotStarted ? "bg-white/20" : isHealthy ? "bg-emerald-500" : isModerate ? "bg-amber-500" : "bg-red-500";
  const headerTextColor = isNotStarted ? "text-white/40" : isHealthy ? "text-emerald-400" : isModerate ? "text-amber-400" : "text-red-400";
  const headerDotAnim = isDanger ? "animate-pulse" : "";

  const scoreColor = isHealthy ? "text-emerald-400" : isModerate ? "text-amber-400" : scorePercent > 0 ? "text-red-400" : "text-white/30";
  const barGradient = isHealthy
    ? "linear-gradient(to right, #10b981, #34d399)"
    : isModerate
      ? "linear-gradient(to right, #f59e0b, #fbbf24)"
      : "linear-gradient(to right, #ef4444, #f87171)";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <button 
          onClick={() => {
            dismiss();
            onClose?.();
          }}
          className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors mb-4 uppercase tracking-wider"
        >
          <ChevronLeft size={12} />
          Back to Triage
        </button>
        
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${headerDotColor} ${headerDotAnim}`} />
          <span className={`${headerTextColor} text-[10px] font-mono tracking-[0.1em] uppercase`}>
            {headerLabel}
          </span>
        </div>
        
        <h2 className="text-sm font-medium text-white/90 mb-2">{plan.assignment_name}</h2>
        
        <Badge
          style={{ background: `${courseColor}15`, color: courseColor, borderColor: `${courseColor}30` }}
          variant="outline"
          className="text-[10px] font-mono"
        >
          {course?.course_code ?? plan.course_id.toUpperCase()}
        </Badge>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {/* Stats Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
                {isNotStarted ? "Status" : "Historical Score"}
              </span>
              {isNotStarted ? (
                <span className="text-sm font-medium font-mono text-white/40">Not Yet Started</span>
              ) : (
                <span className={`text-lg font-bold font-mono ${scoreColor}`}>
                  {scorePercent}%
                </span>
              )}
            </div>
            {!isNotStarted && (
              <>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${scorePercent}%`,
                      background: barGradient,
                    }}
                  />
                </div>
                <p className="text-[10px] text-white/20 font-mono">
                  {plan.score}/{plan.maxScore} possible points
                </p>
              </>
            )}
          </section>

          {/* Concepts Section — only show when there are gaps */}
          {plan.conceptsMissed.length > 0 && (
            <section>
              <h3 className="text-[10px] font-mono tracking-wider text-white/30 uppercase mb-3">
                {isDanger ? "Knowledge Gaps" : "Key Topics"}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {plan.conceptsMissed.map((concept, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${
                      isDanger
                        ? "bg-red-500/[0.03] border border-red-500/[0.08]"
                        : "bg-white/[0.03] border border-white/[0.06]"
                    }`}
                  >
                    {isDanger ? (
                      <X size={10} className="text-red-400 shrink-0" />
                    ) : (
                      <Circle size={6} className="text-white/30 shrink-0" />
                    )}
                    <span className="text-[11px] text-white/60">{concept}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Steps Section */}
          <section>
            <h3 className="text-[10px] font-mono tracking-wider text-white/30 uppercase mb-4">
              {isHealthy ? "Review Steps" : isNotStarted ? "Preparation Steps" : isDanger ? "Recovery Roadmap" : "Next Steps"}
            </h3>
            <div className="space-y-4 relative">
              {/* Vertical line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-white/[0.08]" />

              {plan.steps.map((step, i) => (
                <div key={i} className="relative flex gap-3">
                  <div className="relative z-10 mt-1 shrink-0">
                    {step.status === "completed" ? (
                      <div className="w-[18px] h-[18px] rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <Check size={8} className="text-emerald-400" />
                      </div>
                    ) : step.status === "active" ? (
                      <div className="w-[18px] h-[18px] rounded-full bg-[#FF6B6B]/20 border border-[#FF6B6B]/40 flex items-center justify-center animate-pulse">
                        <Loader2 size={8} className="text-[#FF8A80] animate-spin" />
                      </div>
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <Circle size={4} className="text-white/20" />
                      </div>
                    )}
                  </div>

                  <div className={`flex-1 pb-1 ${step.status === "active" ? "" : "opacity-50"}`}>
                    <h4 className="text-[12px] font-medium text-white/80 mb-0.5">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-white/40 leading-relaxed mb-1.5">
                      {step.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-mono">
                      <Clock size={10} />
                      {step.estimatedTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/[0.06] bg-black/20">
        <Button
          size="sm"
          className="w-full bg-[#FF5252] hover:bg-[#FF6B6B] text-white font-mono text-[11px] tracking-wide h-9"
          onClick={() => {
            window.open(
              `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Remediation: ${plan.assignment_name}`)}&details=${encodeURIComponent(plan.steps.map((s) => `• ${s.title}`).join("\n"))}`,
              "_blank"
            );
          }}
        >
          <CalendarPlus size={14} className="mr-2" />
          Sync to Google Calendar
        </Button>
      </div>
    </div>
  );
}
