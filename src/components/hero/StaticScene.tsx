import type { ProjectSlug } from "@/data/projects";

/**
 * Line-drawing stand-in for the 3D scene when WebGL is unavailable or the
 * scene fails. Same three structures, same runtime node, drawn in isometric
 * SVG. The project index and panel work identically on top of it.
 */
export function StaticScene({ selected }: { selected: ProjectSlug | null }) {
  const stroke = (slug: ProjectSlug) =>
    selected === slug ? "var(--accent)" : selected ? "rgba(169,176,191,0.3)" : "rgba(169,176,191,0.6)";

  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMaxYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "var(--graphite)" }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="iso" width="40" height="23.1" patternUnits="userSpaceOnUse" patternTransform="translate(0 0)">
          <path d="M0 11.55 L20 0 L40 11.55 L20 23.1 Z" fill="none" stroke="rgba(169,176,191,0.07)" />
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#iso)" />
      <g transform="translate(200 40)" fill="none" strokeWidth="1.2">
        {/* Spine column */}
        <g stroke={stroke("spinevision")}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M${300 - 40} ${330 - i * 34} l40 -18 l40 18 l-40 18 z m0 0 v12 l40 18 l40 -18 v-12`}
            />
          ))}
        </g>
        {/* Rule lattice */}
        <g stroke={stroke("cliniq-care")}>
          {Array.from({ length: 24 }, (_, i) => {
            const c = i % 6;
            const r = Math.floor(i / 6);
            return <rect key={i} x={420 + c * 22} y={150 + r * 22 + c * 6} width="12" height="12" />;
          })}
          <path d="M400 150 v120 l150 40 v-120 z" />
        </g>
        {/* Gallery room */}
        <g stroke={stroke("art-museum")}>
          <path d="M440 420 l90 -50 l90 50 l-90 50 z" />
          <path d="M440 420 v-60 l90 -50 v60 M530 310 l90 50 v60" />
          <path d="M470 380 v-24 l26 -14 v24 z M560 342 l26 14 v24 l-26 -14 z" />
        </g>
        {/* Runtime + bus */}
        <g stroke="rgba(140,203,255,0.7)">
          <path d="M300 380 L380 470 L520 470 M480 270 L420 470" strokeDasharray="3 5" />
          <path d="M405 470 l15 -8 l15 8 l-15 8 z" />
        </g>
      </g>
    </svg>
  );
}
