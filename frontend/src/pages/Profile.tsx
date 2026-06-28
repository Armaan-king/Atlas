import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Particles } from "@/components/background/Particles";
import { User, FileText, Upload, ChevronDown, GraduationCap, Calendar as CalendarIcon, Award, Hash } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { defaultStatus, effectiveModules, STATUS_META } from "@/lib/modules";
import type { Course, EnrollmentStatus } from "@/types";

interface HistoryEntry {
  id: string;
  course_code: string;
  name: string;
  instructor: string;
  progress: number;
  status: EnrollmentStatus;
  isCustom: boolean;
  semester: string;
}

export function Profile() {
  const storeCourses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const courseOverrides = useAppStore((s) => s.courseOverrides);
  const [selectedSemester, setSelectedSemester] = useState("");

  // NTU academic year runs Aug–Jul. Sem 1 = Aug–Dec, Sem 2 = Jan–May.
  const getSemesterStr = (course: Course) => {
    if (!course.start_at) return "Unknown Semester";
    const d = new Date(course.start_at);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0 is Jan
    const yy = (n: number) => String(n).slice(2);
    if (month >= 7) return `AY${year}/${yy(year + 1)} Sem 1`; // Aug–Dec
    if (month <= 4) return `AY${year - 1}/${yy(year)} Sem 2`; // Jan–May
    return `AY${year - 1}/${yy(year)} Special Term`;
  };

  const getGrade = (progress: number) => {
    if (progress === 0) return "TBD";
    if (progress >= 97) return "A+";
    if (progress >= 93) return "A";
    if (progress >= 90) return "A-";
    if (progress >= 87) return "B+";
    if (progress >= 83) return "B";
    if (progress >= 80) return "B-";
    if (progress >= 77) return "C+";
    if (progress >= 73) return "C";
    if (progress >= 70) return "C-";
    if (progress >= 65) return "D+";
    if (progress >= 60) return "D";
    return "F";
  };

  // Status & overrides applied (custom modules included).
  const entries: HistoryEntry[] = useMemo(() => {
    const fromBackend = storeCourses.map((c) => ({
      id: c.id,
      course_code: c.course_code,
      name: c.name,
      instructor: courseOverrides[c.id]?.instructor ?? c.instructor,
      progress: c.progress,
      status: courseStatus[c.id] ?? defaultStatus(c.id),
      isCustom: false,
      semester: getSemesterStr(c),
    }));
    const fromCustom = customCourses.map((c) => ({
      id: c.id,
      course_code: c.course_code,
      name: c.name,
      instructor: courseOverrides[c.id]?.instructor ?? c.instructor ?? "TBD",
      progress: 0,
      status: courseStatus[c.id] ?? c.status,
      isCustom: true,
      semester: "Custom modules",
    }));
    return [...fromBackend, ...fromCustom];
  }, [storeCourses, customCourses, courseStatus, courseOverrides]);

  const courseData = useMemo(() => {
    const data: Record<string, HistoryEntry[]> = {};
    entries.forEach((e) => {
      if (!data[e.semester]) data[e.semester] = [];
      data[e.semester].push(e);
    });
    return data;
  }, [entries]);

  // Sort key from "AY2025/26 Sem 1" → 202501 (descending = most recent first).
  // Custom / undated groups sort to the bottom.
  const semKey = (s: string) => {
    const m = s.match(/AY(\d{4}).*Sem\s*(\d)/);
    if (m) return parseInt(m[1]) * 10 + parseInt(m[2]);
    if (s.includes("Special")) return parseInt((s.match(/AY(\d{4})/) ?? [])[1] ?? "0") * 10;
    return -1;
  };

  const semesters = useMemo(() => {
    return Object.keys(courseData).sort((a, b) => semKey(b) - semKey(a));
  }, [courseData]);

  useEffect(() => {
    if ((!selectedSemester || !semesters.includes(selectedSemester)) && semesters.length > 0) {
      setSelectedSemester(semesters[0]);
    }
  }, [semesters, selectedSemester]);

  const currentCourses = courseData[selectedSemester] || [];

  // Module-load summary across every module (incl. custom).
  const summary = useMemo(() => {
    const mods = effectiveModules(storeCourses, customCourses, courseStatus, courseOverrides);
    const counts: Record<EnrollmentStatus, number> = { current: 0, planned: 0, taken: 0 };
    let currentAU = 0;
    mods.forEach((m) => {
      counts[m.status] += 1;
      if (m.status === "current") currentAU += m.credits;
    });
    return { counts, currentAU };
  }, [storeCourses, customCourses, courseStatus, courseOverrides]);

  return (
    <div className="h-full relative overflow-hidden atlas-hub-bg">
      <div className="absolute inset-0 z-0 pointer-events-none atlas-mesh-overlay" />
      <Particles className="z-[1]" quantity={100} staticity={55} ease={60} size={0.4} color="#ffffff" />

      <div className="relative z-10 flex flex-col h-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="mx-auto px-8 relative z-20 max-w-5xl w-full pt-16 pb-24"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] flex items-center justify-center shrink-0 glow-indigo border border-white/10">
              <User size={32} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">Student Profile</span>
              </div>
              <h1 className="text-3xl font-medium text-white/95 tracking-tight">Armaan Sinha</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="command-brief-card rounded-2xl p-6 flex flex-col transition-all hover:bg-white/[0.04]">
              <div className="flex items-center gap-3 mb-4 text-white/40">
                <Hash size={18} />
                <span className="text-xs font-mono tracking-wider uppercase">Matriculation No.</span>
              </div>
              <span className="text-2xl font-medium text-white/90">U2320001J</span>
            </div>

            <div className="command-brief-card rounded-2xl p-6 flex flex-col transition-all hover:bg-white/[0.04]">
              <div className="flex items-center gap-3 mb-4 text-white/40">
                <GraduationCap size={18} />
                <span className="text-xs font-mono tracking-wider uppercase">Academic Year</span>
              </div>
              <span className="text-xl font-medium text-white/90">Year 3</span>
              <span className="text-sm text-white/40 mt-1">Semester 2</span>
            </div>

            <div className="command-brief-card rounded-2xl p-6 flex flex-col transition-all hover:bg-white/[0.04]">
              <div className="flex items-center gap-3 mb-4 text-white/40">
                <Award size={18} />
                <span className="text-xs font-mono tracking-wider uppercase">Cumulative CGPA</span>
              </div>
              <span className="text-2xl font-medium text-white/90 text-[#FF6B6B]">4.52 / 5.00</span>
            </div>
          </div>

          {/* Module-load summary (driven by the Modules page) */}
          <div className="command-brief-card rounded-2xl px-6 py-4 mb-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-white/30">Module load</span>
            {(["current", "planned", "taken"] as EnrollmentStatus[]).map((st) => (
              <div key={st} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_META[st].color }} />
                <span className="text-sm text-white/70">
                  <span className="font-semibold text-white/90">{summary.counts[st]}</span> {STATUS_META[st].label}
                </span>
              </div>
            ))}
            <span className="ml-auto text-sm text-white/50">
              <span className="font-semibold text-white/80">{summary.currentAU}</span> AU this semester
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Academic History */}
            <div className="lg:col-span-2 space-y-6">
              <div className="command-brief-card rounded-2xl p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={20} className="text-[#FF6B6B]" />
                    <h2 className="text-lg font-medium text-white/90">Academic History</h2>
                  </div>

                  {semesters.length > 0 && (
                    <div className="relative">
                      <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="appearance-none bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-4 py-2 pr-10 text-sm text-white/80 focus:outline-none focus:border-white/20 transition-all w-full sm:w-auto"
                      >
                        {semesters.map((s) => (
                          <option key={s} value={s} className="bg-[#0d0a0a] text-white/90">{s}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {currentCourses.length === 0 ? (
                    <p className="text-sm text-white/40 italic">No modules found for this semester.</p>
                  ) : (
                    currentCourses.map((course, i) => {
                      const grade = getGrade(course.progress);
                      return (
                        <motion.div
                          key={`${course.id}-${selectedSemester}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.4 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all group"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-white/[0.05] transition-colors">
                              <span className="text-xs font-mono text-white/60">{course.course_code.replace(/\D/g, "")}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-white/90 font-medium group-hover:text-white transition-colors">{course.course_code}</h3>
                                <StatusPill status={course.status} />
                                {course.isCustom && (
                                  <span className="rounded-full border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/40">Custom</span>
                                )}
                              </div>
                              <p className="text-sm text-white/40 group-hover:text-white/50 transition-colors truncate">{course.name}</p>
                              <p className="text-[11px] text-white/25 mt-0.5">{course.instructor}</p>
                            </div>
                          </div>
                          <div className={`flex items-center justify-center w-12 h-10 rounded-full bg-[#FF6B6B]/10 font-medium border border-[#FF6B6B]/20 shadow-[0_0_10px_rgba(255,107,107,0.1)] shrink-0 ${grade === "TBD" ? "text-white/40 text-xs" : "text-[#FF6B6B]"}`}>
                            {grade}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-6">
              <div className="command-brief-card rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <FileText size={20} className="text-[#FF6B6B]" />
                  <h2 className="text-lg font-medium text-white/90">Documents</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-4 hover:bg-white/[0.05] transition-all cursor-pointer group">
                    <div className="p-2.5 rounded-lg bg-[#FF6B6B]/10 text-[#FF6B6B] group-hover:scale-110 transition-transform">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">Transcript_Current.pdf</h4>
                      <p className="text-xs text-white/40 mt-1">Uploaded Apr 12, 2026 • 2.4 MB</p>
                    </div>
                  </div>

                  <button className="w-full py-5 rounded-xl border border-dashed border-white/10 hover:border-[#FF6B6B]/50 hover:bg-[#FF6B6B]/5 transition-all text-sm text-white/60 flex flex-col items-center justify-center gap-2.5 group">
                    <div className="p-2 rounded-full bg-white/[0.02] group-hover:bg-[#FF6B6B]/10 transition-colors">
                      <Upload size={18} className="text-white/40 group-hover:text-[#FF6B6B] transition-colors" />
                    </div>
                    <span>Upload Unofficial Transcript</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: EnrollmentStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide"
      style={{ backgroundColor: meta.color + "26", color: meta.color }}
    >
      {meta.label}
    </span>
  );
}
