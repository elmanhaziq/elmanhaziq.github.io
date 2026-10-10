import { SITE } from "@/data/site";

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)" }}>
      <div
        className="wrap"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 16,
          paddingBlock: 28,
        }}
      >
        <span className="label">© {new Date().getFullYear()} {SITE.name}</span>
        <span className="label">Built with Next.js, React Three Fiber & SVG</span>
      </div>
    </footer>
  );
}
