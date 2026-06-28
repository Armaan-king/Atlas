import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCommandStore } from "@/store/useCommandStore";
import { useAppStore } from "@/store/useAppStore";
import {
  AlertTriangle,
  CalendarPlus,
  Check,
  Circle,
  Clock,
  X,
  Loader2,
} from "lucide-react";

const COURSE_COLORS: Record<string, string> = {
  sc2002: "#8B5CF6",
  mh2802: "#3B82F6",
  biol105: "#10B981",
  econ200: "#F59E0B",
};

export function RemediationModal() {
  const plan = useCommandStore((s) => s.activeRemediation);
  const dismiss = useCommandStore((s) => s.dismissRemediation);
  const courses = useAppStore((s) => s.courses);

  if (!plan) return null;

  const course = courses.find((c) => c.id === plan.course_id);
  const courseColor = COURSE_COLORS[plan.course_id] ?? "#666";
  const scorePercent = plan.maxScore > 0 ? Math.round((plan.score / plan.maxScore) * 100) : 0;

  return (
    <Sheet open={!!plan} onOpenChange={(open) => !open && dismiss()}>
      <SheetContent
        side="right"
        className="w-[620px] sm:max-w-[620px] bg-[#100a0a] border-l border-white/[0.06] p-0 overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <SheetTitle className="text-red-400 text-sm font-mono tracking-[0.1em] uppercase">
              Remediation Protocol Initiated
            </SheetTitle>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              style={{ background: `${courseColor}20`, color: courseColor, borderColor: `${courseColor}40` }}
              variant="outline"
              className="text-[10px] font-mono"
            >
              {course?.course_code ?? plan.course_id.toUpperCase()}
            </Badge>
            <span className="text-[13px] text-white/60">{plan.assignment_name}</span>
          </div>
        </SheetHeader>

        <Separator className="bg-white/[0.06]" />

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="px-6 py-5">
            {/* Two-column layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Column 1: The Autopsy */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={14} className="text-red-400" />
                  <h3 className="text-[12px] font-mono tracking-[0.1em] text-white/50 uppercase">
                    The Autopsy
                  </h3>
                </div>

                {/* Score display */}
                <div className="glass-card p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-white/30 font-mono">SCORE</span>
                    <span className={`text-2xl font-bold ${scorePercent < 60 ? "text-red-400" : "text-amber-400"}`}>
                      {scorePercent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${scorePercent}%`,
                        background: scorePercent < 60
                          ? "linear-gradient(to right, #ef4444, #f87171)"
                          : "linear-gradient(to right, #f59e0b, #fbbf24)",
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-white/20 font-mono mt-2">
                    {plan.score}/{plan.maxScore} points
                  </p>
                </div>

                {/* Concepts missed */}
                <h4 className="text-[10px] font-mono tracking-[0.1em] text-white/30 uppercase mb-2">
                  Concepts Failed
                </h4>
                <div className="space-y-1.5">
                  {plan.conceptsMissed.map((concept, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/[0.04] border border-red-500/[0.08]"
                    >
                      <X size={10} className="text-red-400 shrink-0" />
                      <span className="text-[12px] text-white/60">{concept}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: The Action Plan */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={14} className="text-[#FF8A80]" />
                  <h3 className="text-[12px] font-mono tracking-[0.1em] text-white/50 uppercase">
                    The Action Plan
                  </h3>
                </div>

                {/* Timeline stepper */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/[0.08]" />

                  <div className="space-y-4">
                    {plan.steps.map((step, i) => (
                      <div key={i} className="relative flex gap-3">
                        {/* Dot */}
                        <div className="relative z-10 mt-0.5 shrink-0">
                          {step.status === "completed" ? (
                            <div className="w-[22px] h-[22px] rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                              <Check size={10} className="text-emerald-400" />
                            </div>
                          ) : step.status === "active" ? (
                            <div className="w-[22px] h-[22px] rounded-full bg-[#FF6B6B]/20 border border-[#FF6B6B]/40 flex items-center justify-center animate-pulse">
                              <Loader2 size={10} className="text-[#FF8A80] animate-spin" />
                            </div>
                          ) : (
                            <div className="w-[22px] h-[22px] rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                              <Circle size={6} className="text-white/20" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 pb-1 ${step.status === "active" ? "" : "opacity-60"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[12px] font-medium text-white/80">
                              {step.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/40 leading-relaxed mb-1.5">
                            {step.description}
                          </p>
                          <span className="text-[10px] text-white/20 font-mono">
                            Est. {step.estimatedTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-white/[0.06] bg-[#100a0a]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              className="flex-1 glow-button bg-[#FF5252] hover:bg-[#FF6B6B] text-white font-mono text-[12px] tracking-wider"
              onClick={() => {
                // Would integrate with Google Calendar API
                window.open(
                  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Remediation: ${plan.assignment_name}`)}&details=${encodeURIComponent(plan.steps.map((s) => `• ${s.title}`).join("\n"))}`,
                  "_blank"
                );
              }}
            >
              <CalendarPlus size={14} className="mr-2" />
              Add Protocol to Google Calendar
            </Button>
            <Button
              variant="ghost"
              className="text-white/40 hover:text-white/60 font-mono text-[12px]"
              onClick={dismiss}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
