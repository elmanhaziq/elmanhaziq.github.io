"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import styles from "./ProjectPanel.module.css";

interface Props {
  project: Project | null;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}

export function ProjectPanel({ project, onClose, onStep }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Keep the last project rendered while the panel animates out.
  const [shown, setShown] = useState<Project | null>(project);
  useEffect(() => {
    if (project) setShown(project);
  }, [project]);

  useEffect(() => {
    if (project) headingRef.current?.focus({ preventScroll: true });
  }, [project]);

  const p = project ?? shown;
  const open = Boolean(project);

  return (
    <aside
      className={styles.panel}
      data-open={open}
      aria-hidden={!open}
      inert={!open}
      aria-labelledby="panel-title"
    >
      {p && (
        <div className={styles.inner} key={p.slug}>
          <div className={styles.top}>
            <p className="label label--accent">
              {p.index} / 03 — {p.kind}
            </p>
            <button type="button" className={styles.close} onClick={onClose}>
              <span className="sr-only">Close project details</span>
              <span aria-hidden="true" className={styles.x} />
            </button>
          </div>

          <h2 id="panel-title" ref={headingRef} tabIndex={-1} className={`h2 ${styles.title}`}>
            {p.title}
          </h2>
          <p className={styles.oneLiner}>{p.oneLiner}</p>

          <dl className={styles.meta}>
            <div>
              <dt className="label">Problem</dt>
              <dd>{p.problem}</dd>
            </div>
            <div>
              <dt className="label">Stack (verified in source)</dt>
              <dd className={styles.stack}>{p.stack.join("  /  ")}</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <Link className="btn btn--primary" href={`/work/${p.slug}/`}>
              Read case study <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <Link className="btn" href={`/work/${p.slug}/#architecture`}>
              Explore architecture
            </Link>
          </div>

          <div className={styles.foot}>
            {p.links.length > 0 ? (
              <ul className={styles.links}>
                {p.links.map((l) => (
                  <li key={l.href}>
                    <a className="text-link" href={l.href} target="_blank" rel="noreferrer">
                      {l.label} <span aria-hidden="true">↗</span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.note}>{p.availability}</p>
            )}
            <div className={styles.stepper}>
              <button type="button" onClick={() => onStep(-1)} className={styles.stepBtn}>
                <span aria-hidden="true">←</span>
                <span className="sr-only">Previous project</span>
              </button>
              <button type="button" onClick={() => onStep(1)} className={styles.stepBtn}>
                <span aria-hidden="true">→</span>
                <span className="sr-only">Next project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
