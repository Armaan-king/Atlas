import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { useGraphFilters } from "./useGraphFilters";
import { layoutGraph } from "../lib/graph-layout";
import type { Node, Edge } from "@xyflow/react";

export function useGraphData() {
  const courses = useAppStore((s) => s.courses);
  const { concepts: filtered, connections: filteredConnections } = useGraphFilters();

  const courseColorMap = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((c) => map.set(c.id, c.color));
    return map;
  }, [courses]);

  const { nodes, edges } = useMemo(() => {
    const positions = layoutGraph(filtered, filteredConnections);
    const posMap = new Map(positions.map((p) => [p.id, p]));

    const nodes: Node[] = filtered.map((concept) => {
      const pos = posMap.get(concept.id) ?? { x: 0, y: 0 };
      return {
        id: concept.id,
        type: "concept",
        position: { x: pos.x, y: pos.y },
        data: {
          label: concept.label,
          description: concept.description,
          mastery: concept.mastery,
          course_id: concept.course_id,
          color: courseColorMap.get(concept.course_id) ?? "#6b7280",
        },
      };
    });

    const edges: Edge[] = filteredConnections.map((conn) => ({
      id: conn.id,
      source: conn.source_id,
      target: conn.target_id,
      label: conn.label,
      animated: conn.cross_course,
      style: {
        stroke: conn.cross_course
          ? "#f59e0b"
          : courseColorMap.get(
              filtered.find((c) => c.id === conn.source_id)?.course_id ?? "",
            ) ?? "#6b7280",
        strokeWidth: 2,
      },
    }));

    return { nodes, edges };
  }, [filtered, filteredConnections, courseColorMap]);

  return { nodes, edges };
}
