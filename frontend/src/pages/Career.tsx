import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Sparkles, Target, MessageSquareText, Copy, Check,
  MapPin, TrendingUp, AlertTriangle, ArrowUpRight, Loader2, ChevronDown,
} from "lucide-react";
import { Particles } from "@/components/background/Particles";
import { effectiveModuleBuckets } from "@/lib/modules";
import { useAppStore } from "@/store/useAppStore";
import { apiPost } from "@/lib/api";
import { getMasteryTier } from "@/types";
import { cn } from "@/lib/utils";

// ── API shapes (mirror backend/models/career_schemas.py) ────────────────────
interface ProfileStrength { skill: string; mastery: number; evidence: string }
interface CareerProfile {
  headline: string; summary: string; strengths: ProfileStrength[];
  developing: string[]; resume_bullets: string[]; suggested_roles: string[];
}
interface SkillMatch { skill: string; mastery: number; matched_concept?: string }
interface JobMatch {
  id: string; title: string; company: string; location: string; type: string;
  level: string; salary: string; source: string; url: string; summary: string;
  tags: string[]; fit_score: number; matched_skills: SkillMatch[]; missing_skills: string[];
}
interface InterviewQuestion {
  type: string; question: string; grounded_in: string; assesses: string; answer_hint: string;
}

type Tab = "profile" | "match" | "interview";

const ACCENT = "#FF6B6B";

export function Career() {
  const concepts = useAppStore((s) => s.concepts);
  const assignments = useAppStore((s) => s.assignments);
  const courses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const courseOverrides = useAppStore((s) => s.courseOverrides);
  const setPendingChatPrompt = useAppStore((s) => s.setPendingChatPrompt);
  const setChatModalOpen = useAppStore((s) => s.setChatModalOpen);

  const [tab, setTab] = useState<Tab>("profile");

  const moduleBuckets = useMemo(
    () => effectiveModuleBuckets(courses, customCourses, courseStatus, courseOverrides),
    [courses, customCourses, courseStatus, courseOverrides],
  );

  const evidenceCourseIds = useMemo(() => {
    const ids = new Set<string>();
    [...moduleBuckets.current, ...moduleBuckets.taken].forEach((module) => ids.add(module.id));
    return ids;
  }, [moduleBuckets]);

  const plannedModules = moduleBuckets.planned;

  // Shared payloads built from the student's real academic data
  const conceptPayload = useMemo(
    () =>
      concepts
        .filter((concept) => evidenceCourseIds.has(concept.course_id))
        .map((concept) => ({ label: concept.label, mastery: concept.mastery, course_id: concept.course_id })),
    [concepts, evidenceCourseIds],
  );
  const projectPayload = useMemo(() => {
    const code = Object.fromEntries(courses.map((c) => [c.id, c.course_code]));
    return assignments
      .filter(
        (assignment) =>
          evidenceCourseIds.has(assignment.course_id) &&
          assignment.assignment_category === "project" &&
          (assignment.has_submitted_submissions || assignment.status === "graded"),
      )
      .map((a) => ({ name: a.name, course_id: code[a.course_id] ?? a.course_id, description: a.description }));
  }, [assignments, courses, evidenceCourseIds]);

  // Cross-tab: jumping from a job card into interview prep pre-filled
  const [interviewRole, setInterviewRole] = useState("");
  const goPrep = useCallback((role: string) => {
    setInterviewRole(role);
    setTab("interview");
  }, []);

  // Gap → remediation loop: reuse the chat modal wiring InspectorPanel uses
  const closeGap = useCallback((skill: string, job: JobMatch) => {
    setPendingChatPrompt(
      `I'm targeting the "${job.title}" role at ${job.company}, but I'm weak on "${skill}". ` +
      `Build me a focused, step-by-step study plan to get from my current level to job-ready on this, ` +
      `using my actual course context. Keep it concrete and time-boxed.`,
    );
    setChatModalOpen(true);
  }, [setPendingChatPrompt, setChatModalOpen]);

  return (
    <div className="relative w-full min-h-full">
      <Particles className="z-[1]" quantity={60} staticity={60} ease={70} size={0.4} color="#ffffff" />

      <div className="relative z-10 mx-auto max-w-5xl px-8 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#E84545] shadow-[0_0_30px_rgba(255,107,107,0.3)]">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Career</h1>
              <p className="text-xs font-medium tracking-wide text-white/40">
                Powered by <span className="text-white/70">'Sup</span> — your coursework is the spine
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
            Atlas already knows what you've mastered. This turns your knowledge graph and real
            projects into an evidence-backed profile, ranks live roles against it, and drills you
            on the work you actually did.
          </p>
          <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-white/38">
            Career scoring uses your current and taken modules as evidence. Planned modules stay visible
            for future targeting, but they remain secondary until you mark them current.
          </p>
          {plannedModules.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {plannedModules.map((module) => (
                <span
                  key={module.id}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wide text-white/45"
                >
                  {module.course_code}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 w-fit">
          {([
            ["profile", "Profile", Sparkles],
            ["match", "Job Match", Target],
            ["interview", "Interview Prep", MessageSquareText],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                tab === id ? "bg-white/[0.08] text-white shadow-sm" : "text-white/40 hover:text-white/70",
              )}
            >
              <Icon className="h-4 w-4" style={{ color: tab === id ? ACCENT : undefined }} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "profile" && <ProfileTab concepts={conceptPayload} projects={projectPayload} />}
              {tab === "match" && <MatchTab concepts={conceptPayload} onCloseGap={closeGap} onPrep={goPrep} />}
              {tab === "interview" && (
                <InterviewTab
                  concepts={conceptPayload}
                  projects={projectPayload}
                  role={interviewRole}
                  setRole={setInterviewRole}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Shared bits ─────────────────────────────────────────────────────────────

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl", className)}>{children}</div>;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-10 text-sm text-white/50">
      <Loader2 className="h-4 w-4 animate-spin" style={{ color: ACCENT }} />
      {label}
    </div>
  );
}

function masteryColor(m: number) {
  return getMasteryTier(m).color;
}

// ── Profile tab ─────────────────────────────────────────────────────────────

function ProfileTab({ concepts, projects }: { concepts: any[]; projects: any[] }) {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [copied, setCopied] = useState(false);

  const build = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiPost<CareerProfile>("/career/profile", {
        concepts, projects, target: target.trim() || undefined,
      });
      setProfile(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build profile");
    } finally {
      setLoading(false);
    }
  };

  const copyBullets = () => {
    if (!profile) return;
    navigator.clipboard?.writeText(profile.resume_bullets.map((b) => `• ${b}`).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <GlassCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Target role (optional)</label>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. ML engineer intern, quant research"
              className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-white/20 focus:outline-none"
            />
          </div>
          <button
            onClick={build}
            disabled={loading}
            className="glow-button flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#E84545] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {profile ? "Rebuild" : "Build my profile"}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-white/35">
          Auto-built from {concepts.length} tracked concepts and {projects.length} completed projects.
        </p>
      </GlassCard>

      {loading && <Spinner label="Reading your mastery graph and writing your profile…" />}
      {error && <GlassCard className="border-red-500/30 text-sm text-red-300">{error}</GlassCard>}

      {profile && !loading && (
        <>
          <GlassCard>
            <h2 className="text-lg font-bold text-white">{profile.headline}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{profile.summary}</p>
          </GlassCard>

          {profile.strengths.length > 0 && (
            <GlassCard>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="h-4 w-4" style={{ color: "#10B981" }} /> Strengths
              </h3>
              <div className="space-y-3">
                {profile.strengths.map((s, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-white/90">{s.skill}</span>
                      <span className="font-mono text-xs" style={{ color: masteryColor(s.mastery) }}>{s.mastery}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full" style={{ width: `${s.mastery}%`, background: masteryColor(s.mastery) }} />
                    </div>
                    {s.evidence && <p className="mt-1 text-[11px] text-white/40">{s.evidence}</p>}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {profile.resume_bullets.length > 0 && (
            <GlassCard>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Resume bullets</h3>
                <button onClick={copyBullets} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy all"}
                </button>
              </div>
              <ul className="space-y-2">
                {profile.resume_bullets.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm text-white/70">
                    <span style={{ color: ACCENT }}>▸</span>{b}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {profile.developing.length > 0 && (
              <GlassCard>
                <h3 className="mb-3 text-sm font-bold text-white">Developing</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.developing.map((d, i) => (
                    <span key={i} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200/80">{d}</span>
                  ))}
                </div>
              </GlassCard>
            )}
            {profile.suggested_roles.length > 0 && (
              <GlassCard>
                <h3 className="mb-3 text-sm font-bold text-white">Competitive for</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.suggested_roles.map((r, i) => (
                    <span key={i} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-white/70">{r}</span>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Job Match tab ───────────────────────────────────────────────────────────

function MatchTab({
  concepts, onCloseGap, onPrep,
}: { concepts: any[]; onCloseGap: (skill: string, job: JobMatch) => void; onPrep: (role: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<JobMatch[] | null>(null);
  const [query, setQuery] = useState("");

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiPost<{ matches: JobMatch[] }>("/career/match", {
        concepts,
        limit: 10,
        query: query.trim() || undefined,
      });
      setMatches(res.matches);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to match jobs");
    } finally {
      setLoading(false);
    }
  };

  // Auto-run once when the tab is first opened
  useEffect(() => { if (matches === null && !loading) run(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Role or keywords (optional)</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
              placeholder="e.g. backend engineer intern, ML internship Singapore, quant research"
              className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-white/20 focus:outline-none"
            />
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="glow-button flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#E84545] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Target className="h-4 w-4" />
            Search live roles
          </button>
        </div>
        <p className="mt-3 text-[11px] text-white/35">
          Searches live public job pages and ranks them against your mastery graph. Leave blank for a broad CS role sweep.
        </p>
      </GlassCard>

      {loading && <Spinner label="Scoring roles against your knowledge graph…" />}
      {error && <GlassCard className="border-red-500/30 text-sm text-red-300">{error}</GlassCard>}

      {matches?.map((job) => (
        <GlassCard key={job.id} className="transition-colors hover:border-white/[0.12]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white">{job.title}</h3>
                {job.tags.map((t) => (
                  <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/45">{t}</span>
                ))}
              </div>
              <p className="mt-0.5 text-sm font-medium text-white/70">{job.company}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/40">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                <span>{job.level}</span>
                <span className="text-white/55">{job.salary}</span>
                <span>via {job.source}</span>
              </div>
            </div>
            <FitRing score={job.fit_score} />
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-white/50">{job.summary}</p>

          {job.matched_skills.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">You bring</p>
              <div className="flex flex-wrap gap-1.5">
                {job.matched_skills.map((s) => (
                  <span key={s.skill} className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200/85">
                    {s.skill}<span className="font-mono opacity-60">{s.mastery}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.missing_skills.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                <AlertTriangle className="h-3 w-3 text-[#FF6B6B]" /> Skill gaps — close them in Atlas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.missing_skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => onCloseGap(skill, job)}
                    className="group flex items-center gap-1 rounded-full border border-[#FF6B6B]/25 bg-[#FF6B6B]/10 px-2 py-0.5 text-[11px] text-[#FFB4B4] transition-colors hover:bg-[#FF6B6B]/20"
                  >
                    {skill}<ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onPrep(`${job.title} at ${job.company}`)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/75 hover:bg-white/[0.08]"
            >
              <MessageSquareText className="h-3.5 w-3.5" /> Prep interview
            </button>
            <a
              href={job.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/45 hover:text-white/70"
            >
              View on 'Sup <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function FitRing({ score }: { score: number }) {
  const color = score >= 67 ? "#10B981" : score >= 40 ? "#F59E0B" : "#FF6B6B";
  const r = 22, c = 2 * Math.PI * r;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 52 52" className="h-14 w-14 -rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black text-white">{score}</span>
        <span className="-mt-1 text-[8px] uppercase tracking-wide text-white/35">fit</span>
      </div>
    </div>
  );
}

// ── Interview tab ───────────────────────────────────────────────────────────

function InterviewTab({
  concepts, projects, role, setRole,
}: { concepts: any[]; projects: any[]; role: string; setRole: (r: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const generate = async () => {
    if (!role.trim()) { setError("Enter a target role first."); return; }
    setLoading(true); setError(null);
    try {
      const res = await apiPost<{ questions: InterviewQuestion[] }>("/career/interview", {
        role: role.trim(), concepts, projects, count: 6,
      });
      setQuestions(res.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Target role</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="e.g. Backend Engineer Intern at Cloudflare"
              className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-white/20 focus:outline-none"
            />
          </div>
          <button
            onClick={generate} disabled={loading}
            className="glow-button flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#E84545] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <MessageSquareText className="h-4 w-4" /> Generate
          </button>
        </div>
        <p className="mt-3 text-[11px] text-white/35">Questions are drilled on your real projects, not generic prompts.</p>
      </GlassCard>

      {loading && <Spinner label="Writing interview questions from your project history…" />}
      {error && <GlassCard className="border-red-500/30 text-sm text-red-300">{error}</GlassCard>}

      {questions?.map((q, i) => (
        <GlassCard key={i} className="cursor-pointer transition-colors hover:border-white/[0.12]" >
          <div onClick={() => setOpen(open === i ? null : i)} className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                    q.type === "behavioral" ? "bg-blue-500/15 text-blue-300" : "bg-[#FF6B6B]/15 text-[#FFB4B4]",
                  )}
                >{q.type}</span>
                {q.grounded_in && q.grounded_in !== "General" && (
                  <span className="text-[10px] text-white/35">↳ {q.grounded_in}</span>
                )}
              </div>
              <p className="text-sm font-medium text-white/90">{q.question}</p>
            </div>
            <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-white/30 transition-transform", open === i && "rotate-180")} />
          </div>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3 text-[13px]">
                  {q.assesses && <p className="text-white/45"><span className="text-white/30">Assesses:</span> {q.assesses}</p>}
                  {q.answer_hint && <p className="leading-relaxed text-white/60"><span className="text-white/30">Strong answer:</span> {q.answer_hint}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      ))}
    </div>
  );
}
