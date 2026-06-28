import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Particles } from "@/components/background/Particles";
import { TriageAlertFeed } from "@/components/command/TriageAlertFeed";
import { AnnouncementsFeed } from "@/components/command/AnnouncementsFeed";
import { AssignmentInspector } from "@/components/command/AssignmentInspector";
import { AetherOrb } from "@/components/voice/AetherOrb";
import { ArtifactRenderer } from "@/components/chat/ArtifactRenderer";
import { StudyLabPane } from "@/components/study/StudyLabPane";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";
import { useCommandStore } from "@/store/useCommandStore";
import { useAppStore } from "@/store/useAppStore";
import { currentCourseIds } from "@/lib/modules";
import {
  Send,
  Mic,
  Loader2,
  Volume2,
  ChevronUp,
  X,
  History,
} from "lucide-react";

export function CommandCenter() {
  const { messages, loading, send, clearChat } = useChat();
  const { speak, stop, isPlaying, isLoading: voiceLoading } = useVoice();
  const activeRemediation = useCommandStore((s) => s.activeRemediation);
  const pendingChatPrompt = useAppStore((s) => s.pendingChatPrompt);
  const setPendingChatPrompt = useAppStore((s) => s.setPendingChatPrompt);
  const specializedAgentLabel = useAppStore((s) => s.specializedAgentLabel);
  
  const [input, setInput] = useState("");
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAutoSent = useRef(false);

  useEffect(() => {
    if (messages.length > 0) {
      setIsChatActive(true);
      setHistoryVisible(true);
    }
  }, [messages.length]);

  const assignments = useAppStore((s) => s.assignments);
  const courses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);

  const greetingLine = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Morning brief — derived from outstanding work in the student's CURRENT
  // modules, so it tracks whatever is marked "current" on the Modules page.
  const { briefItems, briefText } = useMemo(() => {
    const now = new Date();
    const currentIds = currentCourseIds(courses, customCourses, courseStatus);
    const codeMap = new Map<string, string>();
    courses.forEach((c) => codeMap.set(c.id, c.course_code));
    customCourses.forEach((c) => codeMap.set(c.id, c.course_code));

    const rel = (due: Date) => {
      const days = Math.round((due.getTime() - now.getTime()) / 86400000);
      if (days < 0) return { text: "Overdue", accent: "danger" as const };
      if (days === 0) return { text: "Due today", accent: "danger" as const };
      if (days === 1) return { text: "Due tomorrow", accent: "danger" as const };
      if (days <= 4) return { text: `Due in ${days} days`, accent: "warning" as const };
      return { text: due.toLocaleDateString("en-SG", { day: "2-digit", month: "short" }), accent: "info" as const };
    };

    const withDue = assignments
      .filter(
        (a) =>
          currentIds.has(a.course_id) &&
          a.due_at &&
          a.status !== "graded" &&
          a.status !== "submitted" &&
          !a.has_submitted_submissions,
      )
      .map((a) => ({ a, due: new Date(a.due_at) }));
    const upcoming = withDue.filter((x) => x.due >= now).sort((p, q) => p.due.getTime() - q.due.getTime());
    const overdue = withDue.filter((x) => x.due < now).sort((p, q) => q.due.getTime() - p.due.getTime());

    const items = [...upcoming, ...overdue].slice(0, 4).map(({ a, due }) => {
      const r = rel(due);
      const code = codeMap.get(a.course_id) ?? a.course_id.toUpperCase();
      return { label: `${code} ${a.name}`, meta: r.text, accent: r.accent };
    });

    const speech = items.length
      ? `${greetingLine}. Today is ${todayStr}. You have ${items.length} priority item${items.length > 1 ? "s" : ""} across your current modules. ` +
        items.map((it) => `${it.label}, ${it.meta}.`).join(" ")
      : `${greetingLine}. Today is ${todayStr}. No outstanding deadlines in your current modules — you're all caught up.`;

    return { briefItems: items, briefText: speech };
  }, [assignments, courses, customCourses, courseStatus, greetingLine, todayStr]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (pendingChatPrompt) {
      if (!hasAutoSent.current) {
        hasAutoSent.current = true;
        setHistoryVisible(true);
        send(pendingChatPrompt);
        setPendingChatPrompt(null);
      }
    } else {
      hasAutoSent.current = false;
    }
  }, [pendingChatPrompt, send, setPendingChatPrompt]);

  const handleSend = useCallback(() => {
    if (!input.trim() || loading) return;
    send(input);
    setInput("");
  }, [input, loading, send]);

  const handleOrbClick = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      speak(briefText);
    }
  }, [isPlaying, stop, speak, briefText]);

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full relative overflow-hidden atlas-hub-bg">
      <div className="absolute inset-0 z-0 pointer-events-none atlas-mesh-overlay" />
      <Particles
        className="z-[1]"
        quantity={100}
        staticity={55}
        ease={60}
        size={0.4}
        color="#ffffff"
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-1 flex min-h-0 relative">
          {/* TOP BAR - morning brief pill center, controls right */}
          <div className="absolute top-0 left-0 z-50 flex items-center h-16 px-8 pointer-events-none" style={{ right: isStudyMode ? '0' : '360px' }}>
            {/* Centered Pill Container - slightly offset right to balance WheelNav vs Sidebar gap */}
            <div className="absolute inset-0 flex items-center justify-center pl-10 pointer-events-none">
              <AnimatePresence>
                {isChatActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    onClick={() => setIsChatActive(false)}
                    className="flex items-center gap-3 h-10 px-4 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md cursor-pointer hover:bg-white/[0.08] transition-all shadow-xl pointer-events-auto"
                  >
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full overflow-visible relative">
                      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'scale(0.28)' }}>
                        <AetherOrb isSpeaking={isPlaying} isBriefAvailable={false} onClick={() => {}} isLoading={false} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-white/90 whitespace-nowrap">{greetingLine}, Armaan</span>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[11px] text-white/40 whitespace-nowrap">{todayStr}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT CONTROLS */}
            <div className="ml-auto flex items-center gap-3 pointer-events-auto">
              <button className="h-9 px-4 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono tracking-wider text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all flex items-center gap-2">
                <History size={14} />
                Chat History
              </button>
              <div className="flex items-center bg-white/[0.02] border border-white/[0.08] rounded-full p-1 backdrop-blur-md">
                <button
                  onClick={() => setIsStudyMode(false)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider transition-all duration-300 ${!isStudyMode ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setIsStudyMode(true)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider transition-all duration-300 ${isStudyMode ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                >
                  Study Plan
                </button>
              </div>
            </div>
          </div>

          {/* CENTER area */}
          <div className="flex-1 flex flex-col items-center min-w-0 relative z-20 pb-4 h-full">

            {/* Top spacer: ensures gap for top bar when chat active, centers dashboard when idle */}
            <div className="w-full shrink-0" style={{ flex: isChatActive ? '0 0 80px' : '1 1 auto' }} />

            <div
              className="px-6 relative z-20 w-full"
              style={{
                maxWidth: isStudyMode ? "1000px" : "700px",
                width: "100%",
              }}
            >
              {/* Brief card — only shown when NOT in chat mode */}
              {!isChatActive && (
                <div className="w-full p-8 rounded-[24px] bg-white/[0.02] command-brief-card">
                    {!isStudyMode && (
                      <div className="flex gap-10 items-center">
                        <div className="shrink-0">
                          <AetherOrb
                            isSpeaking={isPlaying}
                            isBriefAvailable={true}
                            onClick={handleOrbClick}
                            isLoading={voiceLoading}
                          />
                        </div>
                        <div className="flex flex-col gap-6 flex-1 min-w-0">
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
                              <span className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">Morning Brief</span>
                            </div>
                            <h2 className="text-xl font-medium text-white/95 tracking-tight mb-1">
                              {greetingLine}, Armaan.
                            </h2>
                            <p className="text-[13px] text-white/40 leading-relaxed">
                              Today is {todayStr}. Here's your intelligence summary.
                            </p>
                          </div>
                          <div className="space-y-2.5">
                            {briefItems.length === 0 ? (
                              <p className="text-[12px] text-white/30 italic">No outstanding deadlines in your current modules — you're all caught up. 🎉</p>
                            ) : (
                              briefItems.map((it, idx) => (
                                <BriefItem key={idx} accent={it.accent} label={it.label} meta={it.meta} />
                              ))
                            )}
                          </div>
                          <p className="text-[12px] text-white/25 leading-relaxed italic border-l border-white/[0.06] pl-4">
                            Tracking {briefItems.length} item{briefItems.length === 1 ? "" : "s"} across your current modules — set what counts as “current” in Modules.
                          </p>
                        </div>
                      </div>
                    )}
                    {isStudyMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className=""
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xs font-mono tracking-widest text-white/20 uppercase">Study Mission Lab</h3>
                          <button
                            onClick={() => setIsStudyMode(false)}
                            className="text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
                          >
                            <X size={10} />
                            Close Lab
                          </button>
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto px-1">
                          <StudyLabPane isEmbedded />
                        </div>
                      </motion.div>
                    )}
                </div>
              )}
            </div>

            <AnimatePresence>
              {isChatActive && isHistoryVisible && hasMessages && (
                <motion.div
                  initial={{ opacity: 0, height: 0, flex: 0 }}
                  animate={{ opacity: 1, height: "auto", flex: 1 }}
                  exit={{ opacity: 0, height: 0, flex: 0 }}
                  transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="w-full max-w-5xl mx-auto overflow-hidden flex flex-col min-h-0 relative z-20 mt-4 px-2"
                >
                  <div className="flex items-center gap-3 mb-3 px-2">
                    <button
                      onClick={() => setHistoryVisible(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider text-white/30 hover:text-white/60 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
                    >
                      <ChevronUp size={10} />
                      Hide History
                    </button>
                    <button
                      onClick={clearChat}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-mono text-white/20 hover:text-white/50 transition-colors"
                    >
                      <X size={9} />
                      Clear Chat
                    </button>
                  </div>
                  <div
                    className="flex-1 overflow-y-auto px-6 py-5 rounded-[24px]"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      backdropFilter: "blur(40px) saturate(180%)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div className="space-y-3">
                      {messages.map((msg, idx) => {
                        const isLastMsg = idx === messages.length - 1;
                        const isComplete = msg.role === "user" || !loading || !isLastMsg;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-[13px] leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-[#FF5252]/70 text-white"
                                  : "bg-white/[0.04] text-white/75 border border-white/[0.06]"
                              }`}
                            >
                              <ArtifactRenderer content={msg.content} isComplete={isComplete} />
                              {msg.role === "assistant" && msg.content && (
                                <button
                                  onClick={() => speak(msg.content)}
                                  disabled={voiceLoading || isPlaying}
                                  className="mt-1.5 text-white/25 hover:text-white/50 transition-colors"
                                >
                                  {voiceLoading ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={12} />}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {loading && messages[messages.length - 1]?.content === "" && (
                        <div className="flex justify-start">
                          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5">
                            <Loader2 size={14} className="animate-spin text-[#FF8A80]" />
                          </div>
                        </div>
                      )}
                      <div ref={bottomRef} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Spacers handled inside flex flow */}

            {/* Bottom spacer: mirrors top spacer to vertically center brief */}
            <div className="w-full shrink-0" style={{ flex: isChatActive ? '0 0 0px' : '1 1 auto' }} />
          </div>

          <AnimatePresence>
            {!isStudyMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute right-0 top-0 bottom-0 w-[360px] flex flex-col gap-4 p-5 z-30 pointer-events-auto"
              >
                <div
                  className="flex-1 min-h-0 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {activeRemediation ? (
                      <motion.div
                        key="assignment"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col"
                      >
                        <AssignmentInspector />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="triage"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col"
                      >
                        <TriageAlertFeed variant="sidebar" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div
                  className="flex-1 min-h-0 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <AnnouncementsFeed variant="sidebar" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="shrink-0 px-6 pb-5 pt-2">
          <div
            className="command-bottom-bar flex items-center gap-3 rounded-2xl px-5 py-3.5 mx-auto max-w-5xl"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              backdropFilter: "blur(40px) saturate(180%)",
              boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.15)",
            }}
          >
            <AnimatePresence mode="wait">
              {isChatActive ? (
                <motion.button 
                  key="orb-btn"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="relative flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                >
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-500" 
                    style={{ transform: `scale(${isVoiceMode ? 0.22 : 0.18})` }}
                  >
                    <AetherOrb
                      isSpeaking={isVoiceMode}
                      isBriefAvailable={false}
                      onClick={() => {}}
                      isLoading={false}
                    />
                  </div>
                </motion.button>
              ) : (
                <motion.button 
                  key="mic-btn"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="p-2 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                >
                  <Mic size={16} />
                </motion.button>
              )}
            </AnimatePresence>
            <input
              ref={inputRef}
              value={input}
              onFocus={() => setIsChatActive(true)}
              onBlur={() => {
                if (messages.length === 0) {
                  setIsChatActive(false);
                }
              }}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={isVoiceMode ? "Listening to your voice..." : specializedAgentLabel ? `Continue on ${specializedAgentLabel}...` : "Ask Atlas anything..."}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none min-w-0"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-[#FF5252] hover:bg-[#FF6B6B] disabled:bg-white/[0.04] disabled:text-white/15 text-white transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
            <div className="w-px h-6 bg-white/[0.08]" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
              <span className="text-[9px] font-mono tracking-[0.15em] text-white/20 uppercase whitespace-nowrap">
                Atlas Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefItem({
  accent,
  label,
  meta,
  small = false,
}: {
  accent: "danger" | "warning" | "info";
  label: string;
  meta: string;
  small?: boolean;
}) {
  const colors = {
    danger: { dot: "bg-red-400", text: "text-white/60", meta: "text-red-400/70" },
    warning: { dot: "bg-amber-400", text: "text-white/60", meta: "text-amber-400/70" },
    info: { dot: "bg-blue-400", text: "text-white/60", meta: "text-blue-400/70" },
  };
  const c = colors[accent];
  return (
    <div className={`flex items-center ${small ? 'gap-2' : 'gap-3'}`}>
      <div className={`rounded-full ${c.dot} shrink-0 ${small ? 'w-0.5 h-0.5' : 'w-1 h-1'}`} />
      <span className={`${c.text} truncate transition-all ${small ? 'text-[10px]' : 'text-[12px]'}`}>{label}</span>
      <span className={`font-mono ${c.meta} whitespace-nowrap ml-auto transition-all ${small ? 'text-[8px]' : 'text-[10px]'}`}>{meta}</span>
    </div>
  );
}
