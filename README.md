# Elman Haziq — portfolio

Next.js 15 (static export) · TypeScript · React Three Fiber · plain CSS modules.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
```

Stop `next dev` before running `next build`; both write to `.next/`.

- `src/data/site.ts`, `src/data/projects.ts` hold all content. Every claim is traceable to the source projects; the audit notes are kept outside the public repo.
- `src/components/hero/` holds the hero, the 3D scene (`scene/`), the project panel and the SVG fallback.
- `/?static` forces the no-WebGL fallback for testing.
