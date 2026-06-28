import { useMemo, useState } from "react";
import { useGraphFilters } from "@/hooks/useGraphFilters";
import { useAppStore } from "@/store/useAppStore";
import type { Concept, Connection } from "@/types";

// ── Constants ────────────────────────────────────────────────────────────────

const COURSE_COLORS: Record<string, string> = {
  sc2002: "#8B5CF6",
  mh2802: "#3B82F6",
  sc2005: "#EF4444",
  mh1812: "#10B981",
  sc2001: "#F59E0B",
  sc1015: "#06B6D4",
  sc3000: "#6366F1",
  sc4001: "#EC4899",
  sc4002: "#14B8A6",
  sc4024: "#84CC16",
  mh3700: "#F97316",
  bu8201: "#A855F7",
  he2001: "#6366F1",
};

const R = 20;           // node radius
const LAYER_H = 120;    // pixels per layer
const NODE_W = 100;     // horizontal spacing between nodes
const COURSE_GAP = 80;  // gap between course sections
const TOP_PAD = 60;     // space for course labels
const BOTTOM_PAD = 60;

// ── Topo sort → layer assignment ─────────────────────────────────────────────

function assignLayers(concepts: Concept[], connections: Connection[]): Map<string, number> {
  const adj = new Map<string, Set<string>>();
  const inDeg = new Map<string, number>();

  concepts.forEach((c) => {
    adj.set(c.id, new Set());
    inDeg.set(c.id, 0);
  });

  connections.forEach((e) => {
    if (!adj.has(e.source_id) || !adj.has(e.target_id)) return;
    adj.get(e.source_id)!.add(e.target_id);
    inDeg.set(e.target_id, (inDeg.get(e.target_id) ?? 0) + 1);
  });

  const layers = new Map<string, number>();
  const queue = concepts.filter((c) => (inDeg.get(c.id) ?? 0) === 0).map((c) => c.id);
  queue.forEach((id) => layers.set(id, 0));

  let head = 0;
  while (head < queue.length) {
    const id = queue[head++];
    const lay = layers.get(id) ?? 0;
    for (const nid of adj.get(id) ?? []) {
      const nl = lay + 1;
      if ((layers.get(nid) ?? -1) < nl) layers.set(nid, nl);
      const deg = (inDeg.get(nid) ?? 1) - 1;
      inDeg.set(nid, deg);
      if (deg <= 0) queue.push(nid);
    }
  }

  // Handle disconnected or cyclic nodes
  concepts.forEach((c) => { if (!layers.has(c.id)) layers.set(c.id, 0); });
  return layers;
}

// ── Layout computation ────────────────────────────────────────────────────────

interface NodePos { x: number; y: number }

function buildLayout(
  concepts: Concept[],
  connections: Connection[],
  courses: Array<{ id: string; course_code: string; color: string }>,
) {
  const layers = assignLayers(concepts, connections);
  const maxLayer = Math.max(0, ...Array.from(layers.values()));

  // Group by course, preserving course order
  const orderedCourseIds: string[] = [];
  courses.forEach((c) => {
    if (concepts.some((n) => n.course_id === c.id)) orderedCourseIds.push(c.id);
  });
  // Any course not in the courses array goes last
  concepts.forEach((n) => {
    if (!orderedCourseIds.includes(n.course_id)) orderedCourseIds.push(n.course_id);
  });

  const byCourse = new Map<string, Concept[]>();
  orderedCourseIds.forEach((id) => byCourse.set(id, []));
  concepts.forEach((c) => byCourse.get(c.course_id)?.push(c));

  const positions = new Map<string, NodePos>();
  const courseRects: Array<{
    id: string; x: number; width: number; color: string; label: string;
  }> = [];

  let cursorX = COURSE_GAP / 2;

  for (const courseId of orderedCourseIds) {
    const group = byCourse.get(courseId) ?? [];
    if (!group.length) continue;

    // Group by layer
    const byLayer = new Map<number, Concept[]>();
    group.forEach((c) => {
      const l = layers.get(c.id) ?? 0;
      if (!byLayer.has(l)) byLayer.set(l, []);
      byLayer.get(l)!.push(c);
    });

    const maxNodesInLayer = Math.max(...Array.from(byLayer.values()).map((v) => v.length));
    const courseWidth = Math.max(1, maxNodesInLayer) * NODE_W;

    byLayer.forEach((layerNodes, layerNum) => {
      // Row Y — layer 0 (root/prereqs) at BOTTOM, highest layer at TOP
      const y = TOP_PAD + (maxLayer - layerNum) * LAYER_H + LAYER_H / 2;
      const totalRowW = (layerNodes.length - 1) * NODE_W;
      const startX = cursorX + courseWidth / 2 - totalRowW / 2;
      layerNodes.forEach((c, i) => {
        positions.set(c.id, { x: startX + i * NODE_W, y });
      });
    });

    const course = courses.find((c) => c.id === courseId);
    courseRects.push({
      id: courseId,
      x: cursorX,
      width: courseWidth,
      color: course?.color ?? COURSE_COLORS[courseId] ?? "#6b7280",
      label: course?.course_code?.toUpperCase() ?? courseId.toUpperCase(),
    });

    cursorX += courseWidth + COURSE_GAP;
  }

  const totalWidth = Math.max(800, cursorX);
  const totalHeight = TOP_PAD + (maxLayer + 1) * LAYER_H + BOTTOM_PAD;

  return { positions, layers, courseRects, totalWidth, totalHeight, maxLayer };
}

// ── Star field background ─────────────────────────────────────────────────────

const STARS = Array.from({ length: 120 }, (_, i) => ({
  x: ((i * 137.5) % 1) * 4000,
  y: ((i * 97.3) % 1) * 3000,
  r: i % 5 === 0 ? 1.5 : 0.8,
  o: 0.1 + (i % 7) * 0.05,
}));

// ── Component ─────────────────────────────────────────────────────────────────

export function SkillTree() {
  const { concepts, connections } = useGraphFilters();
  const courses = useAppStore((s) => s.courses);
  const selectedConceptId = useAppStore((s) => s.selectedConceptId);
  const setSelectedConceptId = useAppStore((s) => s.setSelectedConceptId);
  const [hovered, setHovered] = useState<string | null>(null);

  const layout = useMemo(
    () => buildLayout(concepts, connections, courses),
    [concepts, connections, courses],
  );

  if (concepts.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#070505]">
        <p className="text-white/20 font-mono text-sm">No concepts to display</p>
      </div>
    );
  }

  const { positions, courseRects, totalWidth, totalHeight } = layout;

  // Highlight set for hover
  const highlightSet = useMemo(() => {
    const s = new Set<string>();
    if (!hovered) return s;
    s.add(hovered);
    connections.forEach((c) => {
      if (c.source_id === hovered) s.add(c.target_id);
      if (c.target_id === hovered) s.add(c.source_id);
    });
    return s;
  }, [hovered, connections]);

  return (
    <div className="absolute inset-0 overflow-auto bg-[#070505]">
      <svg
        width={totalWidth}
        height={totalHeight}
        style={{ minWidth: "100%", minHeight: "100%" }}
      >
        <defs>
          {/* Per-course glow filters */}
          {courseRects.map(({ id }) => (
            <filter key={id} id={`glow-${id}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="glow-ring" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Radial gradients for nodes */}
          {concepts.map((c) => {
            const color = COURSE_COLORS[c.course_id] ?? "#6b7280";
            return (
              <radialGradient key={c.id} id={`grad-${c.id}`} cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </radialGradient>
            );
          })}
        </defs>

        {/* Star field */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x % totalWidth} cy={s.y % totalHeight} r={s.r} fill="white" opacity={s.o} />
        ))}

        {/* Course section backgrounds */}
        {courseRects.map((cr) => (
          <g key={cr.id}>
            <rect
              x={cr.x - 4}
              y={TOP_PAD - 8}
              width={cr.width + 8}
              height={totalHeight - TOP_PAD + 8}
              rx={10}
              fill={cr.color}
              fillOpacity={0.025}
              stroke={cr.color}
              strokeOpacity={0.06}
              strokeWidth={1}
            />
            {/* Course label */}
            <text
              x={cr.x + cr.width / 2}
              y={TOP_PAD - 18}
              textAnchor="middle"
              fill={cr.color}
              fillOpacity={0.65}
              fontSize={10}
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="3"
            >
              {cr.label}
            </text>
            {/* Thin divider line below label */}
            <line
              x1={cr.x}
              y1={TOP_PAD - 10}
              x2={cr.x + cr.width}
              y2={TOP_PAD - 10}
              stroke={cr.color}
              strokeOpacity={0.15}
              strokeWidth={0.5}
            />
          </g>
        ))}

        {/* Connection lines — drawn before nodes */}
        {connections.map((conn) => {
          const src = positions.get(conn.source_id);
          const tgt = positions.get(conn.target_id);
          if (!src || !tgt) return null;

          const srcConcept = concepts.find((c) => c.id === conn.source_id);
          const color = COURSE_COLORS[srcConcept?.course_id ?? ""] ?? "#6b7280";

          const isActive =
            hovered === null ||
            highlightSet.has(conn.source_id) ||
            highlightSet.has(conn.target_id);

          // Bezier curve: source is prereq (bottom), target is dependent (top)
          const cy = (src.y + tgt.y) / 2;
          const d = `M ${src.x} ${src.y} C ${src.x} ${cy}, ${tgt.x} ${cy}, ${tgt.x} ${tgt.y}`;

          // Arrow tip
          const dy = tgt.y - cy;
          const ax = tgt.x;
          const ay = tgt.y - (R + 4) * Math.sign(dy);

          return (
            <g key={conn.id} opacity={isActive ? 1 : 0.06}>
              {/* Glow layer */}
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={3}
                opacity={0.12}
                strokeLinecap="round"
              />
              {/* Main line */}
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={isActive && (hovered === conn.source_id || hovered === conn.target_id) ? 2 : 1}
                opacity={isActive ? 0.45 : 0.2}
                strokeLinecap="round"
              />
              {/* Arrowhead pointing toward target */}
              <polygon
                points={`${ax},${ay} ${ax - 4},${ay + 8 * Math.sign(dy)} ${ax + 4},${ay + 8 * Math.sign(dy)}`}
                fill={color}
                opacity={isActive ? 0.6 : 0.2}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {concepts.map((concept) => {
          const pos = positions.get(concept.id);
          if (!pos) return null;

          const color = COURSE_COLORS[concept.course_id] ?? "#6b7280";
          const mastery = concept.mastery;
          const isLocked = mastery < 25;
          const isSelected = selectedConceptId === concept.id;
          const isHov = hovered === concept.id;
          const dimmed = hovered !== null && !highlightSet.has(concept.id);

          // Glow radius scales with mastery
          const glowScale = 0.3 + (mastery / 100) * 0.7;

          // Mastery ring: stroke-dasharray trick for progress arc
          const ringR = R + 5;
          const circumference = 2 * Math.PI * ringR;
          const dashLen = (mastery / 100) * circumference;

          return (
            <g
              key={concept.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: "pointer" }}
              opacity={dimmed ? 0.12 : 1}
              onMouseEnter={() => setHovered(concept.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelectedConceptId(isSelected ? null : concept.id)}
            >
              {/* Outer selection/hover pulse ring */}
              {(isSelected || isHov) && (
                <circle
                  r={R + 12}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  opacity={0.3}
                  filter="url(#glow-ring)"
                />
              )}

              {/* Mastery progress ring */}
              <circle
                r={ringR}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray={`${dashLen} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                transform="rotate(-90)"
                opacity={isLocked ? 0.12 : 0.55}
              />
              {/* Background track of ring */}
              <circle
                r={ringR}
                fill="none"
                stroke={color}
                strokeWidth={1}
                opacity={0.08}
              />

              {/* Node body */}
              <circle
                r={R}
                fill={isLocked ? "#110a0a" : `url(#grad-${concept.id})`}
                stroke={color}
                strokeWidth={isSelected ? 2 : 1.2}
                opacity={isLocked ? 0.5 : 1}
                filter={mastery >= 65 ? `url(#glow-${concept.course_id})` : undefined}
              />

              {/* Inner bright core for high mastery */}
              {mastery >= 70 && (
                <circle
                  r={R * 0.35}
                  fill={color}
                  opacity={glowScale * 0.6}
                />
              )}

              {/* Lock icon */}
              {isLocked ? (
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  opacity={0.35}
                >
                  🔒
                </text>
              ) : (
                /* Mastery % */
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={8}
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill={color}
                  opacity={0.9}
                >
                  {mastery}%
                </text>
              )}

              {/* Concept label */}
              <text
                y={R + 15}
                textAnchor="middle"
                fontSize={isHov ? 10 : 9}
                fontFamily="monospace"
                fill="rgba(255,255,255,0.75)"
                opacity={isHov ? 1 : 0.65}
              >
                {concept.label.length > 14
                  ? concept.label.slice(0, 13) + "…"
                  : concept.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
