import { useState } from "react";
import { Bell, Pin, X, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { currentCourseIds } from "@/lib/modules";
import { useAppStore } from "@/store/useAppStore";
import type { Announcement } from "@/types";

const COURSE_COLORS: Record<string, string> = {
  sc2002: "#8B5CF6",
  mh2802: "#3B82F6",
  mh1812: "#06B6D4",
  sc2001: "#F43F5E",
  sc2005: "#F97316",
  sc4001: "#A855F7",
};

const IMPORTANCE_STYLES: Record<
  Announcement["importance"],
  { dot: string; bg: string; border: string; badge: string }
> = {
  critical: { dot: "bg-red-400",    bg: "bg-red-500/[0.06]",    border: "border-red-500/15",    badge: "bg-red-500/20 text-red-400 border-red-500/20" },
  high:     { dot: "bg-orange-400", bg: "bg-orange-500/[0.04]", border: "border-orange-500/10", badge: "bg-orange-500/20 text-orange-400 border-orange-500/20" },
  medium:   { dot: "bg-white/20",   bg: "bg-white/[0.02]",      border: "border-white/[0.04]",  badge: "bg-white/10 text-white/40 border-white/10" },
  low:      { dot: "bg-white/10",   bg: "bg-white/[0.01]",      border: "border-white/[0.03]",  badge: "bg-white/5 text-white/25 border-white/5" },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "1d ago";
  return `${diff}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

interface AnnouncementsFeedProps {
  variant?: "bento" | "sidebar";
}

export function AnnouncementsFeed({ variant = "bento" }: AnnouncementsFeedProps) {
  const announcements = useAppStore((s) => s.announcements);
  const courses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const currentIds = currentCourseIds(courses, customCourses, courseStatus);

  const [selected, setSelected] = useState<Announcement | null>(null);

  const visibleAnnouncements = announcements.filter((announcement) => currentIds.has(announcement.course_id));

  // Pinned first, then newest-first
  const sorted = [...visibleAnnouncements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });

  const unreadCount = visibleAnnouncements.filter((a) => a.read_state === "unread").length;

  return (
    <div className={`h-full flex flex-col relative overflow-hidden ${variant === "bento" ? "glass-card p-5" : "p-4"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-amber-400" />
          <span className="text-[11px] font-medium tracking-[0.15em] text-white/40 uppercase">
            Announcements
          </span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-full px-1.5 py-px">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] text-white/20 font-mono">{sorted.length} total</span>
      </div>

      {/* Feed */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden -mx-1 px-1">
        <div className="flex flex-col gap-1.5">
          {sorted.map((ann, idx) => {
            const styles = IMPORTANCE_STYLES[ann.importance];
            const course = courseMap.get(ann.course_id);
            const isUnread = ann.read_state === "unread";

            return (
              <button
                key={ann.id}
                onClick={() => setSelected(ann)}
                className={`
                  w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg border
                  animate-fade-in-up transition-all duration-150 cursor-pointer
                  hover:brightness-125 active:scale-[0.99]
                  ${styles.bg} ${styles.border}
                `}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* Course color pip */}
                <div
                  className="w-1.5 rounded-full shrink-0 mt-1"
                  style={{ height: "32px", background: COURSE_COLORS[ann.course_id] ?? "#666" }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5 mb-0.5">
                    {ann.pinned && (
                      <Pin size={9} className="text-white/30 shrink-0 mt-[3px]" />
                    )}
                    <span
                      className={`text-[12px] leading-snug line-clamp-2 text-left ${
                        isUnread ? "text-white/80" : "text-white/45"
                      }`}
                    >
                      {ann.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/30 font-mono">
                      {course?.course_code ?? ann.course_id.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-white/20">•</span>
                    <span className="text-[10px] text-white/25 font-mono">
                      {timeAgo(ann.posted_at)}
                    </span>
                  </div>
                </div>

                {/* Right side */}
                <div className="shrink-0 flex flex-col items-end gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isUnread ? styles.dot : "bg-transparent"}`} />
                  <ChevronRight size={10} className="text-white/20" />
                </div>
              </button>
            );
          })}

          {sorted.length === 0 && (
            <p className="text-[12px] text-white/20 text-center py-8 font-mono">
              No current-module announcements
            </p>
          )}
        </div>
      </div>

      {/* Detail panel — slides over the card when an announcement is selected */}
      {selected && (() => {
        const styles = IMPORTANCE_STYLES[selected.importance];
        const course = courseMap.get(selected.course_id);
        return (
          <div className="absolute inset-0 bg-[#110a0a]/95 backdrop-blur-sm rounded-[16px] flex flex-col p-5 z-20 animate-fade-in-up">
            {/* Detail header */}
            <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
              <div className="flex items-start gap-2 min-w-0">
                <div
                  className="w-1.5 rounded-full shrink-0 mt-1"
                  style={{ height: "36px", background: COURSE_COLORS[selected.course_id] ?? "#666" }}
                />
                <div className="min-w-0">
                  <p className="text-[13px] text-white/85 leading-snug font-medium">
                    {selected.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] font-mono text-white/40">
                      {course?.course_code ?? selected.course_id.toUpperCase()} — {course?.name}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
              >
                <X size={11} />
              </button>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 mb-3 shrink-0 flex-wrap">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${styles.badge}`}>
                {selected.importance}
              </span>
              {selected.pinned && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-white/5 text-white/30 border-white/10 flex items-center gap-1">
                  <Pin size={8} /> pinned
                </span>
              )}
              <span className="text-[10px] text-white/25 font-mono">{selected.author}</span>
              <span className="text-[10px] text-white/15">•</span>
              <span className="text-[10px] text-white/25 font-mono">{formatDate(selected.posted_at)}</span>
            </div>

            {/* Message body */}
            <ScrollArea className="flex-1">
              <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </p>
            </ScrollArea>
          </div>
        );
      })()}
    </div>
  );
}
