import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Inbox,
  Loader2,
  Mail,
  Plus,
  ShieldX,
  Users,
  X,
  Zap,
} from "lucide-react";
import { effectiveModules } from "@/lib/modules";
import { useAppStore } from "@/store/useAppStore";
import type { ZODigest, ZOEmailSummary } from "@/types";

const FILTER_STORAGE_KEY = "atlas.digest.ignoreFilters";
const DIGEST_CACHE_KEY = "atlas.digest.cache";
const FILTER_PRESETS = ["newsletter", "marketing", "promo", "no-reply", "club", "sale"];

type DigestSnapshotMeta = {
  updatedAt: string;
  emails: number;
  ignored: number;
  calendar: number;
  scopeCourseCodes: string[];
};

type DigestCacheRecord = {
  signature: string;
  digest: ZODigest;
  meta?: DigestSnapshotMeta;
};

type DigestListKey =
  | "deadlines"
  | "exams"
  | "meetings"
  | "upcoming_events"
  | "action_items"
  | "needs_reply";

const DEFAULT_DEMO_DIGEST: ZODigest = {
  summary:
    "Morning digest: SC2001 has a quiz on Monday at 10:00 AM in LT2, SC2002 moved its design review to Tuesday at 2:00 PM with the UML deck due tonight, and SC2005 Lab 3 closes on Wednesday at 11:59 PM.",
  upcoming_events: [
    "SC2001 quiz on Monday, June 29 from 10:00 AM to 11:00 AM at LT2.",
    "SC2002 design review on Tuesday, June 30 at 2:00 PM over Zoom.",
    "SC2005 Lab 3 submission closes on Wednesday, July 1 at 11:59 PM.",
  ],
  exams: [
    "SC2001 quiz on Monday, June 29 at 10:00 AM in LT2.",
  ],
  meetings: [
    "SC2002 team design review on Tuesday, June 30 at 2:00 PM over Zoom.",
  ],
  deadlines: [
    "Upload the SC2002 UML deck by Monday, June 29 at 10:00 PM.",
    "Confirm the SC2002 presenter before Tuesday at 12:00 PM.",
    "Submit SC2005 Lab 3 before Wednesday, July 1 at 11:59 PM.",
  ],
  action_items: [
    "Finish the SC2002 design deck and push the latest diagrams tonight.",
    "Reply to confirm who is presenting for the SC2002 review.",
    "Run the SC2005 Linux test suite before the lab deadline.",
  ],
  needs_reply: [
    "SC2002 design review email needs a presenter confirmation reply.",
  ],
  email_summaries: [
    {
      id: "mail-1",
      subject: "SC2001 quiz reminder",
      from_line: "Prof Tan <prof.tan@ntu.edu.sg>",
      received_at: "Fri, Jun 27, 8:15 AM",
      summary:
        "Your SC2001 quiz is scheduled for Monday at 10:00 AM in LT2. Prof Tan also reminded students to bring their calculator and arrive 10 minutes early.",
      tags: ["quiz", "course"],
      needs_reply: false,
      related_calendar: [
        "SC2001 Quiz - Monday, June 29, 10:00 AM to 11:00 AM at LT2.",
      ],
    },
    {
      id: "mail-2",
      subject: "SC2002 design review updated",
      from_line: "Course Coordinator <sc2002@ntu.edu.sg>",
      received_at: "Fri, Jun 27, 9:05 AM",
      summary:
        "The SC2002 design review moved to Tuesday at 2:00 PM on Zoom. Your team needs to upload the UML deck by Monday night and confirm the presenter before Tuesday noon.",
      tags: ["meeting", "deadline", "reply needed"],
      needs_reply: true,
      related_calendar: [
        "SC2002 Design Review - Tuesday, June 30, 2:00 PM on Zoom.",
      ],
    },
    {
      id: "mail-3",
      subject: "SC2005 Lab 3 grading window",
      from_line: "OS Teaching Team <sc2005-labs@ntu.edu.sg>",
      received_at: "Fri, Jun 27, 10:20 AM",
      summary:
        "SC2005 Lab 3 is due on Wednesday at 11:59 PM. The teaching team recommends rerunning the public tests on the Linux lab image before submitting.",
      tags: ["lab", "deadline", "systems"],
      needs_reply: false,
      related_calendar: [],
    },
  ],
};

const DEFAULT_DEMO_META: DigestSnapshotMeta = {
  updatedAt: "2026-06-27T08:00:00+08:00",
  emails: 3,
  ignored: 2,
  calendar: 2,
  scopeCourseCodes: ["SC2001", "SC2002", "SC2005", "SC1015"],
};

const DEFAULT_DEMO_CACHE: DigestCacheRecord = {
  signature: "demo-seed-2026-06-27",
  digest: DEFAULT_DEMO_DIGEST,
  meta: DEFAULT_DEMO_META,
};

const DIGEST_SECTIONS: Array<{
  key: DigestListKey;
  label: string;
  icon: typeof Inbox;
  color: string;
}> = [
  { key: "deadlines", label: "Deadlines", icon: AlertCircle, color: "#FF6B6B" },
  { key: "exams", label: "Exams", icon: BookOpen, color: "#F59E0B" },
  { key: "meetings", label: "Meetings", icon: Users, color: "#818CF8" },
  { key: "upcoming_events", label: "Upcoming Events", icon: CalendarDays, color: "#34D399" },
  { key: "action_items", label: "Action Items", icon: CheckSquare, color: "#60A5FA" },
  { key: "needs_reply", label: "Needs Reply", icon: Mail, color: "#F472B6" },
];

function loadIgnoreFilters() {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeFilter(value: string) {
  return value.trim().toLowerCase();
}

function loadCachedDigest(): DigestCacheRecord | null {
  if (typeof localStorage === "undefined") return DEFAULT_DEMO_CACHE;
  try {
    const raw = localStorage.getItem(DIGEST_CACHE_KEY);
    if (!raw) {
      localStorage.setItem(DIGEST_CACHE_KEY, JSON.stringify(DEFAULT_DEMO_CACHE));
      return DEFAULT_DEMO_CACHE;
    }
    const parsed = JSON.parse(raw) as DigestCacheRecord;
    if (!isUsableDigestCache(parsed)) {
      localStorage.setItem(DIGEST_CACHE_KEY, JSON.stringify(DEFAULT_DEMO_CACHE));
      return DEFAULT_DEMO_CACHE;
    }
    return parsed;
  } catch {
    try {
      localStorage.setItem(DIGEST_CACHE_KEY, JSON.stringify(DEFAULT_DEMO_CACHE));
    } catch {
      // Ignore quota / private-mode errors.
    }
    return DEFAULT_DEMO_CACHE;
  }
}

function isUsableDigestCache(value: DigestCacheRecord | null | undefined): value is DigestCacheRecord {
  if (!value || typeof value.signature !== "string" || !value.digest) return false;

  const summary = value.digest.summary?.trim() ?? "";
  const hasSections = DIGEST_SECTIONS.some(({ key }) => (value.digest[key] ?? []).length > 0);
  const hasEmailSummaries = (value.digest.email_summaries ?? []).some((item) => {
    const subject = item.subject?.trim() ?? "";
    const details = item.summary?.trim() ?? "";
    return Boolean(subject) && details.length > 12 && details.toLowerCase() !== "all...";
  });

  if (!summary || summary.toLowerCase() === "emails: all") return false;
  return hasSections || hasEmailSummaries;
}

function digestMeta(record: DigestCacheRecord | null) {
  return { ...DEFAULT_DEMO_META, ...(record?.meta ?? {}) };
}

function formatUpdatedAt(updatedAt?: string) {
  if (!updatedAt) return "Updated demo seed";
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "Updated demo seed";

  const label = date.toLocaleString("en-SG", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Singapore",
  });
  return `Updated ${label} SGT`;
}

export function Digest() {
  const [hydrated, setHydrated] = useState(false);
  const [cacheRecord, setCacheRecord] = useState<DigestCacheRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterInput, setFilterInput] = useState("");
  const [ignoreFilters, setIgnoreFilters] = useState<string[]>(() => loadIgnoreFilters());

  const courses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const courseOverrides = useAppStore((s) => s.courseOverrides);
  const digest = useAppStore((s) => s.zoDigest);
  const loading = useAppStore((s) => s.zoDigestLoading);
  const setZODigest = useAppStore((s) => s.setZODigest);
  const setZODigestLoading = useAppStore((s) => s.setZODigestLoading);

  const modules = useMemo(
    () => effectiveModules(courses, customCourses, courseStatus, courseOverrides),
    [courses, customCourses, courseStatus, courseOverrides],
  );

  const currentModules = useMemo(
    () => modules.filter((module) => module.status === "current"),
    [modules],
  );

  const meta = digestMeta(cacheRecord);
  const scopeCodes = meta.scopeCourseCodes.map((code) => code.toUpperCase());
  const scopedModules = useMemo(() => {
    const codeSet = new Set(scopeCodes);
    const matched = currentModules.filter((module) => codeSet.has(module.course_code.toUpperCase()));
    return matched.length ? matched : currentModules;
  }, [currentModules, scopeCodes]);

  const scopeModuleCount = currentModules.length || scopeCodes.length;
  const updatedLabel = formatUpdatedAt(meta.updatedAt);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(ignoreFilters));
    } catch {
      // Ignore persistence issues in private mode or quota errors.
    }
  }, [ignoreFilters]);

  const addFilter = (value: string) => {
    const next = normalizeFilter(value);
    if (!next || ignoreFilters.includes(next)) return;
    setIgnoreFilters((current) => [...current, next]);
    setFilterInput("");
  };

  const removeFilter = (value: string) => {
    setIgnoreFilters((current) => current.filter((item) => item !== value));
  };

  useEffect(() => {
    if (!hydrated) return;

    const cached = loadCachedDigest();
    setCacheRecord(cached);
    setZODigestLoading(false);

    if (cached?.digest) {
      setZODigest(cached.digest);
      setError(null);
      return;
    }

    setZODigest(null);
    setError("No stored ZO digest is available yet.");
  }, [hydrated, setZODigest, setZODigestLoading]);

  return (
    <div className="w-full h-full overflow-y-auto pl-[240px] pr-10 pt-10 pb-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
              ZO Email
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white/92">Daily Digest</h1>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-white/42">
            Atlas now treats the ZO page as a stored daily digest for the modules marked Current in
            Modules. This screen no longer behaves like an inbox import tool.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <Inbox size={14} className="mt-0.5 shrink-0 text-red-300" />
            <p className="text-[12px] text-red-300">{error}</p>
          </div>
        )}

        <ZOOutputPanel digest={digest} loading={loading} updatedLabel={updatedLabel} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6">
            <div className="mb-4 flex items-center gap-2">
              <Mail size={15} className="text-[#FF6B6B]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
                Digest Scope
              </span>
            </div>

            <p className="text-[13px] leading-relaxed text-white/45">
              Atlas uses your Current modules as the live scope for the daily digest, command
              center, and study surfaces. Taken and planned modules still stay available in
              Profile, Modules, and Career.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <SnapshotMetric label="Current" value={String(scopeModuleCount)} caption="active modules" />
              <SnapshotMetric label="Emails" value={String(meta.emails)} caption="summarized" />
              <SnapshotMetric label="Ignored" value={String(meta.ignored)} caption="held back" />
              <SnapshotMetric label="Calendar" value={String(meta.calendar)} caption="linked items" />
            </div>

            <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/35">
                Current Modules
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {scopedModules.length > 0 ? (
                  scopedModules.map((module) => (
                    <ModuleChip
                      key={module.id}
                      color={module.color}
                      code={module.course_code}
                      name={module.name}
                    />
                  ))
                ) : (
                  scopeCodes.map((code) => (
                    <span
                      key={code}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono text-white/55"
                    >
                      {code}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6">
            <div className="mb-3 flex items-center gap-2">
              <ShieldX size={15} className="text-[#FFB86B]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
                Ignore Filters
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-white/42">
              Keep local ignore rules here for the next scheduled 8:00 AM run. They do not rewrite
              the current stored digest immediately.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {ignoreFilters.length === 0 ? (
                <span className="text-[11px] text-white/25">No ignore rules yet.</span>
              ) : (
                ignoreFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => removeFilter(filter)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#FFB86B]/20 bg-[#FFB86B]/10 px-2.5 py-1 text-[11px] text-[#FFD4A1] transition-colors hover:bg-[#FFB86B]/15"
                  >
                    {filter}
                    <X size={10} />
                  </button>
                ))
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <input
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFilter(filterInput);
                  }
                }}
                placeholder="Add sender, keyword, or spam marker"
                className="rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2 text-[13px] text-white/80 placeholder-white/20 outline-none focus:border-[#FFB86B]/35"
              />
              <button
                onClick={() => addFilter(filterInput)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#FFB86B]/20 bg-[#FFB86B]/10 px-4 py-2 text-[12px] font-medium text-[#FFD4A1] transition-colors hover:bg-[#FFB86B]/15"
              >
                <Plus size={12} />
                Add Filter
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {FILTER_PRESETS.map((preset) => {
                const active = ignoreFilters.includes(preset);
                return (
                  <button
                    key={preset}
                    onClick={() => (active ? removeFilter(preset) : addFilter(preset))}
                    className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                      active
                        ? "border-[#FFB86B]/25 bg-[#FFB86B]/12 text-[#FFD4A1]"
                        : "border-white/[0.08] bg-white/[0.03] text-white/35 hover:text-white/60"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZOOutputPanel({
  digest,
  loading,
  updatedLabel,
}: {
  digest: ZODigest | null;
  loading: boolean;
  updatedLabel: string;
}) {
  const activeSections = DIGEST_SECTIONS.filter(({ key }) => digest && digest[key]?.length > 0);

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Zap size={15} className="text-[#FF6B6B]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
              ZO Output
            </span>
          </div>
          <p className="max-w-3xl text-[13px] leading-relaxed text-white/42">
            This is the stored ZO response for the current-module daily digest, with the main
            summary first and the per-email breakdown underneath.
          </p>
        </div>

        {digest && !loading && (
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-white/35">
            {updatedLabel}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-white/35">
          <Loader2 size={22} className="animate-spin text-[#FF6B6B]" />
          <p className="text-[12px]">Pulling the latest ZO output...</p>
        </div>
      ) : digest ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Inbox size={14} className="text-[#FF6B6B]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
                Summary
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-white/74">{digest.summary || "No summary returned."}</p>
          </div>

          {digest.email_summaries?.length > 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Mail size={14} className="text-[#FFAB91]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
                  Email By Email
                </span>
                <span className="ml-auto text-[10px] text-white/22">{digest.email_summaries.length}</span>
              </div>

              <div className="space-y-3">
                {digest.email_summaries.map((item) => (
                  <EmailSummaryCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {activeSections.length > 0 && (
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {activeSections.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon size={13} style={{ color }} />
                    <span
                      className="text-[10px] font-mono uppercase tracking-[0.18em]"
                      style={{ color: `${color}AA` }}
                    >
                      {label}
                    </span>
                    <span className="ml-auto text-[10px] text-white/22">{digest[key].length}</span>
                  </div>

                  <div className="space-y-2">
                    {digest[key].map((entry, index) => (
                      <div key={`${key}-${index}`} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                        <p className="text-[12px] leading-relaxed text-white/62">{entry}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center text-white/30">
          <Inbox size={24} className="text-white/20" />
          <p className="max-w-sm text-[13px] leading-relaxed">
            Waiting for a stored ZO digest from the scheduled 8:00 AM run.
          </p>
        </div>
      )}
    </div>
  );
}

function SnapshotMetric({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/28">{label}</p>
      <p className="mt-2 text-[22px] font-semibold text-white/84">{value}</p>
      <p className="mt-1 text-[11px] text-white/32">{caption}</p>
    </div>
  );
}

function ModuleChip({
  code,
  color,
  name,
}: {
  code: string;
  color: string;
  name: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[11px] font-mono text-white/70">{code}</span>
      <span className="text-[11px] text-white/38">{name}</span>
    </div>
  );
}

function EmailSummaryCard({ item }: { item: ZOEmailSummary }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-white/80">{item.subject || "Untitled email"}</p>
          <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-white/30">
            {item.from_line && <span>{item.from_line}</span>}
            {item.received_at && <span>{item.received_at}</span>}
          </div>
        </div>

        {item.needs_reply && (
          <span className="rounded-full border border-[#F472B6]/20 bg-[#F472B6]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-[#F9A8D4]">
            Reply
          </span>
        )}
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-white/64">{item.summary}</p>

      {(item.tags.length > 0 || item.related_calendar.length > 0) && (
        <div className="mt-3 space-y-2">
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={`${item.id}-${tag}`}
                  className="rounded-full border border-white/[0.08] bg-black/20 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-white/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {item.related_calendar.length > 0 && (
            <div className="rounded-xl border border-[#818CF8]/15 bg-[#818CF8]/8 px-3 py-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#B8BEFF]/80">
                Related Calendar
              </p>
              <div className="mt-1 space-y-1">
                {item.related_calendar.map((entry, index) => (
                  <p key={`${item.id}-calendar-${index}`} className="text-[11px] leading-relaxed text-white/52">
                    {entry}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
