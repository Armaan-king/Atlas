import { AlertTriangle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { useCommandStore } from "@/store/useCommandStore";
import { currentCourseIds } from "@/lib/modules";
import type { TriageStatus, RemediationPlan } from "@/types";

const COURSE_COLORS: Record<string, string> = {
  sc2002: "#8B5CF6",
  mh2802: "#3B82F6",
  mh1812: "#06B6D4",
  sc2001: "#F43F5E",
  sc2005: "#F97316",
  sc4001: "#A855F7",
  sc4002: "#EC4899",
  sc3000: "#DC2626",
};

// Mock remediation plans for danger items
const MOCK_REMEDIATIONS: Record<string, RemediationPlan> = {
  "sc4002-hw3": {
    assignmentId: "sc4002-hw3",
    assignment_name: "HW3: NLP Parsing",
    course_id: "sc4002",
    score: 12,
    maxScore: 60,
    conceptsMissed: ["CKY Parsing", "Context-Free Grammars", "Probabilistic Parsing", "Chomsky Normal Form"],
    steps: [
      { title: "Review CKY Algorithm", description: "Re-read lecture slides on the CKY bottom-up parsing algorithm. Trace through the worked example on the slide deck.", estimatedTime: "40 min", status: "active" },
      { title: "Convert Grammar to CNF", description: "Practice converting CFGs to Chomsky Normal Form — this is a prerequisite for CKY. Do the 3 practice problems on NTULearn.", estimatedTime: "30 min", status: "pending" },
      { title: "Implement CKY", description: "Write the CKY implementation. Start with the parse table construction, then backtrack to recover the parse tree.", estimatedTime: "90 min", status: "pending" },
      { title: "Submit ASAP", description: "Submit even a partial solution to Gradescope — late penalty is better than a zero. Email Dr. Luu Anh Tuan explaining the delay.", estimatedTime: "10 min", status: "pending" },
    ],
  },
  "sc2005-proj2": {
    assignmentId: "sc2005-proj2",
    assignment_name: "Project 2: Memory Allocator",
    course_id: "sc2005",
    score: 38,
    maxScore: 150,
    conceptsMissed: ["Explicit Free Lists", "Coalescing", "Heap Fragmentation", "malloc/free"],
    steps: [
      { title: "Review Explicit Free List Design", description: "Re-read lecture notes on explicit free lists with header/footer blocks. Make sure you understand the block structure before coding.", estimatedTime: "30 min", status: "active" },
      { title: "Fix Coalescing Logic", description: "Most bugs are in boundary coalescing. Add print statements to trace every free() call and verify neighbor blocks are merged correctly.", estimatedTime: "60 min", status: "pending" },
      { title: "Run Public Test Suite", description: "Run `make test` on sunfire.scse.ntu.edu.sg — do NOT rely on your local machine. Fix all failing traces, targeting < 10% fragmentation.", estimatedTime: "45 min", status: "pending" },
      { title: "Submit Before Midnight Apr 13", description: "Hard deadline — no extensions. Submit current state. Even 60% passing tests is far better than a zero.", estimatedTime: "5 min", status: "pending" },
    ],
  },
  "sc2001-hw5": {
    assignmentId: "sc2001-hw5",
    assignment_name: "HW 5: Graph Algorithms",
    course_id: "sc2001",
    score: 22,
    maxScore: 80,
    conceptsMissed: ["Dijkstra's Algorithm", "Bellman-Ford", "Kruskal's Algorithm", "Prim's Algorithm"],
    steps: [
      { title: "Review Shortest Path Proofs", description: "Re-read the correctness proofs for Dijkstra and Bellman-Ford. Problem 3 likely requires a formal proof — follow the exchange argument structure from lecture.", estimatedTime: "45 min", status: "active" },
      { title: "Work MST Problems", description: "Do the 4 MST practice problems from HW4 solutions. Kruskal and Prim correctness proofs use the cut property — master it.", estimatedTime: "40 min", status: "pending" },
      { title: "Write Up Solutions", description: "For each proof, state the algorithm, give a clear invariant, and prove it by induction. Show time complexity with justification.", estimatedTime: "60 min", status: "pending" },
    ],
  },
  "sc2002-hw5": {
    assignmentId: "sc2002-hw5",
    assignment_name: "Lab 5: Design Patterns",
    course_id: "sc2002",
    score: 28,
    maxScore: 80,
    conceptsMissed: ["Strategy Pattern", "Observer Pattern", "Polymorphism", "UML Class Diagrams"],
    steps: [
      { title: "Review GoF Patterns", description: "Re-read the lecture notes on the Strategy and Observer patterns. Make sure you can draw the UML class diagram for each before coding.", estimatedTime: "45 min", status: "active" },
      { title: "Refactor to Interfaces", description: "Replace concrete dependencies with interfaces so behaviours can be swapped at runtime. This is the core of the Strategy pattern marking rubric.", estimatedTime: "60 min", status: "pending" },
      { title: "Pass Public Tests", description: "Run the provided JUnit test suite and ensure all public tests pass. Pay special attention to the observer-notification ordering tests.", estimatedTime: "30 min", status: "pending" },
    ],
  },
  "sc2005-hw4": {
    assignmentId: "sc2005-hw4",
    assignment_name: "HW 4: Processes & System Calls",
    course_id: "sc2005",
    score: 15,
    maxScore: 60,
    conceptsMissed: ["fork/exec", "Pipes", "Signal Handlers", "File Descriptors"],
    steps: [
      { title: "Review fork/exec/wait Pattern", description: "Re-read the lecture slides on process creation. The classic fork→exec→wait pattern must be exact — a missing wait() causes zombie processes.", estimatedTime: "25 min", status: "active" },
      { title: "Test on sunfire.scse.ntu.edu.sg", description: "Your local macOS behavior for signals differs from Linux. SSH into sunfire.scse.ntu.edu.sg and run all test cases there before submitting.", estimatedTime: "30 min", status: "pending" },
      { title: "Submit to Gradescope", description: "Due Apr 14 at 11:59 PM. Submit what you have — partial credit is awarded per test case.", estimatedTime: "5 min", status: "pending" },
    ],
  },
};

function statusBadge(status: TriageStatus) {
  switch (status) {
    case "healthy":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-mono">
          Healthy
        </Badge>
      );
    case "danger":
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-mono">
          Danger
        </Badge>
      );
    case "submitted":
      return (
        <Badge variant="outline" className="bg-white/5 text-white/30 border-white/10 text-[10px] font-mono">
          Submitted
        </Badge>
      );
  }
}

function daysUntil(dateStr: string): string {
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff}d`;
}

interface TriageAlertFeedProps {
  variant?: "bento" | "sidebar";
}

export function TriageAlertFeed({ variant = "bento" }: TriageAlertFeedProps) {
  const assignments = useAppStore((s) => s.assignments);
  const courses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const triageStatuses = useCommandStore((s) => s.triageStatuses);
  const triggerRemediation = useCommandStore((s) => s.triggerRemediation);

  const courseMap = new Map(courses.map((c) => [c.id, c]));

  // Triage only the work in CURRENT modules (set on the Modules page).
  const currentIds = currentCourseIds(courses, customCourses, courseStatus);
  const visible = assignments.filter((a) => currentIds.has(a.course_id));

  // Sort: closest to today first (overdue + imminent at top, distant past/future at bottom)
  const now = Date.now();
  const sorted = [...visible].sort((a, b) => {
    const distA = Math.abs(new Date(a.due_at).getTime() - now);
    const distB = Math.abs(new Date(b.due_at).getTime() - now);
    return distA - distB;
  });

  const setSelectedConceptId = useAppStore((s) => s.setSelectedConceptId);

  const handleClick = (assignmentId: string) => {
    // If there's a pre-built remediation plan, use it
    const plan = MOCK_REMEDIATIONS[assignmentId];
    if (plan) {
      setSelectedConceptId(null);
      triggerRemediation(plan);
      return;
    }

    // Otherwise, build a detail plan from the assignment data
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    const course = courseMap.get(assignment.course_id);

    let steps: RemediationPlan["steps"] = [];
    let conceptsMissed: string[] = [];
    let score = 0;
    const maxScore = assignment.points_possible;

    if (assignment.status === "graded" || assignment.has_submitted_submissions) {
      // Submitted / graded — show review steps with healthy scores
      // Use a seeded score based on assignment ID for consistency across re-renders
      const seed = assignmentId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const scorePercent = 0.78 + (seed % 17) / 100; // 78-95%
      score = Math.round(maxScore * scorePercent);
      conceptsMissed = []; // no gaps
      steps = [
        { title: "Review Feedback", description: `Check Gradescope for ${assignment.name} feedback and any comments from ${course?.instructor ?? 'your instructor'}.`, estimatedTime: "10 min", status: "active" as const },
        { title: "Revisit Weak Areas", description: `Review any questions you missed. Focus on understanding the solution approach rather than memorizing answers.`, estimatedTime: "20 min", status: "pending" as const },
        { title: "Connect to Upcoming Material", description: `This assignment's concepts build into future ${course?.course_code ?? ''} topics. Review how they connect.`, estimatedTime: "15 min", status: "pending" as const },
      ];
    } else if (assignment.status === "in_progress") {
      // In progress — show completion steps with partial progress score
      const seed = assignmentId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const progressPercent = 0.35 + (seed % 25) / 100; // 35-60%
      score = Math.round(maxScore * progressPercent);
      conceptsMissed = assignment.description?.split(/[,.;]/).slice(0, 3).map(s => s.trim()).filter(Boolean) ?? [];
      steps = [
        { title: "Continue Working", description: `Keep working on ${assignment.name}. Focus on completing one section at a time.`, estimatedTime: "60 min", status: "active" as const },
        { title: "Test Your Solution", description: `Run all available test cases. Check for edge cases and boundary conditions.`, estimatedTime: "20 min", status: "pending" as const },
        { title: "Submit Before Deadline", description: `Due ${new Date(assignment.due_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}. Submit early — even partial work gets partial credit.`, estimatedTime: "5 min", status: "pending" as const },
      ];
    } else {
      // Upcoming — show preparation steps
      score = 0;
      conceptsMissed = assignment.description?.split(/[,.;]/).slice(0, 3).map(s => s.trim()).filter(Boolean) ?? [];
      steps = [
        { title: "Preview Material", description: `Read through the ${assignment.name} requirements. Identify which lecture topics are relevant.`, estimatedTime: "15 min", status: "active" as const },
        { title: "Review Prerequisites", description: `Make sure you're comfortable with the prerequisite concepts before starting.`, estimatedTime: "30 min", status: "pending" as const },
        { title: "Plan Your Timeline", description: `Due ${new Date(assignment.due_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}. Block time on your calendar to work on this.`, estimatedTime: "5 min", status: "pending" as const },
      ];
    }

    setSelectedConceptId(null);
    triggerRemediation({
      assignmentId,
      assignment_name: assignment.name,
      course_id: assignment.course_id,
      score,
      maxScore,
      conceptsMissed,
      steps,
    });
  };

  return (
    <div className={`h-full flex flex-col ${variant === "bento" ? "glass-card p-5" : "p-4"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-blue-400" />
          <span className="text-[11px] font-medium tracking-[0.15em] text-white/40 uppercase">
            Autonomous Triage
          </span>
        </div>
        <span className="text-[10px] text-white/20 font-mono">
          {sorted.length} items
        </span>
      </div>

      {/* Feed */}
      <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${variant === "bento" ? "-mx-1 px-1" : ""}`}>
        <div className="flex flex-col gap-1.5 pb-4">
          {sorted.map((assignment, idx) => {
            const status = triageStatuses[assignment.id] ?? "healthy";
            const course = courseMap.get(assignment.course_id);
            const isDanger = status === "danger";

            return (
              <button
                key={assignment.id}
                onClick={() => handleClick(assignment.id)}
                className={`
                  w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg
                  transition-all duration-200 animate-fade-in-up cursor-pointer
                  ${isDanger
                    ? "bg-red-500/[0.05] border border-red-500/10 hover:bg-red-500/[0.08]"
                    : "bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.08]"
                  }
                `}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Course color pip */}
                <div
                  className="w-1.5 h-8 rounded-full shrink-0"
                  style={{ background: COURSE_COLORS[assignment.course_id] ?? "#666" }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[12px] text-white/70 truncate">
                      {assignment.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 font-mono">
                      {course?.course_code ?? assignment.course_id.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-white/20">•</span>
                    <span
                      className={`text-[10px] font-mono ${isDanger ? "text-red-400" : "text-white/30"
                        }`}
                    >
                      {daysUntil(assignment.due_at)}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <div className="shrink-0 flex items-center gap-2">
                  {isDanger && (
                    <AlertTriangle size={12} className="text-red-400 animate-pulse" />
                  )}
                  {statusBadge(status)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
