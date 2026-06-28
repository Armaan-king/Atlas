// ── Course & Academic ──────────────────────────────────────────────

export interface Course {
  id: string;
  course_code: string;
  name: string;
  workflow_state: "available" | "unpublished" | "completed" | "deleted";
  start_at?: string; // ISO 8601
  end_at?: string; // ISO 8601
  created_at?: string; // ISO 8601
  time_zone: string;
  color: string;
  instructor: string;
  credits: number;
  progress: number; // 0–100
}

export interface Assignment {
  id: string;
  course_id: string;
  name: string;
  submission_types: string[];
  assignment_category: "homework" | "exam" | "project" | "quiz" | "lab";
  due_at: string; // ISO 8601
  created_at?: string; // ISO 8601
  updated_at?: string; // ISO 8601
  has_submitted_submissions: boolean;
  points_possible: number;
  workflow_state: "published" | "unpublished" | "deleted";
  description?: string;
  status?: "upcoming" | "in_progress" | "submitted" | "graded";
  priority?: "low" | "medium" | "high" | "critical";
}

// User-added calendar items (persisted to localStorage; not from the backend)
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO 8601
  category: "homework" | "exam" | "project" | "quiz" | "lab" | "event";
  course_id?: string;
  note?: string;
}

// ── Module management (enrollment + user overrides on retrieved catalog info) ──
export type EnrollmentStatus = "current" | "taken" | "planned";

export interface ModuleExam {
  id: string;
  title: string;
  date: string; // ISO 8601
}

// User edits layered on top of a retrieved (or custom) module.
export interface ModuleOverride {
  instructor?: string;      // professor change
  textbook?: string;        // book add/change
  examDates?: ModuleExam[]; // exam date add/change
  topicsAdded?: string[];   // extra topics not in the retrieved concept list
  topicsExcluded?: string[]; // retrieved concept labels the student drops
  notes?: string;
}

// A module the user creates themselves (not from the backend catalog).
export interface CustomCourse {
  id: string;
  course_code: string;
  name: string;
  instructor?: string;
  credits?: number;
  color: string;
  status: EnrollmentStatus;
  isCustom: true;
}

export interface Note {
  id: string;
  course_id: string;
  title: string;
  content: string;
  created_at: string; // ISO 8601
  tags?: string[];
  week_number?: number;
}

export interface Announcement {
  id: string;
  course_id: string;
  title: string;
  message: string;
  author: string;
  posted_at: string; // ISO 8601
  read_state: "read" | "unread";
  pinned: boolean;
  importance: "low" | "medium" | "high" | "critical";
}

// ── Knowledge Graph ───────────────────────────────────────────────

export interface Concept {
  id: string;
  course_id: string;
  label: string;
  description: string;
  mastery: number; // 0–100
  created_at?: string; // ISO 8601
  updated_at?: string; // ISO 8601
}

export interface MasteryUpdate {
  conceptId: string;
  delta: number;
  source: string; // e.g. "quiz", "manual"
  timestamp: string; // ISO 8601
}

export interface MasteryTierDef {
  id: "low" | "medium" | "high";
  label: string;
  min: number;
  max: number;
  value: number; // representative mid-point snapped to when entering this tier
  color: string;
  icon: string;
}

export const MASTERY_TIERS: MasteryTierDef[] = [
  { id: "low",    label: "Low",    min: 0,  max: 33,  value: 16,  color: "#EF4444", icon: "○" },
  { id: "medium", label: "Medium", min: 34, max: 66,  value: 50,  color: "#F59E0B", icon: "◑" },
  { id: "high",   label: "High",   min: 67, max: 100, value: 83,  color: "#10B981", icon: "◕" },
] as const;

export function getMasteryTier(mastery: number): MasteryTierDef {
  return (
    MASTERY_TIERS.slice().reverse().find((t) => mastery >= t.min) ??
    MASTERY_TIERS[0]
  );
}

export interface GraphFilters {
  courseIds: string[]; // empty = all courses
  masteryRange: [number, number]; // [min, max], default [0, 100]
  viewMode: "semester" | "full" | "week";
}

export interface Connection {
  id: string;
  source_id: string;
  target_id: string;
  label: string;
  cross_course: boolean;
}

// ── Chat ──────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

// ── Study Tools ───────────────────────────────────────────────────

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizResult {
  total: number;
  correct: number;
  answers: number[];
}

export interface SavedConceptArtifacts {
  flashcards?: { cards: Flashcard[]; savedAt: string };
  quiz?: { questions: { id: string; question: string; options: string[]; correctIndex: number; explanation?: string }[]; savedAt: string };
  studyGuide?: { content: string; savedAt: string };
}
export interface PendingStudyTopic {
  topic: string;
  courseId?: string;
}

// ── Syllabus ──────────────────────────────────────────────────────

export interface SyllabusWeek {
  week: number;
  topic: string;
  concept_ids: string[];
  assignment_ids: string[];
  outcomes: string[];
}

export interface Syllabus {
  course_id: string;
  weeks: SyllabusWeek[];
}

// ── Voice Input (Speech Recognition) ──────────────────────────────

export interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  shouldSpeak: boolean;
}

// ── Voice / Daily Brief ───────────────────────────────────────────

export interface DailyBrief {
  greeting: string;
  summary: string;
  deadlines: Assignment[];
}

// ── API Request/Response Shapes ───────────────────────────────────

export interface ChatRequest {
  message: string;
  history: { role: ChatRole; content: string }[];
  course_id?: string;
}

export interface GenerateRequest {
  course_id: string;
  topic?: string;
}

export interface VoiceRequest {
  text: string;
}

export interface ParseResponse {
  text: string;
  concepts: Concept[];
}

// ── Store ─────────────────────────────────────────────────────────

export interface AppState {
  courses: Course[];
  assignments: Assignment[];
  notes: Note[];
  announcements: Announcement[];
  concepts: Concept[];
  connections: Connection[];

  // Manual calendar events (user-added, persisted to localStorage)
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  removeCalendarEvent: (id: string) => void;

  // Module management (all user state, persisted to localStorage)
  courseStatus: Record<string, EnrollmentStatus>; // overrides of the default status
  courseOverrides: Record<string, ModuleOverride>; // per-module field edits
  customCourses: CustomCourse[]; // user-created modules
  setCourseStatus: (id: string, status: EnrollmentStatus) => void;
  updateCourseOverride: (id: string, patch: Partial<ModuleOverride>) => void;
  addCustomCourse: (course: Omit<CustomCourse, "id" | "isCustom">) => void;
  removeCustomCourse: (id: string) => void;

  chatMessages: ChatMessage[];
  chatLoading: boolean;

  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  studyGuide: string;
  studyLoading: boolean;

  syllabi: Syllabus[];
  highlightWeek: number | null;

  voiceInput: VoiceInputState;

  activeCourseId: string | null;
  selectedConceptId: string | null;

  // Mastery tracking
  masteryHistory: MasteryUpdate[];
  conceptArtifacts: Record<string, SavedConceptArtifacts>;
  updateConceptMastery: (conceptId: string, delta: number, source: string) => void;
  setConceptArtifact: (conceptId: string, artifact: SavedConceptArtifacts) => void;

  // Inspector / modal wiring
  pendingChatPrompt: string | null;
  pendingStudyTopic: string | PendingStudyTopic | null;
  setPendingChatPrompt: (prompt: string | null) => void;
  setPendingStudyTopic: (topic: string | PendingStudyTopic | null) => void;

  // Specialized-agent chat routing
  specializedAgentUrl: string | null;
  specializedAgentLabel: string | null;
  setSpecializedAgent: (url: string | null, label?: string | null) => void;

  // Global modal open state (driven by store so any component can trigger)
  chatModalOpen: boolean;
  studyLabModalOpen: boolean;
  setChatModalOpen: (open: boolean) => void;
  setStudyLabModalOpen: (open: boolean) => void;

  // ZO email agent digest
  zoDigest: ZODigest | null;
  zoDigestLoading: boolean;
  setZODigest: (digest: ZODigest | null) => void;
  setZODigestLoading: (loading: boolean) => void;

  currentView: "home" | "command" | "calendar" | "profile" | "career" | "modules" | "digest";
  setCurrentView: (view: "home" | "command" | "calendar" | "profile" | "career" | "modules" | "digest") => void;

  // Graph filters
  graphFilters: GraphFilters;
  setGraphFilters: (filters: Partial<GraphFilters>) => void;

  setCourses: (courses: Course[]) => void;
  setAssignments: (assignments: Assignment[]) => void;
  setNotes: (notes: Note[]) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
  setConcepts: (concepts: Concept[]) => void;
  setConnections: (connections: Connection[]) => void;
  addConcepts: (concepts: Concept[]) => void;
  addConnections: (connections: Connection[]) => void;

  addChatMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setChatLoading: (loading: boolean) => void;
  clearChat: () => void;

  setFlashcards: (cards: Flashcard[]) => void;
  setQuizQuestions: (questions: QuizQuestion[]) => void;
  setStudyGuide: (guide: string) => void;
  setStudyLoading: (loading: boolean) => void;

  setSyllabi: (syllabi: Syllabus[]) => void;
  setHighlightWeek: (week: number | null) => void;

  startListening: () => void;
  stopListening: () => void;
  setTranscript: (transcript: string) => void;
  clearTranscript: () => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setShouldSpeak: (shouldSpeak: boolean) => void;

  setActiveCourseId: (id: string | null) => void;
  setSelectedConceptId: (id: string | null) => void;
}

// ── ZO / Agent Feeds ──────────────────────────────────────────────

export interface ZODigest {
  summary: string;
  upcoming_events: string[];
  exams: string[];
  meetings: string[];
  deadlines: string[];
  action_items: string[];
  needs_reply: string[];
  email_summaries: ZOEmailSummary[];
}

export interface ZOEmailSummary {
  id: string;
  subject: string;
  from_line: string;
  received_at: string;
  summary: string;
  tags: string[];
  needs_reply: boolean;
  related_calendar: string[];
}

export interface OutlookEmail {
  id: string;
  subject?: string;
  from?: { emailAddress?: { name?: string; address?: string } };
  receivedDateTime?: string;
  bodyPreview?: string;
  body?: string | { content?: string };
  content?: string;
  isRead?: boolean;
  hasAttachments?: boolean;
}

export interface OutlookCalendarItem {
  id: string;
  subject?: string;
  start?: { dateTime?: string; timeZone?: string };
  end?: { dateTime?: string; timeZone?: string };
  location?: { displayName?: string } | string;
  organizer?: { emailAddress?: { name?: string; address?: string } };
}

export interface ZODigestRequest {
  email_text?: string;
  emails?: OutlookEmail[];
  calendar_items?: OutlookCalendarItem[];
}

// ── Command Center / Triage ───────────────────────────────────────

export type TriageStatus = "healthy" | "danger" | "submitted";

export interface SystemStatus {
  canvasApi: "active" | "standby" | "error";
  openAiProvider: "active" | "standby" | "error";
  ghostPilot: "active" | "standby" | "ready";
}

// ── Remediation Protocol ──────────────────────────────────────────

export interface RemediationStep {
  title: string;
  description: string;
  estimatedTime: string;
  status: "pending" | "active" | "completed";
}

export interface RemediationPlan {
  assignmentId: string;
  assignment_name: string;
  course_id: string;
  score: number;
  maxScore: number;
  conceptsMissed: string[];
  steps: RemediationStep[];
}

// ── Extended Store (command center) ───────────────────────────────

export interface CommandCenterState {
  systemStatus: SystemStatus;
  activeRemediation: RemediationPlan | null;
  triageStatuses: Record<string, TriageStatus>; // assignmentId → status

  setSystemStatus: (status: SystemStatus) => void;
  triggerRemediation: (plan: RemediationPlan) => void;
  dismissRemediation: () => void;
  setTriageStatus: (assignmentId: string, status: TriageStatus) => void;
}

