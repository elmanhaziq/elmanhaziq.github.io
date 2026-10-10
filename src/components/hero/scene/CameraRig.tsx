"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { type Fog, MathUtils, PerspectiveCamera, Vector3 } from "three";
import type { ProjectSlug } from "@/data/projects";
import { INTRO_START, LAYOUT, OVERVIEW } from "./layout";

interface Props {
  selected: ProjectSlug | null;
  reducedMotion: boolean;
  skipIntro: boolean;
  compact: boolean;
  onIntroDone: () => void;
}

interface Rig {
  target: Vector3;
  azimuth: number;
  polar: number;
  radius: number;
  /** Horizontal / vertical framing offset as a fraction of the viewport. */
  fx: number;
  fy: number;
}

const damp = MathUtils.damp;

/**
 * Spherical camera rig. Every frame it eases the camera towards a goal
 * framing (overview or a selected structure), adds a small pointer parallax
 * and a bounded drag rotation, and shifts the projection centre with
 * setViewOffset so the scene composes around the HTML text and panel instead
 * of hiding behind them.
 */
export function CameraRig({ selected, reducedMotion, skipIntro, compact, onIntroDone }: Props) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);

  const start = reducedMotion ? OVERVIEW : INTRO_START;
  const rig = useRef<Rig>({
    target: new Vector3(...start.target),
    azimuth: start.azimuth,
    polar: start.polar,
    radius: start.radius,
    fx: 0,
    fy: 0,
  });
  const goal = useRef<Rig>({ ...rig.current, target: new Vector3() });
  const drag = useRef({ active: false, x: 0, y: 0, az: 0, polar: 0 });
  const intro = useRef({ running: !reducedMotion, reported: false, snapNext: false });
  const tmp = useRef(new Vector3());

  // Bounded drag-to-rotate. Vertical page scrolling stays native (touch-action: pan-y).
  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      drag.current.active = true;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
    };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.active) return;
      d.az = MathUtils.clamp(d.az - (e.clientX - d.x) * 0.0045, -0.7, 0.7);
      d.polar = MathUtils.clamp(d.polar - (e.clientY - d.y) * 0.002, -0.16, 0.16);
      d.x = e.clientX;
      d.y = e.clientY;
    };
    const up = () => (drag.current.active = false);
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  // A new selection starts from a neutral drag angle.
  useEffect(() => {
    drag.current.az = 0;
    drag.current.polar = 0;
  }, [selected]);

  useEffect(() => {
    if (skipIntro && intro.current.running) {
      intro.current.running = false;
      intro.current.snapNext = true;
    }
  }, [skipIntro]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 20);
    const g = goal.current;
    const r = rig.current;

    // ── Goal framing ──────────────────────────────────────────────────
    // Narrower viewports pull the camera back so the composition still fits.
    const aspect = size.width / Math.max(size.height, 1);
    if (selected) {
      const s = LAYOUT[selected];
      g.target.set(s.position[0], s.view.lift, s.position[2]);
      g.azimuth = s.view.azimuth;
      g.polar = s.view.polar;
      g.radius = s.view.radius * MathUtils.clamp(1.3 / aspect, 1, 1.8) * (compact ? 1.2 : 1);
      g.fx = compact ? 0 : -0.22;
      g.fy = compact ? 0.34 : 0;
    } else {
      g.target.set(...OVERVIEW.target);
      g.azimuth = OVERVIEW.azimuth;
      g.polar = OVERVIEW.polar;
      g.radius = OVERVIEW.radius * (compact ? MathUtils.clamp(1.2 / aspect, 0.9, 1.55) : MathUtils.clamp(1.8 / aspect, 1, 2));
      g.fx = compact ? 0 : 0.44;
      g.fy = compact ? -0.08 : 0;
    }

    // Pointer parallax and drag are layered on top of the goal.
    const parallax = reducedMotion ? 0 : 1;
    const az = g.azimuth + drag.current.az + state.pointer.x * 0.06 * parallax;
    const polar = MathUtils.clamp(
      g.polar + drag.current.polar - state.pointer.y * 0.03 * parallax,
      0.2,
      1.42,
    );

    // ── Ease ──────────────────────────────────────────────────────────
    const snap = reducedMotion || intro.current.snapNext;
    intro.current.snapNext = false;
    const lambda = intro.current.running ? 1.35 : 2.6;
    if (snap) {
      r.target.copy(g.target);
      r.azimuth = az;
      r.polar = polar;
      r.radius = g.radius;
      r.fx = g.fx;
      r.fy = g.fy;
    } else {
      r.target.x = damp(r.target.x, g.target.x, lambda, dt);
      r.target.y = damp(r.target.y, g.target.y, lambda, dt);
      r.target.z = damp(r.target.z, g.target.z, lambda, dt);
      r.azimuth = damp(r.azimuth, az, lambda, dt);
      r.polar = damp(r.polar, polar, lambda, dt);
      r.radius = damp(r.radius, g.radius, lambda, dt);
      r.fx = damp(r.fx, g.fx, lambda, dt);
      r.fy = damp(r.fy, g.fy, lambda, dt);
    }

    if (intro.current.running && Math.abs(r.radius - g.radius) < 0.25) {
      intro.current.running = false;
    }
    if (!intro.current.running && !intro.current.reported) {
      intro.current.reported = true;
      onIntroDone();
    }

    // ── Apply ─────────────────────────────────────────────────────────
    const sinP = Math.sin(r.polar);
    tmp.current.set(
      r.target.x + r.radius * sinP * Math.sin(r.azimuth),
      r.target.y + r.radius * Math.cos(r.polar),
      r.target.z + r.radius * sinP * Math.cos(r.azimuth),
    );
    camera.position.copy(tmp.current);
    camera.lookAt(r.target);

    // Fog follows the camera distance so depth cueing is consistent at any zoom.
    const fog = state.scene.fog as Fog | null;
    if (fog) {
      fog.near = r.radius * 1.0;
      fog.far = r.radius * 2.6;
    }

    const w = size.width;
    const h = size.height;
    const fullW = w * (1 + Math.abs(r.fx));
    const fullH = h * (1 + Math.abs(r.fy));
    if (Math.abs(r.fx) < 1e-3 && Math.abs(r.fy) < 1e-3) {
      if (camera.view?.enabled) camera.clearViewOffset();
      camera.aspect = w / h;
    } else {
      // fx > 0 shows the left part of a wider frame, so the scene sits right.
      const x = r.fx > 0 ? 0 : fullW - w;
      // fy > 0 shows the lower part of a taller frame, so the scene sits higher.
      const y = r.fy > 0 ? fullH - h : 0;
      camera.aspect = fullW / fullH;
      camera.setViewOffset(fullW, fullH, x, y, w, h);
    }
    camera.updateProjectionMatrix();
  });

  return null;
}
