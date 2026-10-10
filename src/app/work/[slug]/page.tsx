import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, PROJECTS } from "@/data/projects";
import styles from "./case.module.css";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return p ? { title: p.title, description: p.oneLiner } : {};
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const i = PROJECTS.indexOf(p);
  const next = PROJECTS[(i + 1) % PROJECTS.length];

  return (
    <article className={styles.page}>
      <header className={`wrap ${styles.head}`}>
        <Link href="/#work" className={`label ${styles.back}`}>
          ← All work
        </Link>
        <p className="label label--accent">
          {p.index} — {p.kind}
        </p>
        <h1 className="display">{p.title}</h1>
        <p className="lede">{p.oneLiner}</p>
        <nav aria-label="Case study sections" className={styles.tabs}>
          <a href="#experience">Experience</a>
          <a href="#architecture">Architecture</a>
          <a href="#notes">Engineering notes</a>
        </nav>
      </header>

      <section id="experience" className="section" aria-labelledby="exp-title">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Experience</p>
            <h2 id="exp-title" className="h2">
              Interactive demonstration
            </h2>
          </div>
          <div className={styles.pending}>
            <p className="label">In development — next milestone</p>
            <p className="body">
              A browser-side demonstration of this project is being built. It will be clearly labelled when it is a
              simulation rather than the original model or service.
            </p>
          </div>
        </div>
      </section>

      <section id="architecture" className="section" aria-labelledby="arch-title">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Architecture</p>
            <h2 id="arch-title" className="h2">
              How the system works
            </h2>
          </div>
          <ol className={styles.pipeline}>
            {p.built.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ol>
          <p className={`label ${styles.archNote}`}>Interactive component diagram — next milestone</p>
        </div>
      </section>

      <section id="notes" className="section" aria-labelledby="notes-title">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Engineering notes</p>
            <h2 id="notes-title" className="h2">
              Decisions, evidence and limits
            </h2>
          </div>
          <dl className={styles.notes}>
            <div>
              <dt className="label">Problem</dt>
              <dd>{p.problem}</dd>
            </div>
            <div>
              <dt className="label">My role</dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt className="label">Evidence</dt>
              <dd>
                <ul>
                  {p.evidence.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="label">Limitations</dt>
              <dd>
                <ul>
                  {p.limitations.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="label">Stack</dt>
              <dd className={styles.mono}>{p.stack.join("  /  ")}</dd>
            </div>
            <div>
              <dt className="label">Links</dt>
              <dd>
                {p.links.length ? (
                  <ul className={styles.links}>
                    {p.links.map((l) => (
                      <li key={l.href}>
                        <a className="text-link" href={l.href} target="_blank" rel="noreferrer">
                          {l.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  p.availability
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <nav className="section" aria-label="Next project">
        <div className="wrap">
          <Link href={`/work/${next.slug}/`} className={styles.next}>
            <span className="label">Next project</span>
            <span className="h2">{next.title} →</span>
          </Link>
        </div>
      </nav>
    </article>
  );
}
