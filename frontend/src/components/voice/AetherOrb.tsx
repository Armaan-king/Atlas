import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";

interface AetherOrbProps {
  isSpeaking: boolean;
  isBriefAvailable: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

const NODE_COUNT = 35;
const SPHERE_RADIUS = 2.0;
const CONNECTION_DISTANCE = 1.3;

function fibonacciSphere(
  count: number,
  radius: number,
  jitter = 0,
){
  const pts: any[] = [];
  const golden = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / golden;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const r = radius + (Math.random() - 0.5) * jitter;
    pts.push(
      new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ),
    );
  }
  return pts;
}

function randomInteriorNodes(
  count: number,
  radius: number,
){
  const pts: any[] = [];
  for (let i = 0; i < count; i++) {
    const r = radius * (0.25 + Math.random() * 0.5);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pts.push(
      new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ),
    );
  }
  return pts;
}

export function AetherOrb({
  isSpeaking,
  isBriefAvailable,
  onClick,
  isLoading = false,
}: AetherOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ isSpeaking });
  stateRef.current.isSpeaking = isSpeaking;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const RES = 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 6.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(RES, RES);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const root = new THREE.Group();
    root.rotation.x = 0.15;
    scene.add(root);

    // --- Outer wireframe icosphere ---
    const shellGeo = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 2);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    root.add(new THREE.Mesh(shellGeo, shellMat));

    // --- Inner wireframe icosphere (counter-rotates) ---
    const innerGeo = new THREE.IcosahedronGeometry(SPHERE_RADIUS * 0.55, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xe0e8ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    root.add(innerMesh);

    // --- Latitude rings ---
    const latMaterials: any[] = [];
    [-0.6, 0, 0.6].forEach((yNorm) => {
      const y = yNorm * SPHERE_RADIUS;
      const rRing = Math.sqrt(SPHERE_RADIUS ** 2 - y ** 2);
      const pts: any[] = [];
      for (let a = 0; a <= 64; a++) {
        const angle = (a / 64) * Math.PI * 2;
        pts.push(
          new THREE.Vector3(
            Math.cos(angle) * rRing,
            y,
            Math.sin(angle) * rRing,
          ),
        );
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: yNorm === 0 ? 0.45 : 0.2,
      });
      latMaterials.push(mat);
      root.add(new THREE.Line(geo, mat));
    });

    // --- Tilted orbit ring ---
    const orbitPts: any[] = [];
    const orbitR = SPHERE_RADIUS * 1.12;
    for (let a = 0; a <= 128; a++) {
      const angle = (a / 128) * Math.PI * 2;
      orbitPts.push(
        new THREE.Vector3(
          Math.cos(angle) * orbitR,
          0,
          Math.sin(angle) * orbitR,
        ),
      );
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });
    const orbitRing = new THREE.Line(orbitGeo, orbitMat);
    orbitRing.rotation.x = Math.PI / 2 + 0.35;
    orbitRing.rotation.z = 0.2;
    root.add(orbitRing);

    // --- Second orbit ring ---
    const orbit2 = orbitRing.clone();
    const orbit2Mat = new THREE.LineBasicMaterial({
      color: 0xc8d8ff,
      transparent: true,
      opacity: 0.15,
    });
    orbit2.material = orbit2Mat;
    orbit2.rotation.x = Math.PI / 2 - 0.5;
    orbit2.rotation.z = -0.4;
    root.add(orbit2);

    // --- Concept nodes ---
    const surfaceNodes = fibonacciSphere(
      Math.floor(NODE_COUNT * 0.6),
      SPHERE_RADIUS,
      0.12,
    );
    const interior = randomInteriorNodes(
      Math.floor(NODE_COUNT * 0.4),
      SPHERE_RADIUS,
    );
    const allNodes = [...surfaceNodes, ...interior];

    const dotGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const nodeMeshes: any[] = [];

    allNodes.forEach((pos) => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.75,
      });
      const m = new THREE.Mesh(dotGeo, mat);
      m.position.copy(pos);
      root.add(m);
      nodeMeshes.push(m);
    });

    // A few larger "key" nodes for visual hierarchy
    const keyDotGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const keyIndices = [0, 5, 12, 18, 25];
    keyIndices.forEach((idx) => {
      if (idx < allNodes.length) {
        const mat = new THREE.MeshBasicMaterial({
          color: 0xe8f0ff,
          transparent: true,
          opacity: 0.95,
        });
        const m = new THREE.Mesh(keyDotGeo, mat);
        m.position.copy(allNodes[idx]);
        root.add(m);
        nodeMeshes.push(m);
      }
    });

    // --- Connection lines ---
    const connVerts: number[] = [];
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        if (allNodes[i].distanceTo(allNodes[j]) < CONNECTION_DISTANCE) {
          connVerts.push(
            allNodes[i].x,
            allNodes[i].y,
            allNodes[i].z,
            allNodes[j].x,
            allNodes[j].y,
            allNodes[j].z,
          );
        }
      }
    }
    const connGeo = new THREE.BufferGeometry();
    connGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(connVerts, 3),
    );
    const connMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
    });
    root.add(new THREE.LineSegments(connGeo, connMat));

    // --- Small orbiting satellite dot ---
    const satGeo = new THREE.SphereGeometry(0.05, 6, 6);
    const satMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const satellite = new THREE.Mesh(satGeo, satMat);
    root.add(satellite);

    // --- Animation loop ---
    const clock = new THREE.Clock();
    let raf = 0;
    let rotY = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const sp = stateRef.current.isSpeaking;

      // Rotation
      rotY += (sp ? 0.35 : 0.12) * 0.016;
      root.rotation.y = rotY;
      root.rotation.x = 0.15 + Math.sin(t * 0.3) * 0.08;

      innerMesh.rotation.y = -rotY * 0.6;

      // Breathing scale
      const s = sp
        ? 1 + Math.sin(t * 3) * 0.035
        : 1 + Math.sin(t * 0.7) * 0.015;
      root.scale.setScalar(s);

      // Wireframe shell pulse
      shellMat.opacity = sp
        ? 0.28 + Math.sin(t * 2) * 0.1
        : 0.18 + Math.sin(t * 0.5) * 0.05;

      // Node pulse
      nodeMeshes.forEach((m, i) => {
        const phase = i * 0.4;
        m.material.opacity = sp
          ? 0.7 + Math.sin(t * 3 + phase) * 0.28
          : 0.55 + Math.sin(t * 0.8 + phase) * 0.2;
        const ns = sp ? 1 + Math.sin(t * 2.5 + phase) * 0.5 : 1;
        m.scale.setScalar(ns);
      });

      // Connection pulse
      connMat.opacity = sp
        ? 0.35 + Math.sin(t * 2) * 0.12
        : 0.22 + Math.sin(t * 0.4) * 0.07;

      // Orbit ring pulse
      orbitMat.opacity = sp
        ? 0.45 + Math.sin(t * 2.2) * 0.15
        : 0.3 + Math.sin(t * 0.6) * 0.08;

      orbit2Mat.opacity = sp
        ? 0.22 + Math.sin(t * 1.8) * 0.1
        : 0.15 + Math.sin(t * 0.5) * 0.05;

      // Latitude ring pulse
      latMaterials.forEach((mat, i) => {
        const base = i === 1 ? 0.45 : 0.2;
        mat.opacity = sp
          ? base + Math.sin(t * 2 + i) * 0.15
          : base + Math.sin(t * 0.5 + i) * 0.08;
      });

      // Satellite orbit
      const satAngle = t * (sp ? 1.5 : 0.6);
      const satR = SPHERE_RADIUS * 1.2;
      satellite.position.set(
        Math.cos(satAngle) * satR,
        Math.sin(satAngle * 0.7) * satR * 0.3,
        Math.sin(satAngle) * satR,
      );
      satMat.opacity = 0.5 + Math.sin(t * 3) * 0.3;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      shellGeo.dispose();
      shellMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      dotGeo.dispose();
      keyDotGeo.dispose();
      connGeo.dispose();
      connMat.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
      satGeo.dispose();
      satMat.dispose();
      nodeMeshes.forEach((m) => m.material.dispose());
      latMaterials.forEach((m) => m.dispose());
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={onClick}
        className="relative cursor-pointer group focus:outline-none"
        aria-label={isSpeaking ? "Stop speaking" : "Play morning brief"}
      >
        {/* Volumetric glow underneath (floating feel) */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-36 h-8 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(200, 220, 255, 0.15) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />

        {/* Ambient halo */}
        <div
          className="absolute inset-[-28px] rounded-full pointer-events-none"
          style={{
            background: isSpeaking
              ? "radial-gradient(circle, rgba(220, 235, 255, 0.16) 0%, transparent 65%)"
              : "radial-gradient(circle, rgba(220, 235, 255, 0.07) 0%, transparent 60%)",
            filter: "blur(18px)",
          }}
        />

        {/* Three.js holographic sphere */}
        <div
          ref={containerRef}
          className="w-44 h-44"
          style={{
            filter: isSpeaking
              ? "drop-shadow(0 0 22px rgba(200, 220, 255, 0.5))"
              : "drop-shadow(0 0 12px rgba(200, 220, 255, 0.25))",
          }}
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-2 border-transparent border-t-white/40 animate-spin" />
          </div>
        )}
      </button>

      {/* Prompting tooltip */}
      {isBriefAvailable && !isSpeaking && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            y: [-3, 3, -3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          className="mt-5 px-4 py-2 rounded-full text-[11px] font-mono tracking-wide text-white/50 bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm"
        >
          Click to play morning brief
        </motion.div>
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-5 flex items-center gap-2"
        >
          <div className="flex items-center gap-[3px] h-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-[3px] rounded-full bg-white/70"
                animate={{
                  height: ["4px", "16px", "4px"],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono tracking-wide text-white/50">
            Speaking...
          </span>
        </motion.div>
      )}
    </div>
  );
}
