import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import { useGraphData } from "@/hooks/useGraphData";
import { effectiveModuleBuckets } from "@/lib/modules";
import { useAppStore } from "@/store/useAppStore";
import { useCommandStore } from "@/store/useCommandStore";
import { apiPost } from "@/lib/api";


import { getMasteryTier } from "@/types";

function getThermalColor(mastery: number): string {
  return getMasteryTier(mastery).color;
}

// ── Course Prerequisite Tree Parameters ───────────────────────────────────────
const LAYER_H_COURSE = 120;
const Y_PAD_COURSE = 60;

const PREREQ_ORDER = [
  'mh2802','sc2005','mh1812','bu8201','he2001',
  'sc2002','sc2001','sc1015',
  'sc4001','sc3000','sc4002','sc4024','mh3700',
];

export interface KnowledgeGraphProps {
  preview?: boolean;
  onPreviewClick?: (nodeId?: string) => void;
  thermalMode?: boolean;
  prerequisiteMode?: boolean;
  resetCameraTrigger?: number;
}

export function KnowledgeGraph({
  preview = false,
  onPreviewClick,
  thermalMode = false,
  prerequisiteMode = false,
  resetCameraTrigger = 0,
}: KnowledgeGraphProps = {}) {
  const { nodes: initialNodes, edges: initialEdges } = useGraphData();
  const courses = useAppStore((s) => s.courses);
  const customCourses = useAppStore((s) => s.customCourses);
  const courseStatus = useAppStore((s) => s.courseStatus);
  const courseOverrides = useAppStore((s) => s.courseOverrides);
  const allConcepts = useAppStore((s) => s.concepts);
  const allConnections = useAppStore((s) => s.connections);
  const setSelectedConceptId = useAppStore((s) => s.setSelectedConceptId);
  const dismissRemediation = useCommandStore((s) => s.dismissRemediation);

  const [hoverNode, setHoverNode] = useState<string | null>(null);
  // skillCourseIdx=0 → NTU course map, 1+ → individual course skill trees
  const [skillCourseIdx, setSkillCourseIdx] = useState(0);

  // Course recommendations
  type Recommendation = { course_id: string; name: string; reason: string };
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [recsLoading, setRecsLoading] = useState(false);

  const recommendationSeedCourseIds = useMemo(() => {
    const buckets = effectiveModuleBuckets(courses, customCourses, courseStatus, courseOverrides);
    const allowedIds = new Set(courses.map((course) => course.id));
    return [...buckets.current, ...buckets.taken]
      .map((module) => module.id)
      .filter((id) => allowedIds.has(id));
  }, [courses, customCourses, courseStatus, courseOverrides]);

  const skillCourses = useMemo(() => {
    const ids = [...new Set(
      allConcepts.map(n => n.course_id as string).filter(Boolean)
    )];
    return ids
      .sort((a, b) => {
        const ai = PREREQ_ORDER.indexOf(a);
        const bi = PREREQ_ORDER.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
      .map(id => courses.find(c => c.id === id))
      .filter((c): c is typeof courses[0] => !!c);
  }, [allConcepts, courses]);

  const prevPrereqMode = useRef(prerequisiteMode);
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Reset Carousel to Course Map when toggling Prerequisite Mode
  useEffect(() => {
    setSkillCourseIdx(0);
  }, [prerequisiteMode]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!fgRef.current) return;

    const timer = setInterval(() => {
      if (fgRef.current) {
        const controls = fgRef.current.controls();
        
        if (prerequisiteMode) {
          controls.autoRotate = false;
          fgRef.current.d3Force('charge').strength(0);
          fgRef.current.d3Force('link').strength(0);
        } else {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.2;
          fgRef.current.d3Force('charge').strength(-120);
          fgRef.current.d3Force('link')
            .distance((link: any) => link.isGravitational ? 20 : 60)
            .strength((link: any) => link.isGravitational ? 0.8 : 0.2);
          fgRef.current.d3VelocityDecay(0.3);
        }

        controls.minDistance = 700;
        controls.maxDistance = 1700;
      }
    }, 100);

    if (prerequisiteMode) {
      fgRef.current.controls().autoRotate = false;
      fgRef.current.d3Force('charge').strength(0);
      fgRef.current.d3Force('link').strength(0);
      fgRef.current.d3Force('center', null);
      fgRef.current.d3ReheatSimulation();
    } else {
      fgRef.current.controls().autoRotate = true;
      fgRef.current.controls().autoRotateSpeed = 0.2;
      fgRef.current.d3Force('charge').strength(-400);
      fgRef.current.d3Force('link')
        .distance((link: any) => link.isGravitational ? 20 : 80)
        .strength((link: any) => link.isGravitational ? 0.8 : 0.2);
      fgRef.current.d3ReheatSimulation();
    }

    return () => clearInterval(timer);
  }, [prerequisiteMode]);

  const handleEngineTick = useCallback(() => {}, []);

  // Glide camera to active course slot when navigating
  const handleResetCamera = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(1000);
    }
  }, [fgRef]);

  useEffect(() => {
    if (resetCameraTrigger > 0) {
      handleResetCamera();
    }
  }, [resetCameraTrigger, handleResetCamera]);

  const nodeDegrees = useMemo(() => {
    const degrees: Record<string, number> = {};
    if (prerequisiteMode) {
      allConcepts.forEach(n => { degrees[n.id] = 0; });
      allConnections.forEach(e => {
        const srcId = String(e.source_id);
        const tgtId = String(e.target_id);
        degrees[srcId] = (degrees[srcId] || 0) + 1;
        degrees[tgtId] = (degrees[tgtId] || 0) + 1;
      });
    } else {
      initialNodes.forEach(n => { degrees[n.id] = 0; });
      initialEdges.forEach(e => {
        const srcId = typeof e.source === 'object' ? (e.source as any).id : e.source;
        const tgtId = typeof e.target === 'object' ? (e.target as any).id : e.target;
        if (typeof srcId === 'string') degrees[srcId] = (degrees[srcId] || 0) + 1;
        if (typeof tgtId === 'string') degrees[tgtId] = (degrees[tgtId] || 0) + 1;
      });
    }
    return degrees;
  }, [initialNodes, initialEdges, allConcepts, allConnections, prerequisiteMode]);

  // Build a dynamic color map from the store so new courses get their correct colors
  const courseColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach((c) => { map[c.id] = c.color; });
    return map;
  }, [courses]);

  // Construct ForceGraph data format with Galaxy Centers injected
  const graphData = useMemo(() => {
    // ── ForceGraph dynamic mapping ────────────────────────────────────────────

    // 1. Regular Nodes (always included)
    const standardNodes = initialNodes.map((n) => {
      const mastery = typeof n.data?.mastery === 'number' ? n.data.mastery : 100;
      const course_id = typeof n.data?.course_id === 'string' ? n.data.course_id : '';
      return {
        id: n.id,
        name: n.data?.label || n.id,
        val: Math.max(1, (nodeDegrees[n.id] || 0) * 1.5),
        color: thermalMode
          ? getThermalColor(mastery)
          : (courseColorMap[course_id] || "#6b7280"),
        mastery,
        course_id,
        isGalaxyCenter: false,
      };
    });

    // All real edges mapped to source/target ids
    const standardLinks = initialEdges.map((e) => ({
      id: e.id,
      source: typeof e.source === 'object' ? (e.source as any).id : e.source,
      target: typeof e.target === 'object' ? (e.target as any).id : e.target,
      label: e.label,
      isGravitational: false,
    }));

    // ── Prereq / skill-tree carousel ──
    if (prerequisiteMode) {
      const LAYER_H = 95;
      const SPREAD = 85;
      const Y_PAD = 60;

      // ── Slide 0: Dynamic Course map ──────────────────────────────────────────
      if (skillCourseIdx === 0) {
        // Derive course edges from ALL cross-course concept links to ensure global structure is visible
        const courseEdgesMap = new Map<string, { source: string, target: string }>();
        allConnections.forEach(e => {
          const sConcept = allConcepts.find(n => n.id === String(e.source_id));
          const tConcept = allConcepts.find(n => n.id === String(e.target_id));
          if (sConcept && tConcept && sConcept.course_id && tConcept.course_id && sConcept.course_id !== tConcept.course_id) {
             const sC = sConcept.course_id;
             const tC = tConcept.course_id;
             const edgeId = `pe-${sC}-${tC}`;
             courseEdgesMap.set(edgeId, { source: sC, target: tC });
          }
        });
        const courseEdges = Array.from(courseEdgesMap.values()).map(val => ({ id: `pe-${val.source}-${val.target}`, ...val, isGravitational: false }));

        // Custom Layer Assignment per user request
        const courseIdsList = courses.map(c => c.id);
        const layers = new Map<string, number>();
        const l0 = ['mh2802', 'sc2005', 'mh1812', 'bu8201', 'he2001'];
        const l1 = ['sc2002', 'sc2001', 'sc1015'];
        const l2 = ['sc4001', 'sc3000', 'sc4002', 'sc4024', 'mh3700'];
        
        courseIdsList.forEach(id => {
          if (l0.includes(id)) layers.set(id, 0);
          else if (l1.includes(id)) layers.set(id, 1);
          else if (l2.includes(id)) layers.set(id, 2);
          else layers.set(id, 0);
        });

        // Calculate positions
        const nodesByLayer = new Map<number, typeof courses>();
        courses.forEach(c => {
           const l = layers.get(c.id) ?? 0;
           if (!nodesByLayer.has(l)) nodesByLayer.set(l, []);
           nodesByLayer.get(l)!.push(c);
        });
        
        const nodes = courses.map(c => {
           const level = layers.get(c.id) ?? 0;
           const layerGroup = nodesByLayer.get(level) ?? [c];
           const idxInLayer = layerGroup.findIndex(x => x.id === c.id);
           const SPACING = 240;
           const totalW = (layerGroup.length - 1) * SPACING;
           const fx = -totalW/2 + idxInLayer * SPACING;
           
           let shortName = c.name;
           if (shortName.startsWith('Introduction to ')) shortName = shortName.replace('Introduction to ', '');
           if (shortName.length > 20) shortName = shortName.split(' ')[0] + ' ' + (shortName.split(' ')[1] || '');
           
           return {
             id: c.id,
             name: `${c.course_code.toUpperCase()}\n${shortName}`,
             color: courseColorMap[c.id] ?? c.color ?? '#ffffff',
             val: 4,
             level,
             isGalaxyCenter: false,
             fx,
             fy: level * LAYER_H_COURSE + Y_PAD_COURSE,
             fz: 0,
             skillOpacity: 1.0,
             isCourseMap: true,
           };
        });

        return { nodes, links: courseEdges };
      }

      // ── Slides 1+: individual course skill trees ─────────────────────────
      // Intra-course edges only (using ALL connections for that course)
      const intraLinks = allConnections.filter(l => {
        const s = allConcepts.find(n => n.id === String(l.source_id));
        const t = allConcepts.find(n => n.id === String(l.target_id));
        return s && t && s.course_id === t.course_id;
      }).map(l => ({
        id: l.id,
        source: l.source_id,
        target: l.target_id,
        label: l.label,
        isGravitational: false
      }));

      // Topo-sort for a set of node ids given intraLinks
      const topoLayers = (ids: string[]): Map<string, number> => {
        const set = new Set(ids);
        const inDeg = new Map(ids.map(id => [id, 0]));
        const adj = new Map(ids.map(id => [id, [] as string[]]));
        intraLinks.forEach(l => {
          const s = String(l.source), t = String(l.target);
          if (set.has(s) && set.has(t)) {
            adj.get(s)!.push(t);
            inDeg.set(t, (inDeg.get(t) ?? 0) + 1);
          }
        });
        const layers = new Map<string, number>();
        const q = ids.filter(id => (inDeg.get(id) ?? 0) === 0);
        q.forEach(id => layers.set(id, 0));
        let head = 0;
        while (head < q.length) {
          const id = q[head++];
          const lay = layers.get(id) ?? 0;
          for (const nid of adj.get(id) ?? []) {
            const nl = lay + 1;
            if ((layers.get(nid) ?? -1) < nl) layers.set(nid, nl);
            const d = (inDeg.get(nid) ?? 1) - 1;
            inDeg.set(nid, d);
            if (d <= 0) q.push(nid);
          }
        }
        ids.forEach(id => { if (!layers.has(id)) layers.set(id, 0); });
        return layers;
      };

      const courseIds = skillCourses.map(c => c.id);
      const activeCourseIdx = skillCourseIdx - 1;
      const cid = courseIds[activeCourseIdx];
      if (!cid) return { nodes: [], links: [] };

      const cNodes = allConcepts.filter(n => n.course_id === cid).map(n => ({
        id: n.id,
        name: n.label,
        val: Math.max(1, (nodeDegrees[n.id] || 0) * 1.5),
        color: courseColorMap[cid] || "#6b7280",
        course_id: cid,
        isGalaxyCenter: false,
      }));
      const layers = topoLayers(cNodes.map(n => n.id));

      const byLayer = new Map<number, string[]>();
      cNodes.forEach(n => {
        const l = layers.get(n.id) ?? 0;
        if (!byLayer.has(l)) byLayer.set(l, []);
        byLayer.get(l)!.push(n.id);
      });

      const posNodes: any[] = [];
      byLayer.forEach((ids, layerNum) => {
        ids.forEach((id, i) => {
          const offset = (i - (ids.length - 1) / 2) * SPREAD;
          const node = cNodes.find(n => n.id === id)!;
          posNodes.push({ ...node, fx: offset, fy: layerNum * LAYER_H + Y_PAD, fz: 0, skillOpacity: 1.0 });
        });
      });

      const course = courses.find(c => c.id === cid);
      const labelNodes = [{
        id: `skill-label-${cid}`,
        name: course?.course_code?.toUpperCase() ?? cid.toUpperCase(),
        isGalaxyCenter: true,
        val: 1,
        color: courseColorMap[cid] ?? '#ffffff',
        course_id: cid,
        skillOpacity: 1.0,
        fx: 0,
        fy: Y_PAD - 45,
        fz: 0,
      }];

      const nodeIdSet = new Set(posNodes.map(n => n.id));
      const filteredLinks = intraLinks.filter(l =>
        nodeIdSet.has(String(l.source)) && nodeIdSet.has(String(l.target))
      );

      return { nodes: [...posNodes, ...labelNodes], links: filteredLinks };
    }

    // ── Normal force-graph mode: add galaxy centers + gravitational links ──
    const activeCourseIds = Array.from(new Set(
      initialNodes.map(n => typeof n.data?.course_id === 'string' ? n.data.course_id : null).filter(Boolean)
    ));

    const galaxyNodes = activeCourseIds.map(course_id => {
      const course = courses.find(c => c.id === course_id);
      const code = course ? course.course_code.toUpperCase() : String(course_id).toUpperCase();
      return {
        id: `galaxy-${course_id}`,
        name: code,
        isGalaxyCenter: true,
        val: 10,
        color: "#ffffff", // Monochrome titles as requested
        course_id: String(course_id),
      };
    });

    const gravitationalLinks = initialNodes.map(n => {
      const course_id = n.data?.course_id;
      if (!course_id) return null;
      return {
        id: `grav-${n.id}`,
        source: n.id,
        target: `galaxy-${course_id}`,
        isGravitational: true,
      };
    }).filter(Boolean);

    const nodes = [...standardNodes, ...galaxyNodes];
    const links = [...standardLinks, ...gravitationalLinks].filter(
      (l): l is NonNullable<typeof l> => l !== null
    );

    return { nodes, links };
  }, [initialNodes, initialEdges, allConcepts, allConnections, thermalMode, prerequisiteMode, nodeDegrees, courses, skillCourseIdx, skillCourses, courseColorMap]);

  // Compute target camera view (position + focus) - specifically for Prerequisites mode
  const cameraTarget = useMemo(() => {
    if (!prerequisiteMode) return null;

    if (skillCourseIdx === 0) {
      // User captured coordinates for optimal global view
      return { 
        pos: { x: -15.77, y: 131.00, z: 1233.29 },
        // lookAt calculated to match Rot: x=0.01, y=-0.08, z=-0.00
        lookAt: { x: -95.77, y: 121.00, z: 236.29 } 
      };
    }

    // Individual course skill trees - Use nodes.length as a stability guard
    const nonLabel = graphData.nodes.filter((n: any) => !n.isGalaxyCenter);
    const maxFy = Math.max(0, ...nonLabel.map((n: any) => n.fy ?? 0));
    const centerY = maxFy / 2;
    const cameraZ = Math.max(300, maxFy * 1.1 + 200);
    
    return { 
      pos: { x: 0, y: centerY, z: cameraZ },
      lookAt: { x: 0, y: centerY, z: 0 }
    };
  }, [prerequisiteMode, skillCourseIdx, graphData.nodes.length]);

  // Update camera on mode or target changes
  useEffect(() => {
    if (!fgRef.current) return;
    
    // CASE 1: Transitioning out of Prerequisites Mode -> Zoom to Fit the whole graph
    if (!prerequisiteMode) {
      if (prevPrereqMode.current) {
        fgRef.current.zoomToFit(1000);
      }
      prevPrereqMode.current = false;
      return;
    }

    // CASE 2: Transitioning into or navigating within Prerequisites Mode
    prevPrereqMode.current = true;
    if (!cameraTarget) return;

    const { pos, lookAt } = cameraTarget;
    const timeout = setTimeout(() => {
      fgRef.current?.cameraPosition(pos, lookAt, 800);
    }, 150);

    return () => clearTimeout(timeout);
  }, [cameraTarget, prerequisiteMode, fgRef]);

  const highlightNodes = useMemo(() => {
    const set = new Set<string>();
    if (hoverNode) {
      set.add(hoverNode);
      // We only highlight standard connections, not gravitational ties
      graphData.links.filter((l): l is NonNullable<typeof l> => !!l && !l.isGravitational).forEach((l) => {
        const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        if (sourceId === hoverNode) set.add(targetId);
        if (targetId === hoverNode) set.add(sourceId);
      });
    }
    return set;
  }, [hoverNode, graphData.links]);

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-0">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <ForceGraph3D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            enableNodeDrag={true}
            enableNavigationControls={true}
            showNavInfo={!preview}
            graphData={graphData}
            d3VelocityDecay={prerequisiteMode ? 1 : 0.4}
            nodeLabel={(node: any) => node.isGalaxyCenter ? '' : node.name}
            nodeResolution={32}
            nodeThreeObject={(node: any) => {
              // Galaxy Centers are pure, large Text Sprites
              if (node.isGalaxyCenter) {
                const labelOpacity = prerequisiteMode ? (node.skillOpacity ?? 0.8) : 0.8;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 1024;
                canvas.height = 120;
                if (context) {
                  // Refined typography: smaller, monospace, high globalAlpha
                  context.font = "bold 140px 'Geist', monospace, sans-serif";
                  context.fillStyle = "rgba(255,255,255,0.95)";
                  context.globalAlpha = labelOpacity;
                  context.textAlign = "center";
                  context.textBaseline = "middle";
                  context.fillText(node.name, 512, 60);
                }
                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                const material = new THREE.SpriteMaterial({
                  map: texture,
                  transparent: true,
                  depthWrite: false,
                  opacity: labelOpacity,
                });
                const sprite = new THREE.Sprite(material);
                sprite.position.set(0, prerequisiteMode ? 0 : 15, 0);
                sprite.scale.set(80, 10, 1);
                return sprite;
              }

              // Normal Concept Nodes
              const isHovered = hoverNode === node.id;
              const isConnected = hoverNode ? highlightNodes.has(node.id) : true;
              const r = Math.cbrt(node.val) * 4.0;
              // In skill-tree mode, dim non-active course nodes
              const baseOpacity = prerequisiteMode ? (node.skillOpacity ?? 1.0) : 1.0;
              const finalOpacity = isConnected ? baseOpacity : Math.min(baseOpacity, 0.08);

              const geometry = new THREE.SphereGeometry(r);
              const material = new THREE.MeshPhongMaterial({
                shininess: 5,
                color: node.color,
                transparent: true,
                opacity: finalOpacity,
              });
              const mesh = new THREE.Mesh(geometry, material);
              if (isHovered) mesh.scale.set(1.1, 1.1, 1.1);

              // In skill-tree or course-map mode: always show label below the node
              if (prerequisiteMode) {
                const group = new THREE.Group();
                group.add(mesh);

                const lines = node.name.split('\n');
                const lineCount = lines.length;
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = lineCount > 1 ? 200 : 128;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.fillStyle = "rgba(210,210,220,0.95)";
                  ctx.globalAlpha = finalOpacity;
                  ctx.textAlign = 'center';
                  if (lineCount > 1) {
                    ctx.font = "bold 72px 'Geist', monospace, sans-serif";
                    ctx.textBaseline = 'middle';
                    ctx.fillText(lines[0], 512, 60);
                    ctx.font = "48px 'Geist', monospace, sans-serif";
                    ctx.fillStyle = "rgba(200,200,210,0.85)";
                    ctx.globalAlpha = finalOpacity * 0.9;
                    ctx.fillText(lines[1], 512, 150);
                  } else {
                    ctx.font = "bold 64px 'Geist', monospace, sans-serif";
                    ctx.textBaseline = 'middle';
                    ctx.fillText(node.name, 512, 64);
                  }
                }
                const tex = new THREE.CanvasTexture(canvas);
                const spriteH = lineCount > 1 ? 20 : 14;
                const labelSprite = new THREE.Sprite(
                  new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: finalOpacity })
                );
                labelSprite.position.set(0, -(r + (lineCount > 1 ? 28 : 22)), 0);
                labelSprite.scale.set(100, spriteH, 1);
                group.add(labelSprite);
                return group;
              }

              return mesh;
            }}
            linkColor={(link: any) => {
              if (link.isGravitational) return "rgba(0,0,0,0)"; // Totally invisible

              if (hoverNode) {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                if (sourceId === hoverNode || targetId === hoverNode) {
                  return "rgba(255, 255, 255, 1.0)";
                }
                return "rgba(255, 255, 255, 0.04)"; // Dim others
              }
              return "rgba(255, 255, 255, 0.25)"; // Sleeker, more subtle baseline
            }}
            linkWidth={(link: any) => {
              if (link.isGravitational) return 0;

              if (hoverNode) {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                if (sourceId === hoverNode || targetId === hoverNode) return 2.2;
              }
              return prerequisiteMode ? 1.8 : 1.2;
            }}
            linkDirectionalArrowLength={(link: any) => (prerequisiteMode && !link.isGravitational) ? 3.5 : 0}
            linkDirectionalArrowRelPos={1}
            onNodeClick={(node: any) => {
              if (node.isGalaxyCenter) {
                if (preview && onPreviewClick) {
                  onPreviewClick();
                }
                return; // Prevent clicking labels in full mode
              }

              if (preview && onPreviewClick) {
                onPreviewClick(node.id);
                return;
              }

              dismissRemediation();
              setSelectedConceptId(node.id);
              const distance = 120;
              const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
              fgRef.current?.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                node,
                1500
              );
            }}
            onNodeHover={(node: any) => {
              if (node?.isGalaxyCenter) {
                document.body.style.cursor = 'default';
                setHoverNode(null);
              } else {
                document.body.style.cursor = node ? 'pointer' : 'default';
                setHoverNode(node ? node.id : null);
              }
            }}
            onBackgroundClick={() => {
              if (preview && onPreviewClick) {
                onPreviewClick();
                return;
              }
              setSelectedConceptId(null);
              handleResetCamera();
            }}
            backgroundColor="#0d0a0a"
            onEngineTick={handleEngineTick}
          />
        )}
      </div>

      {/* Skill-tree carousel nav — prev/next arrows + course indicator */}
      {/* Total slides = 1 (course map) + skillCourses.length */}
      {prerequisiteMode && !preview && (
        <>
          {/* Dot indicator + flanking arrows — slot 0 = course map, slots 1+ = courses */}
          <div className="absolute top-9 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
            {/* Prev arrow */}
            <button
              onClick={() => setSkillCourseIdx(i => (i - 1 + skillCourses.length + 1) % (skillCourses.length + 1))}
              onMouseEnter={() => setHoverNode(null)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 border border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-black/60 transition-all backdrop-blur-sm text-base flex-shrink-0"
            >‹</button>

            {/* Course map dot */}
            <button
              onClick={() => setSkillCourseIdx(0)}
              className="rounded-full transition-all duration-300"
              style={{
                width: skillCourseIdx === 0 ? 31 : 7,
                height: 7,
                background: skillCourseIdx === 0 ? '#ffffff' : 'rgba(255,255,255,0.2)',
                boxShadow: skillCourseIdx === 0 ? '0 0 10px #ffffff' : 'none',
              }}
            />
            {/* Per-course dots */}
            {skillCourses.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSkillCourseIdx(i + 1)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i + 1 === skillCourseIdx ? 31 : 7,
                  height: 7,
                  background: i + 1 === skillCourseIdx
                    ? (courseColorMap[c.id] ?? '#fff')
                    : 'rgba(255,255,255,0.2)',
                  boxShadow: i + 1 === skillCourseIdx ? `0 0 10px ${courseColorMap[c.id] ?? '#fff'}` : 'none',
                }}
              />
            ))}

            {/* Next arrow */}
            <button
              onClick={() => setSkillCourseIdx(i => (i + 1) % (skillCourses.length + 1))}
              onMouseEnter={() => setHoverNode(null)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 border border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-black/60 transition-all backdrop-blur-sm text-base flex-shrink-0"
            >›</button>
          </div>

          {/* "Suggest Next Courses" button + recommendation cards — course map only */}
          {skillCourseIdx === 0 && (
            <div className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
              {!recommendations && (
                <button
                  disabled={recsLoading}
                  onClick={async () => {
                    setRecsLoading(true);
                    try {
                      const res = await apiPost<{
                        status: string;
                        agent_url: string | null;
                        recommendations: Recommendation[];
                      }>("/knowledge/recommend-courses", {
                        taken_course_ids: recommendationSeedCourseIds,
                      });
                      setRecommendations(res.recommendations);
                    } catch (err) {
                      console.error("Failed to fetch course recommendations:", err);
                    } finally {
                      setRecsLoading(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/80 text-sm font-medium hover:bg-white/20 hover:border-white/30 hover:text-white transition-all backdrop-blur-md flex items-center gap-2"
                >
                  {recsLoading ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Asking Atlas...
                    </>
                  ) : (
                    "Suggest Next Courses"
                  )}
                </button>
              )}

              {recommendations && (
                <div className="flex gap-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.course_id}
                      className="w-52 p-3 rounded-xl bg-black/60 border border-white/15 backdrop-blur-lg"
                    >
                      <div className="text-xs font-bold text-white/90 tracking-wide mb-1">
                        {rec.course_id}
                      </div>
                      <div className="text-[11px] text-white/70 font-medium leading-tight mb-1.5">
                        {rec.name}
                      </div>
                      <div className="text-[10px] text-white/50 leading-snug">
                        {rec.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}


    </>
  );
}
