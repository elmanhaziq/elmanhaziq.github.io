"use client";

import { Grid, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { PROJECTS, type ProjectSlug } from "@/data/projects";
import { CameraRig } from "./scene/CameraRig";
import { COLORS, LAYOUT, RUNTIME } from "./scene/layout";
import { Interactive, LabelProjector, useEdgeMaterial, type Emphasis, type LabelAnchor } from "./scene/primitives";
import { Runtime } from "./scene/Runtime";
import { GalleryRoom, RuleLattice, SpineColumn } from "./scene/Structures";

interface Props {
  selected: ProjectSlug | null;
  onSelect: (slug: ProjectSlug | null) => void;
  reducedMotion: boolean;
  skipIntro: boolean;
  onIntroDone: () => void;
  compact: boolean;
  active: boolean;
}

const STRUCTURES = {
  spinevision: { Component: SpineColumn, hit: [2.4, 2.9, 1.9], labelHeight: 3.05 },
  "cliniq-care": { Component: RuleLattice, hit: [3.2, 2.4, 2.8], labelHeight: 2.6 },
  "art-museum": { Component: GalleryRoom, hit: [3.0, 1.5, 2.6], labelHeight: 1.85 },
} as const;

const SLUGS = Object.keys(STRUCTURES) as ProjectSlug[];

function emphasisFor(slug: ProjectSlug, selected: ProjectSlug | null, hovered: ProjectSlug | null): Emphasis {
  if (selected === slug || (!selected && hovered === slug)) return "active";
  return selected ? "dim" : "idle";
}

function Structure({
  slug,
  emphasis,
  setHovered,
  onSelect,
  reducedMotion,
}: {
  slug: ProjectSlug;
  emphasis: Emphasis;
  setHovered: (s: ProjectSlug | null) => void;
  onSelect: (s: ProjectSlug) => void;
  reducedMotion: boolean;
}) {
  const edge = useEdgeMaterial(emphasis, reducedMotion);
  const { Component, hit } = STRUCTURES[slug];
  return (
    <Interactive
      slug={slug}
      position={LAYOUT[slug].position}
      hitSize={[...hit]}
      onHover={setHovered}
      onSelect={onSelect}
    >
      <Component edge={edge} emphasis={emphasis} reducedMotion={reducedMotion} />
    </Interactive>
  );
}

export default function HeroCanvas({
  selected,
  onSelect,
  reducedMotion,
  skipIntro,
  onIntroDone,
  compact,
  active,
}: Props) {
  const [hovered, setHovered] = useState<ProjectSlug | null>(null);
  const [dpr, setDpr] = useState(1.5);
  const labelNodes = useRef(new Map<string, HTMLElement>());

  useEffect(() => setDpr(Math.min(window.devicePixelRatio || 1, compact ? 2 : 1.75)), [compact]);
  useEffect(() => () => void (document.body.style.cursor = ""), []);

  const anchors: LabelAnchor[] = useMemo(
    () => [
      ...SLUGS.map((slug) => {
        const p = PROJECTS.find((x) => x.slug === slug)!;
        const [x, , z] = LAYOUT[slug].position;
        return {
          id: slug,
          text: `${p.index}  ${p.title}`,
          position: [x, STRUCTURES[slug].labelHeight, z] as [number, number, number],
          emphasis: emphasisFor(slug, selected, hovered),
        };
      }),
      {
        id: "runtime",
        text: "Runtime",
        position: [RUNTIME[0], 1.0, RUNTIME[2]] as [number, number, number],
        emphasis: (selected ? "dim" : "idle") as Emphasis,
      },
    ],
    [selected, hovered],
  );

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        dpr={dpr}
        frameloop={active ? "always" : "never"}
        camera={{ fov: 32, near: 0.1, far: 90, position: [0, 20, 20] }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        onPointerMissed={(e) => {
          // A tap on empty space returns to the overview.
          if (e.type === "click" && selected) onSelect(null);
        }}
        aria-hidden="true"
      >
        <color attach="background" args={[COLORS.bg]} />
        <fog attach="fog" args={[COLORS.bg, 16, 38]} />

        {/* Drop resolution on slow devices instead of dropping frames. */}
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(window.devicePixelRatio || 1, 1.75))}
        />

        <hemisphereLight args={["#cfd6e6", "#121318", 0.7]} />
        <directionalLight position={[6, 10, 6]} intensity={1.6} />
        <directionalLight position={[-8, 5, -6]} intensity={0.5} color="#9fb4d6" />

        <Grid
          args={[60, 60]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#23272f"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#2f3541"
          fadeDistance={34}
          fadeStrength={1.6}
          infiniteGrid
        />

        {SLUGS.map((slug) => (
          <Structure
            key={slug}
            slug={slug}
            emphasis={emphasisFor(slug, selected, hovered)}
            setHovered={setHovered}
            onSelect={onSelect}
            reducedMotion={reducedMotion}
          />
        ))}
        <Runtime selected={selected} reducedMotion={reducedMotion} />

        <CameraRig
          selected={selected}
          reducedMotion={reducedMotion}
          skipIntro={skipIntro}
          compact={compact}
          onIntroDone={onIntroDone}
        />
        <LabelProjector anchors={anchors} nodes={labelNodes} />
      </Canvas>

      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {anchors.map((a) => (
          <span
            key={a.id}
            ref={(el) => {
              if (el) labelNodes.current.set(a.id, el);
              else labelNodes.current.delete(a.id);
            }}
            className="scene-label"
            data-emphasis={a.emphasis}
            style={{ position: "absolute", left: 0, top: 0, visibility: "hidden" }}
          >
            {a.text}
          </span>
        ))}
      </div>
    </div>
  );
}
