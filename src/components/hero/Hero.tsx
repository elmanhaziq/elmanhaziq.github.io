"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { PROJECTS, type ProjectSlug } from "@/data/projects";
import { SITE } from "@/data/site";
import { detectWebGL, useMediaQuery, useReducedMotion } from "@/lib/client";
import { ProjectPanel } from "./ProjectPanel";
import { StaticScene } from "./StaticScene";
import styles from "./Hero.module.css";

// The 3D scene is client-only and loaded after first paint so the headline
// never waits on three.js.
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false, loading: () => null });

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type GLState = "pending" | "ok" | "unavailable";

export function Hero() {
  const [selected, setSelected] = useState<ProjectSlug | null>(null);
  const [gl, setGl] = useState<GLState>("pending");
  const [introDone, setIntroDone] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);
  const [active, setActive] = useState(true);
  const reducedMotion = useReducedMotion();
  const compact = useMediaQuery("(max-width: 820px)");
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // "?static" forces the no-WebGL fallback for testing.
  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).has("static");
    setGl(!forced && detectWebGL() ? "ok" : "unavailable");
  }, []);

  // Stop rendering the scene while the hero is off-screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "80px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = useCallback(
    (slug: ProjectSlug | null) => {
      if (slug && document.activeElement instanceof HTMLElement) {
        triggerRef.current = document.activeElement;
      }
      // On phones the index sits below the scene; bring the scene back into
      // view above the bottom sheet so the camera move is visible.
      if (slug && compact && gl === "ok" && sectionRef.current) {
        const top = sectionRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
      }
      setSelected(slug);
    },
    [compact, gl, reducedMotion],
  );

  const close = useCallback(() => {
    setSelected(null);
    // Return focus to whatever opened the panel.
    requestAnimationFrame(() => triggerRef.current?.focus?.());
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setSelected((cur) => {
        const i = PROJECTS.findIndex((p) => p.slug === cur);
        const next = (i + dir + PROJECTS.length) % PROJECTS.length;
        return PROJECTS[next].slug;
      });
    },
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.key === "Escape") close();
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, close, step]);

  const project = PROJECTS.find((p) => p.slug === selected) ?? null;
  const showIntroSkip = gl === "ok" && !introDone && !skipIntro && !reducedMotion;
  const fallback = <StaticScene selected={selected} />;

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      aria-labelledby="hero-title"
      data-selected={selected ? "true" : "false"}
    >
      <div className={styles.stage}>
        {gl === "ok" ? (
          <SceneBoundary fallback={fallback}>
            <HeroCanvas
              selected={selected}
              onSelect={select}
              reducedMotion={reducedMotion}
              skipIntro={skipIntro}
              onIntroDone={() => setIntroDone(true)}
              compact={compact}
              active={active}
            />
          </SceneBoundary>
        ) : gl === "unavailable" ? (
          fallback
        ) : null}
        <div className={styles.scrim} aria-hidden="true" />
      </div>

      <div className={`wrap ${styles.content}`}>
        <div className={styles.copy}>
          <p className={`label ${styles.status}`}>
            <span className={styles.statusDot} aria-hidden="true" />
            {SITE.status.role} · {SITE.status.organisation}, {SITE.status.location}
          </p>
          <h1 id="hero-title" className={`display ${styles.title}`}>
            <span className={styles.line}>{SITE.headline[0]}</span>{" "}
            <span className={`${styles.line} ${styles.lineMuted}`}>{SITE.headline[1]}</span>
          </h1>
          <p className={`lede ${styles.lede}`}>{SITE.summary}</p>
          <div className={styles.actions}>
            <a className="btn btn--primary" href="#work">
              Explore projects <span className="arrow" aria-hidden="true">→</span>
            </a>
            <a className="btn" href="#about">
              About me
            </a>
          </div>
        </div>

        <nav className={styles.index} aria-label="Project index">
          <p className="label">
            Index{gl === "ok" ? " — select a structure" : ""}
          </p>
          <ol>
            {PROJECTS.map((p) => (
              <li key={p.slug}>
                <button
                  type="button"
                  className={styles.indexItem}
                  aria-pressed={selected === p.slug}
                  onClick={() => (selected === p.slug ? close() : select(p.slug))}
                >
                  <span className={styles.indexNum}>{p.index}</span>
                  <span className={styles.indexTitle}>{p.title}</span>
                  <span className={styles.indexKind}>{p.kind}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <ProjectPanel project={project} onClose={close} onStep={step} />

      {showIntroSkip && (
        <button type="button" className={`label ${styles.skip}`} onClick={() => setSkipIntro(true)}>
          Skip intro
        </button>
      )}

      <p className="sr-only" aria-live="polite">
        {project ? `${project.title} selected. Details panel opened.` : ""}
      </p>
    </section>
  );
}
