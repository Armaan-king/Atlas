import { NavLink } from "react-router-dom";
import { LayoutDashboard, Network, CalendarDays, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useCommandStore } from "@/store/useCommandStore";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Command Center" },
  { to: "/lattice", icon: Network, label: "Neural Lattice" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "status-dot-active",
  standby: "status-dot-standby",
  error: "status-dot-danger",
  ready: "status-dot-ready",
};

interface SidebarProps {
  onChatOpen?: () => void;
}

export function Sidebar({ onChatOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const status = useCommandStore((s) => s.systemStatus);

  return (
    <aside
      className={`
        relative flex flex-col h-screen border-r border-white/[0.06]
        backdrop-blur-xl bg-white/[0.02] transition-all duration-300
        ${collapsed ? "w-[68px]" : "w-[220px]"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] flex items-center justify-center shrink-0 glow-indigo">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-[0.2em] text-white/80 uppercase">
            Atlas
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3 mt-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
              ${
                isActive
                  ? "bg-white/[0.08] text-white shadow-[inset_3px_0_0_0_rgba(255,107,107,0.8)]"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Action Buttons */}
      <div className="px-3 pb-3 space-y-2">
        <button
          onClick={onChatOpen}
          className={`flex items-center gap-3 w-full py-2.5 rounded-lg text-sm text-white bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] shadow-lg shadow-[#FF6B6B]/25 hover:shadow-[#FF6B6B]/40 hover:brightness-110 transition-all duration-200 ${collapsed ? "justify-center px-0" : "px-3"}`}
        >
          <MessageCircle size={18} className="shrink-0" />
          {!collapsed && <span className="font-medium">Atlas Chat</span>}
        </button>
      </div>

      {/* System Status Pips */}
      <div className={`px-4 pb-5 space-y-2.5 ${collapsed ? "px-3" : ""}`}>
        {!collapsed && (
          <span className="text-[10px] font-medium tracking-[0.15em] text-white/30 uppercase">
            Telemetry
          </span>
        )}
        <div className="flex flex-col gap-2">
          {([
            ["canvasApi", "LMS"],
            ["openAiProvider", "OpenAI"],
            ["ghostPilot", "Copilot"],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2.5">
              <div
                className={`status-dot ${STATUS_COLORS[status[key]] ?? "status-dot-standby"}`}
              />
              {!collapsed && (
                <span className="text-[11px] text-white/40 font-mono">
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.1] transition-all z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
