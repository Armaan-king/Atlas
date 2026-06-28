import { useCommandStore } from "@/store/useCommandStore";
import { Activity } from "lucide-react";

const LABELS: Record<string, string> = {
  canvasApi: "LMS Connector (Demo)",
  openAiProvider: "OpenAI Provider",
  ghostPilot: "Atlas Copilot",
};

const STATUS_TEXT: Record<string, string> = {
  active: "Connected",
  standby: "Standby",
  error: "Offline",
  ready: "Ready",
};

const DOT_CLASS: Record<string, string> = {
  active: "status-dot-active",
  standby: "status-dot-standby",
  error: "status-dot-danger",
  ready: "status-dot-ready",
};

export function SystemStatus() {
  const status = useCommandStore((s) => s.systemStatus);

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Activity size={14} className="text-emerald-400" />
        <span className="text-[11px] font-medium tracking-[0.15em] text-white/40 uppercase">
          System Status
        </span>
      </div>

      {/* Status rows */}
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {(["canvasApi", "openAiProvider", "ghostPilot"] as const).map((key) => (
          <div
            key={key}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="flex items-center gap-3">
              <div className={`status-dot ${DOT_CLASS[status[key]]}`} />
              <span className="text-[13px] font-mono text-white/60">
                {LABELS[key]}
              </span>
            </div>
            <span
              className={`text-[11px] font-mono ${
                status[key] === "active"
                  ? "text-emerald-400"
                  : status[key] === "error"
                    ? "text-red-400"
                    : "text-amber-400"
              }`}
            >
              {STATUS_TEXT[status[key]]}
            </span>
          </div>
        ))}
      </div>

      {/* Uptime */}
      <div className="mt-4 pt-3 border-t border-white/[0.04]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/20 font-mono">UPTIME</span>
          <span className="text-[10px] text-white/30 font-mono">
            4h 23m 17s
          </span>
        </div>
      </div>
    </div>
  );
}
