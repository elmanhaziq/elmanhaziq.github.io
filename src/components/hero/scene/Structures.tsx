"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Color,
  type InstancedMesh,
  type LineBasicMaterial,
  type Mesh,
  type MeshStandardMaterial,
  Object3D,
  type Group,
} from "three";
import { COLORS } from "./layout";
import { Block, cylinderRims, pointAlong, polyline, rectXY, rectXZ, type Emphasis } from "./primitives";

interface StructureProps {
  edge: LineBasicMaterial;
  emphasis: Emphasis;
  reducedMotion: boolean;
}

const accent = new Color(COLORS.accent);
const black = new Color("#000000");

/* ════════════════════════════════════════════════════════════════════════
 * 01 SpineVision — a lumbar column abstracted into six blocks and five
 * discs (L1-L2 … L5-S1, the five levels the sagittal pipeline grades).
 * A scan plane sweeps the column; the disc it crosses is highlighted, the
 * way the pipeline detects, assigns and grades one level at a time.
 * ════════════════════════════════════════════════════════════════════════ */
export function SpineColumn({ edge, emphasis, reducedMotion }: StructureProps) {
  const VERTEBRAE = 6;
  const STEP = 0.4;
  const BASE = 0.36;
  const curve = (i: number) => 0.12 * Math.sin((i / (VERTEBRAE - 1)) * Math.PI);

  const discs = useRef<(Mesh | null)[]>([]);
  const scan = useRef<Group>(null);
  const rims = useMemo(() => cylinderRims(0.34, 0.09), []);
  const scanGeom = useMemo(() => rectXZ(1.7, 1.25), []);

  useFrame(({ clock }) => {
    const top = BASE + (VERTEBRAE - 1) * STEP + 0.3;
    const t = reducedMotion ? 0.5 : (clock.elapsedTime * 0.16) % 1;
    const y = 0.15 + t * (top - 0.15);
    if (scan.current) scan.current.position.y = y;
    discs.current.forEach((d, i) => {
      if (!d) return;
      const dy = Math.abs(d.position.y - y);
      const k = Math.max(0, 1 - dy / 0.28);
      const m = d.material as MeshStandardMaterial;
      m.emissive.copy(black).lerp(accent, k * (emphasis === "dim" ? 0.25 : 0.85));
    });
  });

  return (
    <group>
      <Block size={[2.3, 0.08, 1.8]} position={[0, 0.04, 0]} color={COLORS.plinth} edge={edge} />
      {Array.from({ length: VERTEBRAE }, (_, i) => {
        // Bottom block is the sacrum: wider and deeper.
        const sacrum = i === 0;
        const w = sacrum ? 1.2 : 1.0 - i * 0.03;
        const h = sacrum ? 0.34 : 0.24;
        return (
          <Block
            key={i}
            size={[w, h, sacrum ? 0.82 : 0.7]}
            position={[curve(i), BASE + i * STEP, 0]}
            rotation={[0, 0, (sacrum ? -0.08 : 0)]}
            edge={edge}
          />
        );
      })}
      {Array.from({ length: VERTEBRAE - 1 }, (_, i) => (
        <group key={i} position={[(curve(i) + curve(i + 1)) / 2, BASE + i * STEP + STEP / 2, 0]}>
          <mesh ref={(m) => void (discs.current[i] = m)}>
            <cylinderGeometry args={[0.34, 0.34, 0.09, 40]} />
            <meshStandardMaterial color={COLORS.solidLight} roughness={0.6} />
          </mesh>
          <lineSegments geometry={rims} material={edge} />
        </group>
      ))}
      <group ref={scan}>
        <lineSegments geometry={scanGeom}>
          <lineBasicMaterial color={COLORS.accent} transparent opacity={0.85} />
        </lineSegments>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 02 ClinIQ Care — the conversational pipeline in depth order:
 * LLM interviewer (front) → safety gate → read-only rule base (back).
 * The rule base is 24 cells: rules R001–R022 plus G001–G002.
 * ════════════════════════════════════════════════════════════════════════ */
const RULE_COLS = 6;
const RULE_ROWS = 4;
// Illustrative evaluation passes: each lights the cells of one candidate set.
const PASSES = [
  [3, 4, 9],
  [1, 7, 8, 14],
  [16, 17],
  [3, 4],
];

export function RuleLattice({ edge, emphasis, reducedMotion }: StructureProps) {
  const cells = useRef<InstancedMesh>(null);
  const llm = useRef<Mesh>(null);
  const pulse = useRef<Mesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const base = useMemo(() => new Color(COLORS.solid), []);
  const tmpColor = useMemo(() => new Color(), []);
  const levels = useRef(new Float32Array(RULE_COLS * RULE_ROWS));

  const LATTICE_Z = -0.65;
  const GATE_Z = 0.3;
  const LLM_POS: [number, number, number] = [0, 1.15, 1.05];
  const route: [number, number, number][] = [LLM_POS, [0, 1.15, GATE_Z], [0, 1.15, LATTICE_Z + 0.15]];

  const gate = useMemo(() => rectXY(2.3, 1.75), []);
  const kbFrame = useMemo(() => rectXY(2.95, 2.05), []);
  const link = useMemo(() => polyline(route), []); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const m = cells.current;
    if (!m) return;
    for (let r = 0; r < RULE_ROWS; r++) {
      for (let c = 0; c < RULE_COLS; c++) {
        const i = r * RULE_COLS + c;
        dummy.position.set(-1.05 + c * 0.42, 0.55 + r * 0.42, LATTICE_Z);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        m.setColorAt(i, base);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [base, dummy]);

  const p: [number, number, number] = [0, 0, 0];
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const m = cells.current;
    const phase = reducedMotion ? 0 : Math.floor(t / 2.2) % PASSES.length;
    const local = reducedMotion ? 0.7 : (t % 2.2) / 2.2;
    const lit = PASSES[phase];
    const strength = emphasis === "dim" ? 0.3 : 1;
    if (m) {
      for (let i = 0; i < levels.current.length; i++) {
        // Cells light only after the pulse has crossed the safety gate.
        const goal = lit.includes(i) && local > 0.45 ? strength : 0;
        const k = reducedMotion ? 1 : 1 - Math.exp(-6 * Math.min(dt, 0.05));
        levels.current[i] += (goal - levels.current[i]) * k;
        tmpColor.copy(base).lerp(accent, levels.current[i]);
        m.setColorAt(i, tmpColor);
      }
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    if (llm.current && !reducedMotion) {
      llm.current.rotation.y = t * 0.4;
      llm.current.rotation.x = t * 0.15;
    }
    if (pulse.current) {
      pointAlong(route, Math.min(local / 0.45, 1), p);
      pulse.current.position.set(p[0], p[1], p[2]);
      pulse.current.visible = !reducedMotion && local < 0.45;
    }
  });

  return (
    <group>
      <Block size={[3.2, 0.08, 2.7]} position={[0, 0.04, 0]} color={COLORS.plinth} edge={edge} />

      {/* Knowledge base: read-only rules */}
      <instancedMesh ref={cells} args={[undefined, undefined, RULE_COLS * RULE_ROWS]}>
        <boxGeometry args={[0.24, 0.24, 0.24]} />
        <meshStandardMaterial roughness={0.7} metalness={0.05} />
      </instancedMesh>
      <lineSegments geometry={kbFrame} material={edge} position={[0, 1.18, LATTICE_Z - 0.2]} />
      <Block size={[3.0, 0.05, 0.05]} position={[0, 0.12, LATTICE_Z - 0.2]} edge={edge} />

      {/* Safety layer: every message passes it before any rule is evaluated */}
      <lineSegments geometry={gate} material={edge} position={[0, 1.08, GATE_Z]} />
      <Block size={[0.05, 1.9, 0.05]} position={[-1.15, 1.03, GATE_Z]} edge={edge} />
      <Block size={[0.05, 1.9, 0.05]} position={[1.15, 1.03, GATE_Z]} edge={edge} />

      {/* LLM interviewer */}
      <mesh ref={llm} position={LLM_POS}>
        <icosahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color={COLORS.solidLight} roughness={0.4} flatShading />
      </mesh>
      <Block size={[0.04, 1.08, 0.04]} position={[0, 0.58, LLM_POS[2]]} edge={edge} />

      <lineSegments geometry={link}>
        <lineBasicMaterial color={COLORS.edge} transparent opacity={0.6} />
      </lineSegments>
      <mesh ref={pulse}>
        <boxGeometry args={[0.07, 0.07, 0.07]} />
        <meshBasicMaterial color={COLORS.accent} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 03 Interactive Art Museum — a cut-away gallery: rooms, partitions and
 * framed panels, with the guided-tour camera tracing its route inside.
 * ════════════════════════════════════════════════════════════════════════ */
const TOUR: [number, number, number][] = [
  [-0.75, 0.32, 0.55],
  [-0.75, 0.32, -0.5],
  [-0.2, 0.32, -0.55],
  [0.65, 0.32, -0.55],
  [0.7, 0.32, 0.65],
  [-0.2, 0.32, 0.75],
  [-0.75, 0.32, 0.55],
];

// Framed panels: [position, rotationY, width, height]
const FRAMES: [[number, number, number], number, number, number][] = [
  [[-0.55, 0.85, -0.93], 0, 0.42, 0.32],
  [[0.35, 0.82, -0.93], 0, 0.3, 0.38],
  [[-1.13, 0.84, -0.2], Math.PI / 2, 0.46, 0.3],
  [[-1.13, 0.84, 0.55], Math.PI / 2, 0.26, 0.32],
  [[0.08, 0.84, 0.2], -Math.PI / 2, 0.3, 0.3],
];

export function GalleryRoom({ edge, reducedMotion }: StructureProps) {
  const visitor = useRef<Mesh>(null);
  const path = useMemo(() => polyline(TOUR), []);
  const p: [number, number, number] = [0, 0, 0];

  useFrame(({ clock }) => {
    if (!visitor.current) return;
    const t = reducedMotion ? 0.3 : (clock.elapsedTime * 0.05) % 1;
    pointAlong(TOUR, t, p);
    visitor.current.position.set(p[0], p[1], p[2]);
  });

  const WALL_H = 1.25;
  const wy = 0.12 + WALL_H / 2;
  const frameOutlines = useMemo(() => FRAMES.map(([, , w, h]) => rectXY(w + 0.06, h + 0.06)), []);

  return (
    <group>
      <Block size={[2.9, 0.08, 2.5]} position={[0, 0.04, 0]} color={COLORS.plinth} edge={edge} />
      <Block size={[2.4, 0.04, 2.1]} position={[0, 0.1, 0]} color={COLORS.solid} edge={edge} />
      {/* Back wall, side wall, partial right wall, interior partition */}
      <Block size={[2.4, WALL_H, 0.06]} position={[0, wy, -1.02]} edge={edge} />
      <Block size={[0.06, WALL_H, 2.1]} position={[-1.17, wy, 0]} edge={edge} />
      <Block size={[0.06, WALL_H, 1.0]} position={[1.17, wy, -0.52]} edge={edge} />
      <Block size={[0.06, WALL_H * 0.86, 0.9]} position={[0.12, 0.12 + (WALL_H * 0.86) / 2, 0.2]} edge={edge} />

      {FRAMES.map(([pos, ry, w, h], i) => (
        <group key={i} position={pos} rotation={[0, ry, 0]}>
          <mesh position={[0, 0, 0.035]}>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial color="#c9ccd2" roughness={0.9} emissive="#2a2d33" />
          </mesh>
          <lineSegments geometry={frameOutlines[i]} material={edge} position={[0, 0, 0.04]} />
        </group>
      ))}

      <lineSegments geometry={path}>
        <lineBasicMaterial color={COLORS.accent} transparent opacity={0.28} />
      </lineSegments>
      <mesh ref={visitor}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshBasicMaterial color={COLORS.accent} />
      </mesh>
    </group>
  );
}
