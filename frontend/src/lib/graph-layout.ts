import type { Concept, Connection } from "../types";

interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

const CLUSTER_SPACING = 400;
const NODE_SPREAD = 160;
const REPULSION = 3000;
const ATTRACTION = 0.005;
const DAMPING = 0.85;
const ITERATIONS = 120;

export function layoutGraph(
  concepts: Concept[],
  connections: Connection[],
): LayoutNode[] {
  const courseIds = [...new Set(concepts.map((c) => c.course_id))];

  const clusterCenters = new Map<string, { x: number; y: number }>();
  const cols = Math.ceil(Math.sqrt(courseIds.length));
  courseIds.forEach((cid, i) => {
    clusterCenters.set(cid, {
      x: (i % cols) * CLUSTER_SPACING,
      y: Math.floor(i / cols) * CLUSTER_SPACING,
    });
  });

  const nodes: LayoutNode[] = concepts.map((c) => {
    const center = clusterCenters.get(c.course_id) ?? { x: 0, y: 0 };
    return {
      id: c.id,
      x: center.x + (Math.random() - 0.5) * NODE_SPREAD,
      y: center.y + (Math.random() - 0.5) * NODE_SPREAD,
    };
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const velocities = new Map<string, { vx: number; vy: number }>();
  nodes.forEach((n) => velocities.set(n.id, { vx: 0, vy: 0 }));

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy + 1;
        const force = REPULSION / distSq;
        const fx = (dx / Math.sqrt(distSq)) * force;
        const fy = (dy / Math.sqrt(distSq)) * force;
        velocities.get(a.id)!.vx += fx;
        velocities.get(a.id)!.vy += fy;
        velocities.get(b.id)!.vx -= fx;
        velocities.get(b.id)!.vy -= fy;
      }
    }

    // Attraction along edges
    for (const conn of connections) {
      const a = nodeMap.get(conn.source_id);
      const b = nodeMap.get(conn.target_id);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const fx = dx * ATTRACTION;
      const fy = dy * ATTRACTION;
      velocities.get(a.id)!.vx += fx;
      velocities.get(a.id)!.vy += fy;
      velocities.get(b.id)!.vx -= fx;
      velocities.get(b.id)!.vy -= fy;
    }

    // Gravity toward cluster center
    for (const node of nodes) {
      const concept = concepts.find((c) => c.id === node.id);
      if (!concept) continue;
      const center = clusterCenters.get(concept.course_id);
      if (!center) continue;
      const vel = velocities.get(node.id)!;
      vel.vx += (center.x - node.x) * 0.01;
      vel.vy += (center.y - node.y) * 0.01;
    }

    // Apply velocities
    for (const node of nodes) {
      const vel = velocities.get(node.id)!;
      node.x += vel.vx;
      node.y += vel.vy;
      vel.vx *= DAMPING;
      vel.vy *= DAMPING;
    }
  }

  return nodes;
}
