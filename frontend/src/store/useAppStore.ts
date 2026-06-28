import { create } from "zustand";
import type {
  AppState,
  MasteryUpdate,
  CalendarEvent,
  EnrollmentStatus,
  ModuleOverride,
  CustomCourse,
} from "../types";

// ── Manual calendar events: persisted to localStorage so user-added items
//    survive a page reload (there is no backend persistence layer). ──────────
const CAL_EVENTS_KEY = "aether.calendarEvents";

function loadCalendarEvents(): CalendarEvent[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(CAL_EVENTS_KEY);
    return raw ? (JSON.parse(raw) as CalendarEvent[]) : [];
  } catch {
    return [];
  }
}

function saveCalendarEvents(events: CalendarEvent[]) {
  try {
    localStorage.setItem(CAL_EVENTS_KEY, JSON.stringify(events));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

// ── Module management state: enrollment status overrides, per-module field
//    overrides, and user-created custom modules — all persisted together. ─────
const MODULES_KEY = "aether.modules";

interface ModuleState {
  courseStatus: Record<string, EnrollmentStatus>;
  courseOverrides: Record<string, ModuleOverride>;
  customCourses: CustomCourse[];
}

function loadModuleState(): ModuleState {
  const empty: ModuleState = { courseStatus: {}, courseOverrides: {}, customCourses: [] };
  if (typeof localStorage === "undefined") return empty;
  try {
    const raw = localStorage.getItem(MODULES_KEY);
    return raw ? { ...empty, ...(JSON.parse(raw) as ModuleState) } : empty;
  } catch {
    return empty;
  }
}

function saveModuleState(s: ModuleState) {
  try {
    localStorage.setItem(MODULES_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export const useAppStore = create<AppState>((set) => ({
  courses: [],
  assignments: [],
  notes: [],
  announcements: [],
  concepts: [],
  connections: [],

  // Manual calendar events (hydrated from localStorage)
  calendarEvents: loadCalendarEvents(),
  addCalendarEvent: (event) =>
    set((s) => {
      const next: CalendarEvent[] = [
        ...s.calendarEvents,
        { ...event, id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
      ];
      saveCalendarEvents(next);
      return { calendarEvents: next };
    }),
  removeCalendarEvent: (id) =>
    set((s) => {
      const next = s.calendarEvents.filter((e) => e.id !== id);
      saveCalendarEvents(next);
      return { calendarEvents: next };
    }),

  // ── Module management (hydrated from localStorage) ──────────────────────────
  ...(() => {
    const m = loadModuleState();
    return { courseStatus: m.courseStatus, courseOverrides: m.courseOverrides, customCourses: m.customCourses };
  })(),
  setCourseStatus: (id, status) =>
    set((s) => {
      const courseStatus = { ...s.courseStatus, [id]: status };
      // keep custom courses' own status field in sync
      const customCourses = s.customCourses.map((c) => (c.id === id ? { ...c, status } : c));
      saveModuleState({ courseStatus, courseOverrides: s.courseOverrides, customCourses });
      return { courseStatus, customCourses };
    }),
  updateCourseOverride: (id, patch) =>
    set((s) => {
      const courseOverrides = { ...s.courseOverrides, [id]: { ...s.courseOverrides[id], ...patch } };
      saveModuleState({ courseStatus: s.courseStatus, courseOverrides, customCourses: s.customCourses });
      return { courseOverrides };
    }),
  addCustomCourse: (course) =>
    set((s) => {
      const id = `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const customCourses: CustomCourse[] = [...s.customCourses, { ...course, id, isCustom: true }];
      saveModuleState({ courseStatus: s.courseStatus, courseOverrides: s.courseOverrides, customCourses });
      return { customCourses };
    }),
  removeCustomCourse: (id) =>
    set((s) => {
      const customCourses = s.customCourses.filter((c) => c.id !== id);
      const courseOverrides = { ...s.courseOverrides };
      delete courseOverrides[id];
      const courseStatus = { ...s.courseStatus };
      delete courseStatus[id];
      saveModuleState({ courseStatus, courseOverrides, customCourses });
      return { customCourses, courseOverrides, courseStatus };
    }),

  chatMessages: [],
  chatLoading: false,

  flashcards: [],
  quizQuestions: [],
  studyGuide: "",
  studyLoading: false,

  syllabi: [],
  highlightWeek: null,

  voiceInput: {
    isListening: false,
    transcript: "",
    isSpeaking: false,
    shouldSpeak: false,
  },

  activeCourseId: null,
  selectedConceptId: null,

  // Mastery tracking
  masteryHistory: [],
  conceptArtifacts: {},

  updateConceptMastery: (conceptId, delta, source) =>
    set((s) => {
      const update: MasteryUpdate = {
        conceptId,
        delta,
        source,
        timestamp: new Date().toISOString(),
      };
      return {
        masteryHistory: [...s.masteryHistory, update],
        concepts: s.concepts.map((c) =>
          c.id === conceptId
            ? {
                ...c,
                mastery: Math.min(100, Math.max(0, c.mastery + delta)),
                updated_at: update.timestamp,
              }
            : c
        ),
      };
    }),

  setConceptArtifact: (conceptId, artifact) =>
    set((s) => ({
      conceptArtifacts: {
        ...s.conceptArtifacts,
        [conceptId]: {
          ...(s.conceptArtifacts[conceptId] ?? {}),
          ...artifact,
        },
      },
    })),

  // Inspector / modal wiring
  pendingChatPrompt: null,
  pendingStudyTopic: null,
  setPendingChatPrompt: (pendingChatPrompt) => set({ pendingChatPrompt }),
  setPendingStudyTopic: (pendingStudyTopic) => set({ pendingStudyTopic }),

  // Specialized agent mode
  specializedAgentUrl: null,
  specializedAgentLabel: null,
  setSpecializedAgent: (url, label = null) => set({ specializedAgentUrl: url, specializedAgentLabel: label }),

  // Global modal open state
  chatModalOpen: false,
  studyLabModalOpen: false,
  setChatModalOpen: (chatModalOpen) => set({ chatModalOpen }),
  setStudyLabModalOpen: (studyLabModalOpen) => set({ studyLabModalOpen }),

  // Graph filters
  graphFilters: {
    courseIds: [],
    masteryRange: [0, 100],
    viewMode: "semester",
  },
  setGraphFilters: (filters) =>
    set((s) => ({ graphFilters: { ...s.graphFilters, ...filters } })),

  setCourses: (courses) => set({ courses }),
  setAssignments: (assignments) => set({ assignments }),
  setNotes: (notes) => set({ notes }),
  setAnnouncements: (announcements) => set({ announcements }),
  setConcepts: (concepts) => set({ concepts }),
  setConnections: (connections) => set({ connections }),

  addConcepts: (newConcepts) =>
    set((s) => {
      const existingIds = new Set(s.concepts.map((c) => c.id));
      const unique = newConcepts.filter((c) => !existingIds.has(c.id));
      return { concepts: [...s.concepts, ...unique] };
    }),

  addConnections: (newConns) =>
    set((s) => {
      const existingIds = new Set(s.connections.map((c) => c.id));
      const unique = newConns.filter((c) => !existingIds.has(c.id));
      return { connections: [...s.connections, ...unique] };
    }),

  addChatMessage: (message) =>
    set((s) => ({ chatMessages: [...s.chatMessages, message] })),

  updateLastAssistantMessage: (content) =>
    set((s) => {
      const msgs = [...s.chatMessages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "assistant") {
          msgs[i] = { ...msgs[i], content };
          break;
        }
      }
      return { chatMessages: msgs };
    }),

  setChatLoading: (chatLoading) => set({ chatLoading }),

  clearChat: () => set({ chatMessages: [], chatLoading: false }),

  setFlashcards: (flashcards) => set({ flashcards }),
  setQuizQuestions: (quizQuestions) => set({ quizQuestions }),
  setStudyGuide: (studyGuide) => set({ studyGuide }),
  setStudyLoading: (studyLoading) => set({ studyLoading }),

  setSyllabi: (syllabi) => set({ syllabi }),
  setHighlightWeek: (highlightWeek) => set({ highlightWeek }),

  startListening: () =>
    set({ voiceInput: { isListening: true, transcript: "", isSpeaking: false, shouldSpeak: false } }),
  stopListening: () =>
    set((s) => ({ voiceInput: { ...s.voiceInput, isListening: false } })),
  setTranscript: (transcript) =>
    set((s) => ({ voiceInput: { ...s.voiceInput, transcript } })),
  clearTranscript: () =>
    set((s) => ({ voiceInput: { ...s.voiceInput, transcript: "" } })),
  setSpeaking: (isSpeaking) =>
    set((s) => ({ voiceInput: { ...s.voiceInput, isSpeaking } })),
  setShouldSpeak: (shouldSpeak) =>
    set((s) => ({ voiceInput: { ...s.voiceInput, shouldSpeak } })),

  setActiveCourseId: (activeCourseId) => set({ activeCourseId }),
  setSelectedConceptId: (selectedConceptId) => set({ selectedConceptId }),

  // ZO email agent digest
  zoDigest: null,
  zoDigestLoading: false,
  setZODigest: (zoDigest) => set({ zoDigest }),
  setZODigestLoading: (zoDigestLoading) => set({ zoDigestLoading }),

  currentView: "home",
  setCurrentView: (currentView) => set({ currentView }),
}));
