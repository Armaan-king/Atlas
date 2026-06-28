// Module-management helpers: merge the retrieved catalog course with the user's
// enrollment status, field overrides, and custom modules into one effective view.
import type {
  Course,
  Concept,
  CustomCourse,
  EnrollmentStatus,
  ModuleExam,
  ModuleOverride,
} from "@/types";

// Seeded default enrollment status for the demo persona (a Year-3 Sem-2 student).
// User changes are stored separately and take precedence.
const DEFAULT_STATUS: Record<string, EnrollmentStatus> = {
  sc2002: "current", sc2001: "current", sc2005: "current", sc1015: "current",
  mh2802: "taken", mh1812: "taken", sc4002: "taken", sc4024: "taken",
  bu8201: "taken", he2001: "taken",
  sc3000: "planned", sc4001: "planned", mh3700: "planned",
};

export function defaultStatus(id: string): EnrollmentStatus {
  return DEFAULT_STATUS[id] ?? "current";
}

export const STATUS_META: Record<EnrollmentStatus, { label: string; color: string }> = {
  current: { label: "Current", color: "#10B981" },
  planned: { label: "Planning to take", color: "#F59E0B" },
  taken: { label: "Taken", color: "#6366F1" },
};

// A retrieved or custom module with all user overrides applied.
export interface EffectiveModule {
  id: string;
  course_code: string;
  name: string;
  instructor: string;
  credits: number;
  color: string;
  progress: number;
  status: EnrollmentStatus;
  isCustom: boolean;
  textbook: string;
  examDates: ModuleExam[];
  notes: string;
}

export interface ModuleBuckets<T> {
  current: T[];
  taken: T[];
  planned: T[];
}

function merge(
  base: { id: string; course_code: string; name: string; instructor?: string; credits?: number; color: string; progress?: number },
  isCustom: boolean,
  baseStatus: EnrollmentStatus,
  statusMap: Record<string, EnrollmentStatus>,
  overrides: Record<string, ModuleOverride>,
): EffectiveModule {
  const o = overrides[base.id] ?? {};
  return {
    id: base.id,
    course_code: base.course_code,
    name: base.name,
    instructor: o.instructor ?? base.instructor ?? "TBD",
    credits: base.credits ?? 0,
    color: base.color,
    progress: base.progress ?? 0,
    status: statusMap[base.id] ?? baseStatus,
    isCustom,
    textbook: o.textbook ?? "",
    examDates: o.examDates ?? [],
    notes: o.notes ?? "",
  };
}

export function effectiveModules(
  backend: Course[],
  custom: CustomCourse[],
  statusMap: Record<string, EnrollmentStatus>,
  overrides: Record<string, ModuleOverride>,
): EffectiveModule[] {
  return [
    ...backend.map((c) => merge(c, false, defaultStatus(c.id), statusMap, overrides)),
    ...custom.map((c) => merge(c, true, c.status, statusMap, overrides)),
  ];
}

export function effectiveModuleBuckets(
  backend: Course[],
  custom: CustomCourse[],
  statusMap: Record<string, EnrollmentStatus>,
  overrides: Record<string, ModuleOverride>,
): ModuleBuckets<EffectiveModule> {
  return bucketModulesByStatus(effectiveModules(backend, custom, statusMap, overrides));
}

export function effectiveStatusMap(
  backend: { id: string }[],
  custom: CustomCourse[],
  statusMap: Record<string, EnrollmentStatus>,
): Record<string, EnrollmentStatus> {
  const resolved: Record<string, EnrollmentStatus> = {};

  backend.forEach((course) => {
    resolved[course.id] = statusMap[course.id] ?? defaultStatus(course.id);
  });
  custom.forEach((course) => {
    resolved[course.id] = statusMap[course.id] ?? course.status;
  });

  return resolved;
}

function bucketModulesByStatus<T extends { status: EnrollmentStatus }>(modules: T[]): ModuleBuckets<T> {
  return {
    current: modules.filter((module) => module.status === "current"),
    taken: modules.filter((module) => module.status === "taken"),
    planned: modules.filter((module) => module.status === "planned"),
  };
}

// The set of module ids that are effectively "current" — shared by the
// dashboard brief and triage so they track the user's module selection.
export function currentCourseIds(
  backend: { id: string }[],
  custom: CustomCourse[],
  statusMap: Record<string, EnrollmentStatus>,
): Set<string> {
  const resolved = effectiveStatusMap(backend, custom, statusMap);
  return new Set(
    Object.entries(resolved)
      .filter(([, status]) => status === "current")
      .map(([id]) => id),
  );
}

export interface TopicView {
  label: string;
  excluded: boolean;
  custom: boolean;
}

// Retrieved topics = the knowledge-graph concepts for this module, plus any the
// user added, minus any the user excluded.
export function moduleTopics(
  courseId: string,
  concepts: Concept[],
  override?: ModuleOverride,
): TopicView[] {
  const excluded = new Set(override?.topicsExcluded ?? []);
  const retrieved: TopicView[] = concepts
    .filter((c) => c.course_id === courseId)
    .map((c) => ({ label: c.label, excluded: excluded.has(c.label), custom: false }));
  const added: TopicView[] = (override?.topicsAdded ?? []).map((l) => ({
    label: l,
    excluded: false,
    custom: true,
  }));
  return [...retrieved, ...added];
}
