import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Particles } from "@/components/background/Particles";
import { Layers, Plus, X, Pencil, Trash2, BookOpen, CalendarClock, GraduationCap, Search, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { apiPost } from "@/lib/api";
import { effectiveModules, moduleTopics, STATUS_META, type EffectiveModule } from "@/lib/modules";
import type { EnrollmentStatus, ModuleExam, ModuleOverride } from "@/types";

// Shape returned by the module lookup endpoints.
interface CatalogModule {
  course_id: string;
  name: string;
  credits: number;
  description?: string;
}

const STATUS_ORDER: EnrollmentStatus[] = ["current", "planned", "taken"];
const PALETTE = ["#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#EC4899", "#6366F1"];

export function Modules() {
  const courses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const concepts = useAppStore((s) => s.concepts);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const courseOverrides = useAppStore((s) => s.courseOverrides);
  const setCourseStatus = useAppStore((s) => s.setCourseStatus);
  const updateCourseOverride = useAppStore((s) => s.updateCourseOverride);
  const addCustomCourse = useAppStore((s) => s.addCustomCourse);
  const removeCustomCourse = useAppStore((s) => s.removeCustomCourse);

  const modules = useMemo(
    () => effectiveModules(courses, customCourses, courseStatus, courseOverrides),
    [courses, customCourses, courseStatus, courseOverrides],
  );

  const [editId, setEditId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const editing = modules.find((m) => m.id === editId) ?? null;

  return (
    <div className="h-full relative overflow-hidden atlas-hub-bg">
      <div className="absolute inset-0 z-0 pointer-events-none atlas-mesh-overlay" />
      <Particles className="z-[1]" quantity={80} staticity={60} ease={70} size={0.4} color="#ffffff" />

      <div className="relative z-10 h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 pt-14 pb-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#E84545] shadow-[0_0_30px_rgba(255,107,107,0.3)]">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
                  <span className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">My Modules</span>
                </div>
                <h1 className="text-2xl font-semibold text-white/95 tracking-tight">Module Manager</h1>
                <p className="mt-1 text-[13px] text-white/45 max-w-xl">
                  Separate what you're taking now from what you've done and what's ahead. Add your own
                  modules, and edit the retrieved info — professor, textbook, exam dates, topics.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF5252] hover:bg-[#FF6B6B] text-white text-xs font-semibold transition-all"
            >
              <Plus size={14} /> Add module
            </button>
          </motion.div>

          {/* Status sections */}
          <div className="mt-10 space-y-8">
            {STATUS_ORDER.map((status) => {
              const list = modules.filter((m) => m.status === status);
              const meta = STATUS_META[status];
              return (
                <section key={status}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                    <h2 className="text-sm font-semibold text-white/85">{meta.label}</h2>
                    <span className="text-[11px] font-mono text-white/30">{list.length}</span>
                  </div>
                  {list.length === 0 ? (
                    <p className="text-[12px] text-white/25 italic pl-5">No modules here yet.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {list.map((m) => (
                        <ModuleCard
                          key={m.id}
                          mod={m}
                          override={courseOverrides[m.id]}
                          onStatus={(st) => setCourseStatus(m.id, st)}
                          onEdit={() => setEditId(m.id)}
                          onDelete={m.isCustom ? () => removeCustomCourse(m.id) : undefined}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {editing && (
        <EditModuleModal
          mod={editing}
          override={courseOverrides[editing.id] ?? {}}
          concepts={concepts}
          onPatch={(patch) => updateCourseOverride(editing.id, patch)}
          onClose={() => setEditId(null)}
        />
      )}
      {addOpen && <AddModuleModal onAdd={addCustomCourse} onClose={() => setAddOpen(false)} />}
    </div>
  );
}

// ── Module card ───────────────────────────────────────────────────────────────

function ModuleCard({
  mod, override, onStatus, onEdit, onDelete,
}: {
  mod: EffectiveModule;
  override?: ModuleOverride;
  onStatus: (s: EnrollmentStatus) => void;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const hasExtra = !!(override && (override.textbook || override.examDates?.length || override.instructor || override.notes));
  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-xl overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: mod.color }} />
      <div className="pl-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">{mod.course_code}</span>
              {mod.isCustom && (
                <span className="rounded-full border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/40">Custom</span>
              )}
              {hasExtra && (
                <span className="rounded-full border border-[#FF6B6B]/25 bg-[#FF6B6B]/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[#FFB4B4]">Edited</span>
              )}
            </div>
            <p className="mt-0.5 text-[13px] text-white/70 truncate">{mod.name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-white/40">
              <span className="flex items-center gap-1"><GraduationCap size={11} /> {mod.instructor}</span>
              <span>{mod.credits} AU</span>
              {mod.textbook && <span className="flex items-center gap-1"><BookOpen size={11} /> {mod.textbook}</span>}
              {mod.examDates.length > 0 && (
                <span className="flex items-center gap-1"><CalendarClock size={11} /> {mod.examDates.length} exam{mod.examDates.length > 1 ? "s" : ""}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEdit} title="Edit module" className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all">
              <Pencil size={13} />
            </button>
            {onDelete && (
              <button onClick={onDelete} title="Remove module" className="p-1.5 rounded-lg text-white/40 hover:text-red-300 hover:bg-white/[0.06] transition-all">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Status switcher */}
        <div className="mt-3 flex items-center gap-1 rounded-lg border border-white/[0.06] bg-black/20 p-0.5 w-fit">
          {STATUS_ORDER.map((st) => {
            const active = mod.status === st;
            return (
              <button
                key={st}
                onClick={() => onStatus(st)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${active ? "text-white" : "text-white/35 hover:text-white/60"}`}
                style={active ? { backgroundColor: STATUS_META[st].color + "33", color: STATUS_META[st].color } : undefined}
              >
                {STATUS_META[st].label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Edit modal (professor / textbook / exam dates / topics / notes) ───────────

function EditModuleModal({
  mod, override, concepts, onPatch, onClose,
}: {
  mod: EffectiveModule;
  override: ModuleOverride;
  concepts: { course_id: string; label: string }[];
  onPatch: (patch: Partial<ModuleOverride>) => void;
  onClose: () => void;
}) {
  const topics = moduleTopics(mod.id, concepts as any, override);
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const addExam = () => {
    if (!examTitle.trim() || !examDate) return;
    const ex: ModuleExam = {
      id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title: examTitle.trim(),
      date: new Date(`${examDate}T12:00:00`).toISOString(),
    };
    onPatch({ examDates: [...(override.examDates ?? []), ex] });
    setExamTitle(""); setExamDate("");
  };
  const removeExam = (id: string) =>
    onPatch({ examDates: (override.examDates ?? []).filter((e) => e.id !== id) });

  const toggleExclude = (label: string) => {
    const ex = new Set(override.topicsExcluded ?? []);
    ex.has(label) ? ex.delete(label) : ex.add(label);
    onPatch({ topicsExcluded: [...ex] });
  };
  const addTopic = () => {
    if (!newTopic.trim()) return;
    onPatch({ topicsAdded: [...(override.topicsAdded ?? []), newTopic.trim()] });
    setNewTopic("");
  };
  const removeAddedTopic = (label: string) =>
    onPatch({ topicsAdded: (override.topicsAdded ?? []).filter((t) => t !== label) });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#100a0a]/95 backdrop-blur-xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-white/90">
            Edit <span className="font-mono">{mod.course_code}</span>
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70"><X size={16} /></button>
        </div>
        <p className="text-[11px] text-white/35 mb-4">{mod.name} · retrieved info + your edits</p>

        <div className="space-y-4">
          <Field label="Professor">
            <input
              value={mod.instructor}
              onChange={(e) => onPatch({ instructor: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Textbook">
            <input
              value={mod.textbook}
              onChange={(e) => onPatch({ textbook: e.target.value })}
              placeholder="e.g. CLRS, 4th ed."
              className={inputCls}
            />
          </Field>

          {/* Exam dates */}
          <Field label="Exam dates">
            <div className="space-y-1.5">
              {(override.examDates ?? []).map((ex) => (
                <div key={ex.id} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[12px]">
                  <CalendarClock size={12} className="text-[#FFB4B4]" />
                  <span className="text-white/80">{ex.title}</span>
                  <span className="ml-auto font-mono text-white/40">{new Date(ex.date).toLocaleDateString("en-SG", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <button onClick={() => removeExam(ex.id)} className="text-white/30 hover:text-red-300"><X size={11} /></button>
                </div>
              ))}
              <div className="flex gap-1.5">
                <input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="Exam name" className={`${inputCls} flex-1`} />
                <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`${inputCls} [color-scheme:dark] w-[140px]`} />
                <button onClick={addExam} disabled={!examTitle.trim() || !examDate} className="px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-30 text-white/70"><Plus size={14} /></button>
              </div>
              <p className="text-[10px] text-white/25">Added exams also appear on your Calendar.</p>
            </div>
          </Field>

          {/* Topics */}
          <Field label="Topics (retrieved + extra)">
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <button
                  key={t.label + (t.custom ? "-c" : "")}
                  onClick={() => (t.custom ? removeAddedTopic(t.label) : toggleExclude(t.label))}
                  title={t.custom ? "Remove topic" : t.excluded ? "Excluded — click to include" : "Click to exclude"}
                  className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-all ${
                    t.excluded
                      ? "border-white/10 bg-transparent text-white/25 line-through"
                      : t.custom
                        ? "border-[#FF6B6B]/25 bg-[#FF6B6B]/10 text-[#FFB4B4]"
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200/85"
                  }`}
                >
                  {t.label}
                  {t.custom && <X size={9} />}
                </button>
              ))}
              {topics.length === 0 && <span className="text-[11px] text-white/25">No retrieved topics for this module.</span>}
            </div>
            <div className="mt-2 flex gap-1.5">
              <input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTopic()} placeholder="Add a topic…" className={`${inputCls} flex-1`} />
              <button onClick={addTopic} disabled={!newTopic.trim()} className="px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-30 text-white/70"><Plus size={14} /></button>
            </div>
          </Field>

          <Field label="Notes">
            <textarea
              value={mod.notes}
              onChange={(e) => onPatch({ notes: e.target.value })}
              rows={2}
              placeholder="Anything else — topic exclusions rationale, grading scheme, etc."
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-[#FF5252] hover:bg-[#FF6B6B] text-white text-xs font-medium transition-all">Done</button>
        </div>
      </div>
    </div>
  );
}

// ── Add custom module modal ───────────────────────────────────────────────────

function AddModuleModal({
  onAdd, onClose,
}: {
  onAdd: (c: { course_code: string; name: string; instructor?: string; credits?: number; color: string; status: EnrollmentStatus }) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [credits, setCredits] = useState(3);
  const [color, setColor] = useState(PALETTE[0]);
  const [status, setStatus] = useState<EnrollmentStatus>("current");

  // NTU catalog lookup (GET /api/ntu/courses → real NTU source or mock fallback)
  const [catalog, setCatalog] = useState<CatalogModule[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchNonce, setSearchNonce] = useState(0);

  const loadCatalog = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setCatalog([]);
      setCatalogError(false);
      setLoadingCatalog(false);
      return;
    }

    setLoadingCatalog(true);
    setCatalogError(false);
    apiPost<CatalogModule[]>("/exa/search-courses", {
      query: trimmed,
      num_results: 8,
    })
      .then((d) => setCatalog(d))
      .catch(() => {
        setCatalog([]);
        setCatalogError(true);
      })
      .finally(() => setLoadingCatalog(false));
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const handle = window.setTimeout(() => {
      loadCatalog(trimmed);
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, loadCatalog, searchNonce]);

  // Seed the manual fields from whatever the user typed (no-match path).
  const useTypedAsCode = () => {
    const token = query.trim().split(/[\s—]+/)[0].toUpperCase();
    if (token) setCode(token);
    setShowResults(false);
  };

  const results = useMemo(() => catalog.slice(0, 8), [catalog]);

  const pick = (m: CatalogModule) => {
    setCode(m.course_id);
    setName(m.name);
    if (m.credits) setCredits(m.credits);
    setQuery(`${m.course_id} — ${m.name}`);
    setShowResults(false);
  };

  const save = () => {
    if (!code.trim() || !name.trim()) return;
    onAdd({ course_code: code.trim().toUpperCase(), name: name.trim(), instructor: instructor.trim() || undefined, credits, color, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-white/[0.08] bg-[#100a0a]/95 backdrop-blur-xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/90">Add your own module</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          {/* Exa course lookup */}
          <div className="relative">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Look up with Exa</label>
            <div className="relative mt-1">
              {loadingCatalog ? (
                <Loader2 size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 animate-spin" />
              ) : (
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
              )}
              <input
                value={query}
                onChange={(e) => {
                  const next = e.target.value;
                  setQuery(next);
                  setShowResults(true);
                  if (!next.trim()) {
                    setCatalog([]);
                    setCatalogError(false);
                    setLoadingCatalog(false);
                  }
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search code or name, e.g. SC3010 or Algorithm Design"
                className={`${inputCls} pl-8`}
              />
            </div>
            {showResults && query.trim() && results.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#0d0a0a] shadow-2xl">
                {results.map((m) => (
                  <button
                    key={m.course_id}
                    onClick={() => pick(m)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-white/[0.06] transition-colors"
                  >
                    <span className="min-w-0 flex items-baseline gap-2">
                      <span className="font-mono text-xs text-white/85">{m.course_id}</span>
                      <span className="text-[12px] text-white/50 truncate">{m.name}</span>
                    </span>
                    <span className="text-[10px] text-white/30 shrink-0">{m.credits} AU</span>
                  </button>
                ))}
              </div>
            )}
            {showResults && query.trim() && !loadingCatalog && results.length === 0 && (
              <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
                <span className="text-[10px] text-white/35 min-w-0 truncate">
                  {catalogError
                    ? "Couldn't reach Exa course search — add it manually:"
                    : `No match for “${query.trim()}” — add it manually:`}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={useTypedAsCode}
                    className="rounded-md bg-white/[0.06] hover:bg-white/[0.1] px-2 py-1 text-[10px] text-white/70 transition-colors"
                  >
                    Use as code
                  </button>
                  {catalogError && (
                    <button
                      onClick={() => setSearchNonce((n) => n + 1)}
                      className="rounded-md bg-white/[0.06] hover:bg-white/[0.1] px-2 py-1 text-[10px] text-white/70 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SC3010" className={`${inputCls} mt-1`} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Computer Security" className={`${inputCls} mt-1`} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Professor</label>
              <input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="optional" className={`${inputCls} mt-1`} />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">AU</label>
              <input type="number" min={0} max={12} value={credits} onChange={(e) => setCredits(Number(e.target.value))} className={`${inputCls} mt-1`} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Status</label>
            <div className="mt-1 flex gap-1 rounded-lg border border-white/[0.06] bg-black/20 p-0.5 w-fit">
              {STATUS_ORDER.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatus(st)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all"
                  style={status === st ? { backgroundColor: STATUS_META[st].color + "33", color: STATUS_META[st].color } : { color: "rgba(255,255,255,0.35)" }}
                >
                  {STATUS_META[st].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Colour</label>
            <div className="mt-1 flex gap-1.5">
              {PALETTE.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`h-6 w-6 rounded-full transition-transform ${color === c ? "ring-2 ring-white/60 scale-110" : ""}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80">Cancel</button>
          <button onClick={save} disabled={!code.trim() || !name.trim()} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FF5252] hover:bg-[#FF6B6B] disabled:bg-white/[0.06] disabled:text-white/20 text-white text-xs font-medium transition-all">
            <Plus size={13} /> Add module
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-white/20 focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
