"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  MathUtils,
  Vector3,
  type Group,
} from "three";

import type { ProjectSlug } from "@/data/projects";
import { COLORS } from "./layout";

export type Emphasis = "active" | "idle" | "dim";

type Vec3 = [number, number, number];

/**
 * One line material per structure. Its colour eases between idle, active
 * (hovered or selected) and dimmed (another structure is selected), so every
 * edge of a structure changes state together.
 */
export function useEdgeMaterial(emphasis: Emphasis, reducedMotion: boolean) {
  const material = useMemo(
    () => new LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 1 }),
    [],
  );
  const target = useMemo(() => new Color(), []);
  useFrame((_, dt) => {
    target.set(emphasis === "active" ? COLORS.accent : emphasis === "dim" ? COLORS.edgeDim : COLORS.edge);
    const k = reducedMotion ? 1 : 1 - Math.exp(-8 * Math.min(dt, 0.05));
    material.color.lerp(target, k);
    material.opacity = MathUtils.lerp(material.opacity, emphasis === "dim" ? 0.55 : 1, k);
  });
  return material;
}

const edgeCache = new Map<string, EdgesGeometry>();
function boxEdges(w: number, h: number, d: number) {
  const key = `${w}|${h}|${d}`;
  let g = edgeCache.get(key);
  if (!g) {
    g = new EdgesGeometry(new BoxGeometry(w, h, d));
    edgeCache.set(key, g);
  }
  return g;
}

interface BlockProps {
  size: Vec3;
  position?: Vec3;
  rotation?: Vec3;
  color?: string;
  edge: LineBasicMaterial;
  children?: ReactNode;
}

/** A solid box with crisp outline edges — the basic architectural unit. */
export function Block({ size, position, rotation, color = COLORS.solid, edge, children }: BlockProps) {
  const edges = useMemo(() => boxEdges(...size), [size]);
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.86} metalness={0.08} />
      </mesh>
      <lineSegments geometry={edges} material={edge} />
      {children}
    </group>
  );
}

/** Rim circles of a cylinder (top and bottom), without side seams. */
export function cylinderRims(radius: number, height: number) {
  return new EdgesGeometry(new CylinderGeometry(radius, radius, height, 40), 20);
}

/** A polyline in 3D space as line segments geometry. */
export function polyline(points: Vec3[]) {
  const g = new BufferGeometry();
  const arr: number[] = [];
  for (let i = 0; i < points.length - 1; i++) arr.push(...points[i], ...points[i + 1]);
  g.setAttribute("position", new Float32BufferAttribute(arr, 3));
  return g;
}

/** Rectangle outline in the XY plane (for gates, frames, boundaries). */
export function rectXY(w: number, h: number) {
  const x = w / 2;
  const y = h / 2;
  return polyline([
    [-x, -y, 0],
    [x, -y, 0],
    [x, y, 0],
    [-x, y, 0],
    [-x, -y, 0],
  ]);
}

/** Rectangle outline in the XZ plane (for scan planes and floor markings). */
export function rectXZ(w: number, d: number) {
  const x = w / 2;
  const z = d / 2;
  return polyline([
    [-x, 0, -z],
    [x, 0, -z],
    [x, 0, z],
    [-x, 0, z],
    [-x, 0, -z],
  ]);
}

/** Point at parameter t (0..1) along a polyline, by arc length. */
export function pointAlong(points: Vec3[], t: number, out: Vec3): Vec3 {
  let total = 0;
  const lens: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b] = [points[i], points[i + 1]];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    lens.push(l);
    total += l;
  }
  let d = MathUtils.clamp(t, 0, 1) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const f = lens[i] === 0 ? 0 : d / lens[i];
      const [a, b] = [points[i], points[i + 1]];
      out[0] = a[0] + (b[0] - a[0]) * f;
      out[1] = a[1] + (b[1] - a[1]) * f;
      out[2] = a[2] + (b[2] - a[2]) * f;
      return out;
    }
    d -= lens[i];
  }
  return out;
}

interface InteractiveProps {
  slug: ProjectSlug;
  position: Vec3;
  /** Size of the invisible pick volume — larger than the geometry for easy tapping. */
  hitSize: Vec3;
  hitOffset?: Vec3;
  onHover: (slug: ProjectSlug | null) => void;
  onSelect: (slug: ProjectSlug) => void;
  children: ReactNode;
}

/** Shared interaction shell: pick volume, hover and click-vs-drag. */
export function Interactive({
  slug,
  position,
  hitSize,
  hitOffset = [0, hitSize[1] / 2, 0],
  onHover,
  onSelect,
  children,
}: InteractiveProps) {
  const group = useRef<Group>(null);

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(slug);
    document.body.style.cursor = "pointer";
  };
  const out = () => {
    onHover(null);
    document.body.style.cursor = "";
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    // A drag that ends over the structure is a rotation, not a selection.
    if (e.delta > 6) return;
    e.stopPropagation();
    onSelect(slug);
  };

  return (
    <group ref={group} position={position}>
      <mesh position={hitOffset} onPointerOver={over} onPointerOut={out} onClick={click}>
        <boxGeometry args={hitSize} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {children}
    </group>
  );
}

export interface LabelAnchor {
  id: string;
  text: string;
  position: Vec3;
  emphasis: Emphasis;
}

/**
 * Projects label anchors to screen space every frame and writes the result
 * straight to DOM nodes outside the canvas — no extra React roots, no
 * per-frame React renders.
 */
export function LabelProjector({ anchors, nodes }: { anchors: LabelAnchor[]; nodes: React.RefObject<Map<string, HTMLElement>> }) {
  const v = useMemo(() => new Vector3(), []);
  useFrame(({ camera, size }) => {
    for (const a of anchors) {
      const el = nodes.current?.get(a.id);
      if (!el) continue;
      v.set(...a.position).project(camera);
      const behind = v.z > 1;
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      el.style.visibility = behind ? "hidden" : "visible";
    }
  });
  return null;
}
