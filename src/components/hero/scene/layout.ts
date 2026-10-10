import type { ProjectSlug } from "@/data/projects";

export const COLORS = {
  bg: "#17191F",
  plinth: "#1e2129",
  solid: "#2b303b",
  solidLight: "#3a404d",
  edge: "#5d6575",
  edgeDim: "#3a404c",
  accent: "#8CCBFF",
  white: "#F5F5F2",
} as const;

type Vec3 = [number, number, number];

export interface StructureLayout {
  position: Vec3;
  /** Camera framing when this structure is selected. */
  view: { azimuth: number; polar: number; radius: number; lift: number };
}

// Three structures on a shared floor, each connected by a floor "bus" to the
// runtime node in front — every system ends in something that runs.
export const LAYOUT: Record<ProjectSlug, StructureLayout> = {
  spinevision: {
    position: [-3.1, 0, 0.2],
    view: { azimuth: 0.35, polar: 1.18, radius: 8.8, lift: 1.3 },
  },
  "cliniq-care": {
    position: [0.2, 0, -2.6],
    view: { azimuth: 0.62, polar: 1.12, radius: 9.6, lift: 1.0 },
  },
  "art-museum": {
    position: [3.2, 0, 0.6],
    view: { azimuth: 0.62, polar: 1.02, radius: 8.6, lift: 0.6 },
  },
};

export const RUNTIME: Vec3 = [0.1, 0, 2.6];

export const OVERVIEW = {
  target: [0.2, -0.3, -0.2] as Vec3,
  azimuth: 0.58,
  polar: 1.04,
  radius: 17,
};

export const INTRO_START = {
  target: [0, 0, 0] as Vec3,
  azimuth: 0.05,
  polar: 0.28,
  radius: 32,
};
