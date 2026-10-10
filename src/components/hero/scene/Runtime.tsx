"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import type { ProjectSlug } from "@/data/projects";
import { COLORS, LAYOUT, RUNTIME } from "./layout";
import { Block, pointAlong, polyline, rectXZ, useEdgeMaterial } from "./primitives";

type Vec3 = [number, number, number];
const Y = 0.012;

/**
 * The deployment bus: orthogonal floor traces from each structure into a
 * shared runtime node, and from there out towards the viewer. Pulses travel
 * from component to running system — the "then I make them work" half of the
 * headline.
 */
const ROUTES: Record<ProjectSlug, Vec3[]> = (() => {
  const [rx, , rz] = RUNTIME;
  const s = LAYOUT.spinevision.position;
  const c = LAYOUT["cliniq-care"].position;
  const m = LAYOUT["art-museum"].position;
  return {
    spinevision: [
      [s[0], Y, s[2] + 0.9],
      [s[0], Y, rz],
      [rx - 0.5, Y, rz],
    ],
    "cliniq-care": [
      [c[0] - 0.1, Y, c[2] + 1.35],
      [rx, Y, rz - 0.5],
    ],
    "art-museum": [
      [m[0], Y, m[2] + 1.25],
      [m[0], Y, rz],
      [rx + 0.5, Y, rz],
    ],
  };
})();

const EGRESS: Vec3[] = [
  [RUNTIME[0], Y, RUNTIME[2] + 0.5],
  [RUNTIME[0], Y, RUNTIME[2] + 9],
];

interface Props {
  selected: ProjectSlug | null;
  reducedMotion: boolean;
}

export function Runtime({ selected, reducedMotion }: Props) {
  const edge = useEdgeMaterial(selected ? "dim" : "idle", reducedMotion);
  const core = useRef<Mesh>(null);
  const pulses = useRef<(Mesh | null)[]>([]);
  const slugs = Object.keys(ROUTES) as ProjectSlug[];

  const traces = useMemo(() => slugs.map((k) => polyline(ROUTES[k])), []); // eslint-disable-line react-hooks/exhaustive-deps
  const egress = useMemo(() => polyline(EGRESS), []);
  const pad = useMemo(() => rectXZ(1.3, 1.3), []);

  const p: Vec3 = [0, 0, 0];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (core.current && !reducedMotion) core.current.rotation.y = t * 0.35;
    slugs.forEach((slug, i) => {
      const m = pulses.current[i];
      if (!m) return;
      // Each pulse runs its route, then continues out along the egress line.
      const u = reducedMotion ? 0.5 : (t * 0.12 + i / slugs.length) % 1;
      if (u < 0.6) pointAlong(ROUTES[slug], u / 0.6, p);
      else pointAlong(EGRESS, (u - 0.6) / 0.4, p);
      m.position.set(p[0], 0.05, p[2]);
      m.visible = !reducedMotion;
      const highlight = !selected || selected === slug;
      m.scale.setScalar(highlight ? 1 : 0.6);
    });
  });

  return (
    <group>
      {traces.map((g, i) => (
        <lineSegments key={slugs[i]} geometry={g}>
          <lineBasicMaterial
            color={selected === slugs[i] ? COLORS.accent : COLORS.edge}
            transparent
            opacity={selected && selected !== slugs[i] ? 0.35 : 0.8}
          />
        </lineSegments>
      ))}
      <lineSegments geometry={egress}>
        <lineBasicMaterial color={COLORS.edge} transparent opacity={0.5} />
      </lineSegments>

      <group position={RUNTIME}>
        <Block size={[1.0, 0.06, 1.0]} position={[0, 0.03, 0]} color={COLORS.plinth} edge={edge} />
        <lineSegments geometry={pad} material={edge} position={[0, 0.013, 0]} />
        <mesh ref={core} position={[0, 0.5, 0]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={COLORS.solidLight} roughness={0.35} flatShading />
        </mesh>
      </group>

      {slugs.map((slug, i) => (
        <mesh key={slug} ref={(m) => void (pulses.current[i] = m)}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshBasicMaterial color={COLORS.accent} />
        </mesh>
      ))}
    </group>
  );
}
