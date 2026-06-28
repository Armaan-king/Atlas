import { create } from "zustand";
import type {
  SystemStatus,
  RemediationPlan,
  TriageStatus,
  CommandCenterState,
} from "../types";

// Mock triage data — maps assignment IDs to their statuses
const INITIAL_TRIAGE: Record<string, TriageStatus> = {
  // Overdue — never submitted
  "sc4002-hw3": "danger",   // HW3: NLP Parsing — 11 days overdue, not submitted
  // Due in 2 days — in progress, high stakes
  "sc2005-proj2": "danger",   // Project 2: Memory Allocator — due Apr 13, critical
  "sc2001-hw5": "danger",   // HW 5: Graph Algorithms — due Apr 13
  // Due in 3–4 days — at risk
  "sc2002-hw5": "danger",   // Lab 5: Design Patterns — due Apr 14
  "sc2005-hw4": "danger",   // HW 4: Processes & System Calls — due Apr 14
};

const INITIAL_STATUS: SystemStatus = {
  canvasApi: "active",
  openAiProvider: "active",
  ghostPilot: "ready",
};

export const useCommandStore = create<CommandCenterState>((set) => ({
  systemStatus: INITIAL_STATUS,
  activeRemediation: null,
  triageStatuses: INITIAL_TRIAGE,

  setSystemStatus: (systemStatus) => set({ systemStatus }),

  triggerRemediation: (plan: RemediationPlan) =>
    set({ activeRemediation: plan }),

  dismissRemediation: () => set({ activeRemediation: null }),

  setTriageStatus: (assignmentId: string, status: TriageStatus) =>
    set((s) => ({
      triageStatuses: { ...s.triageStatuses, [assignmentId]: status },
    })),
}));
