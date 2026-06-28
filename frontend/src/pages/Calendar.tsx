import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { effectiveModules } from "@/lib/modules";
import type { Assignment, CalendarEvent, Course } from "@/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CATEGORY_COLORS: Record<string, string> = {
  exam: "#EF4444",
  quiz: "#F59E0B",
  project: "#FF6B6B",
  homework: "#3B82F6",
  lab: "#10B981",
  event: "#A855F7",
};

const CATEGORY_PRIORITY: Record<string, number> = {
  exam: 0, quiz: 1, project: 2, homework: 3, lab: 4, event: 5,
};

// Unified day item — covers both backend assignments and manual events.
interface DayItem {
  id: string;
  title: string;
  category: string;
  color: string;
  courseCode?: string;
  isManual: boolean;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
// Parse a manual event's date safely (local noon avoids TZ day-shift).
function localDate(iso: string) {
  return new Date(iso);
}

interface CalendarDayProps {
  day: number | null;
  items: DayItem[];
  isToday: boolean;
  onAdd: (day: number) => void;
  onDelete: (id: string) => void;
}

function CalendarDay({ day, items, isToday, onAdd, onDelete }: CalendarDayProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 3);
  const overflow = items.length - 3;

  return (
    <div
      className={`group/day relative min-h-[90px] p-1.5 border border-white/[0.04] rounded-lg transition-colors ${
        day ? "bg-white/[0.015] hover:bg-white/[0.03]" : "bg-transparent"
      }`}
    >
      {day && (
        <>
          <div className="flex items-center justify-between">
            <div
              className={`text-[11px] font-mono w-5 h-5 flex items-center justify-center rounded-full ${
                isToday ? "bg-[#FF6B6B] text-white font-bold" : "text-white/30"
              }`}
            >
              {day}
            </div>
            <button
              onClick={() => onAdd(day)}
              title="Add event"
              className="opacity-0 group-hover/day:opacity-100 transition-opacity text-white/30 hover:text-white/70"
            >
              <Plus size={13} />
            </button>
          </div>
          <div className="space-y-0.5 mt-1">
            {visible.map((it) => (
              <div
                key={it.id}
                title={`${it.title}${it.courseCode ? ` — ${it.courseCode}` : ""}`}
                className="group/item flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate"
                style={{ backgroundColor: it.color + "26", color: it.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                <span className="truncate flex-1">{it.title}</span>
                {it.isManual && (
                  <button
                    onClick={() => onDelete(it.id)}
                    title="Delete event"
                    className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
                  >
                    <X size={9} />
                  </button>
                )}
              </div>
            ))}
            {!showAll && overflow > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-[10px] text-white/25 hover:text-white/50 font-mono transition-colors pl-0.5"
              >
                +{overflow} more
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function Calendar() {
  const assignments = useAppStore((s) => s.assignments);
  const courses = useAppStore((s) => s.courses);
  const calendarEvents = useAppStore((s) => s.calendarEvents);
  const addCalendarEvent = useAppStore((s) => s.addCalendarEvent);
  const removeCalendarEvent = useAppStore((s) => s.removeCalendarEvent);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const courseOverrides = useAppStore((s) => s.courseOverrides);

  // Exam dates added on the Modules page surface on the calendar too.
  const modules = useMemo(
    () => effectiveModules(courses, customCourses, courseStatus, courseOverrides),
    [courses, customCourses, courseStatus, courseOverrides],
  );

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // All courses are eligible — a calendar should show every dated item, not
  // just the current semester (that filter hid everything between terms).
  const courseMap = useMemo(() => {
    const m = new Map<string, Course>();
    courses.forEach((c) => m.set(c.id, c));
    return m;
  }, [courses]);

  // On first data load, jump to the month of the next upcoming deadline (or the
  // most recent one) so the calendar opens on real data instead of an empty month.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current || assignments.length === 0) return;
    didInit.current = true;
    const now = Date.now();
    const times = assignments
      .map((a) => (a.due_at ? new Date(a.due_at).getTime() : NaN))
      .filter((t) => !Number.isNaN(t));
    if (times.length === 0) return;
    const upcoming = times.filter((t) => t >= now).sort((a, b) => a - b);
    const target = upcoming.length ? upcoming[0] : Math.max(...times);
    const d = new Date(target);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [assignments]);

  // Merge assignments + manual events into a per-day map for the visible month.
  const itemsByDay = useMemo(() => {
    const map = new Map<number, DayItem[]>();
    const push = (day: number, item: DayItem) => {
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(item);
    };

    const inView = (d: Date) => d.getFullYear() === viewYear && d.getMonth() === viewMonth;

    assignments.forEach((a: Assignment) => {
      if (!a.due_at) return;
      const d = new Date(a.due_at);
      if (!inView(d)) return;
      const course = courseMap.get(a.course_id);
      push(d.getDate(), {
        id: a.id,
        title: a.name,
        category: a.assignment_category,
        color: course?.color ?? CATEGORY_COLORS[a.assignment_category] ?? "#6b7280",
        courseCode: course?.course_code,
        isManual: false,
      });
    });

    calendarEvents.forEach((e: CalendarEvent) => {
      const d = localDate(e.date);
      if (!inView(d)) return;
      const course = e.course_id ? courseMap.get(e.course_id) : undefined;
      push(d.getDate(), {
        id: e.id,
        title: e.title,
        category: e.category,
        color: course?.color ?? CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS.event,
        courseCode: course?.course_code,
        isManual: true,
      });
    });

    // Exam dates defined on the Modules page (read-only here; edit in Modules).
    modules.forEach((m) => {
      m.examDates.forEach((ex) => {
        const d = localDate(ex.date);
        if (!inView(d)) return;
        push(d.getDate(), {
          id: ex.id,
          title: `${m.course_code} ${ex.title}`,
          category: "exam",
          color: m.color,
          courseCode: m.course_code,
          isManual: false,
        });
      });
    });

    map.forEach((list) =>
      list.sort(
        (a, b) => (CATEGORY_PRIORITY[a.category] ?? 9) - (CATEGORY_PRIORITY[b.category] ?? 9),
      ),
    );
    return map;
  }, [assignments, calendarEvents, modules, courseMap, viewYear, viewMonth]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const totalThisMonth = [...itemsByDay.values()].reduce((acc, list) => acc + list.length, 0);

  // Courses that actually appear this month — keeps the legend compact.
  const monthCourses = useMemo(() => {
    const ids = new Set<string>();
    itemsByDay.forEach((list) => list.forEach((it) => it.courseCode && ids.add(it.courseCode)));
    return courses.filter((c) => ids.has(c.course_code));
  }, [itemsByDay, courses]);

  // ── Add-event modal ─────────────────────────────────────────────────────────
  const pad = (n: number) => String(n).padStart(2, "0");
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<{ date: string; title: string; category: CalendarEvent["category"]; course_id: string }>(
    { date: "", title: "", category: "event", course_id: "" },
  );

  const openAdd = (day?: number) => {
    const d = day ?? Math.min(today.getDate(), daysInMonth);
    setDraft({
      date: `${viewYear}-${pad(viewMonth + 1)}-${pad(day ?? d)}`,
      title: "",
      category: "event",
      course_id: "",
    });
    setAddOpen(true);
  };

  const saveDraft = () => {
    if (!draft.title.trim() || !draft.date) return;
    addCalendarEvent({
      title: draft.title.trim(),
      date: new Date(`${draft.date}T12:00:00`).toISOString(),
      category: draft.category,
      course_id: draft.course_id || undefined,
    });
    setAddOpen(false);
  };

  return (
    <div className="flex flex-col h-full p-6 pl-[240px] gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-white/90 tracking-tight">{monthName}</h1>
          <p className="text-[11px] text-white/30 font-mono mt-0.5">
            {totalThisMonth} item{totalThisMonth !== 1 ? "s" : ""} this month
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Course legend (this month) */}
          <div className="flex items-center gap-2 mr-3">
            {monthCourses.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[10px] font-mono text-white/40">{c.course_code}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => openAdd()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5252] hover:bg-[#FF6B6B] text-white text-[11px] font-medium transition-all"
          >
            <Plus size={13} /> Add event
          </button>
          <button onClick={prevMonth} className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all">
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
            className="px-3 py-1 rounded-lg text-[11px] font-mono text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
          >
            Today
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col gap-1 min-h-0">
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-mono text-white/25 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 flex-1">
          {cells.map((day, i) => (
            <CalendarDay
              key={i}
              day={day}
              items={day ? itemsByDay.get(day) ?? [] : []}
              isToday={
                day !== null &&
                viewYear === today.getFullYear() &&
                viewMonth === today.getMonth() &&
                day === today.getDate()
              }
              onAdd={openAdd}
              onDelete={removeCalendarEvent}
            />
          ))}
        </div>
      </div>

      {/* Add-event modal */}
      {addOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
          <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-white/[0.08] bg-[#100a0a]/95 backdrop-blur-xl shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/90">Add calendar event</h2>
              <button onClick={() => setAddOpen(false)} className="text-white/30 hover:text-white/70">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Title</label>
                <input
                  autoFocus
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && saveDraft()}
                  placeholder="e.g. SC2002 group meeting"
                  className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-white/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Date</label>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Type</label>
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as CalendarEvent["category"] }))}
                    className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
                  >
                    {["event", "homework", "quiz", "exam", "project", "lab"].map((c) => (
                      <option key={c} value={c} className="bg-[#0d0a0a]">{c[0].toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Module (optional)</label>
                <select
                  value={draft.course_id}
                  onChange={(e) => setDraft((d) => ({ ...d, course_id: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
                >
                  <option value="" className="bg-[#0d0a0a]">— none —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0d0a0a]">
                      {c.course_code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setAddOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDraft}
                disabled={!draft.title.trim() || !draft.date}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FF5252] hover:bg-[#FF6B6B] disabled:bg-white/[0.06] disabled:text-white/20 text-white text-xs font-medium transition-all"
              >
                <Plus size={13} /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
