import Link from "next/link";
import { PROJECTS } from "@/data/projects";
import { SITE } from "@/data/site";
import styles from "./Sections.module.css";

/* ─── Lifecycle: the technical focus, each stage tied to evidence ────── */
const LIFECYCLE = [
  {
    stage: "Understand",
    text: "Start from the workflow the system has to fit, and audit what already exists before changing it.",
    evidence: "SpineVision V2.0 began with a written audit of V1.1 that logged 15 defects before any redesign.",
  },
  {
    stage: "Model",
    text: "Train, compare and explain models — and use language models only where their output can be checked.",
    evidence: "ResNet50V2 with an ordinal loss and Grad-CAM; YOLO detectors; Qwen3 constrained by a JSON schema.",
  },
  {
    stage: "Build",
    text: "Wrap the model in software with deterministic safety layers, human validation and tests.",
    evidence: "Write-once AI fields with clinician review; tri-state rule engine and guardrails covered by pytest.",
  },
  {
    stage: "Deploy",
    text: "Package it, configure it through the environment, and get it running somewhere real.",
    evidence: "Docker + Render with models pulled from a private Hugging Face repo; GitHub Actions to GitHub Pages.",
  },
];

export function Lifecycle() {
  return (
    <section className="section" aria-labelledby="focus-title">
      <div className="wrap">
        <div className="section-head">
          <p className="label">Technical focus</p>
          <h2 id="focus-title" className="h2">
            The whole lifecycle of an intelligent product — not just the model in the middle.
          </h2>
        </div>
        <ol className={styles.lifecycle}>
          {LIFECYCLE.map((s, i) => (
            <li key={s.stage} className={styles.stage}>
              <span className="label">0{i + 1}</span>
              <h3 className="h3">{s.stage}</h3>
              <p className={styles.stageText}>{s.text}</p>
              <p className={styles.evidence}>
                <span className="label label--accent">Evidence</span>
                {s.evidence}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─── Selected work ──────────────────────────────────────────────────── */
export function Work() {
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="wrap">
        <div className="section-head">
          <p className="label">Selected work</p>
          <h2 id="work-title" className="h2">
            Three systems, each taken from idea to something that runs.
          </h2>
        </div>
        <ul className={styles.workList}>
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <Link href={`/work/${p.slug}/`} className={styles.workRow}>
                <span className={`label ${styles.workIndex}`}>{p.index}</span>
                <span className={styles.workMain}>
                  <span className={styles.workTitle}>{p.title}</span>
                  <span className={styles.workKind}>{p.kind}</span>
                </span>
                <span className={styles.workLine}>{p.oneLiner}</span>
                <span className={styles.workStack}>{p.stack.slice(0, 4).join(" / ")}</span>
                <span className={styles.workArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── Systems & deployment ───────────────────────────────────────────── */
const DEPLOYMENTS = [
  {
    project: "SpineVision AI",
    title: "Containerised ML service",
    steps: [
      "Docker image on python:3.11-slim",
      "OpenCV pinned to the headless build",
      "Weights pulled from a private Hugging Face repo at start-up",
      "Gunicorn · 1 worker · 2 threads · 180 s timeout",
      "Render web service with a /health check",
      "Secrets and admin seed via environment variables",
    ],
    note: "Weights, database and uploads are excluded from Git.",
  },
  {
    project: "ClinIQ Care",
    title: "Local-first LLM application",
    steps: [
      "Flask app talks to Ollama on localhost",
      "Startup health check for model availability",
      "Keyword fallback and form-based mode when the LLM is down",
      "OSM requests cached; Nominatim limited to 1 req/s",
      "Location rounded to ~110 m before leaving the browser",
      "Config and credentials only from .env",
    ],
    note: "No patient data written to disk; sessions expire.",
  },
  {
    project: "Interactive Art Museum",
    title: "Static 3D site with CI deploys",
    steps: [
      "Push to main triggers GitHub Actions",
      "pnpm install --frozen-lockfile",
      "next build → static export with base path",
      "Upload Pages artifact",
      "Deploy to GitHub Pages",
    ],
    note: "No server to maintain; every change is reproducible.",
  },
];

export function Systems() {
  return (
    <section id="systems" className="section" aria-labelledby="systems-title">
      <div className="wrap">
        <div className="section-head">
          <p className="label">Systems & deployment</p>
          <h2 id="systems-title" className="h2">
            A model is only useful once it runs somewhere — reliably, and without leaking anything.
          </h2>
        </div>
        <div className={styles.systems}>
          {DEPLOYMENTS.map((d) => (
            <article key={d.project} className={styles.system}>
              <p className="label">{d.project}</p>
              <h3 className="h3">{d.title}</h3>
              <ol className={styles.flow}>
                {d.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className={styles.systemNote}>{d.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About ──────────────────────────────────────────────────────────── */
export function About() {
  const e = SITE.education;
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap">
        <div className="section-head">
          <p className="label">About</p>
          <h2 id="about-title" className="h2">
            An engineer who treats the model as one component of a system.
          </h2>
        </div>
        <div className={styles.about}>
          <div className={styles.aboutText}>
            <p className="lede">
              I&rsquo;m {SITE.name}, an {SITE.status.role} at {SITE.status.organisation} in{" "}
              {SITE.status.location}. My work spans computer vision, LLM applications and expert systems, and
              the software and infrastructure that put them in front of real users.
            </p>
            <p className="body">
              Across my projects the same approach repeats: probabilistic models are surrounded by deterministic
              layers I can test, people keep the final decision, and the system keeps working when a component
              fails. I would rather report a limitation than an unverified number.
            </p>
          </div>
          <dl className={styles.facts}>
            <div>
              <dt className="label">Current role</dt>
              <dd>
                {SITE.status.role}
                <br />
                <span>
                  {SITE.status.organisation}, {SITE.status.location}
                </span>
              </dd>
            </div>
            <div>
              <dt className="label">Education</dt>
              <dd>
                {e.degree}
                <br />
                <span>
                  {e.institution} · {e.code}
                </span>
              </dd>
            </div>
            <div>
              <dt className="label">Focus</dt>
              <dd>
                Computer vision · LLM applications · Expert systems · Web applications · Deployment
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ─── Contact ────────────────────────────────────────────────────────── */
export function Contact() {
  const { github, email, linkedin, resume } = SITE.links;
  const links = [
    email && { label: "Email", href: `mailto:${email}`, value: email },
    github && { label: "GitHub", href: github, value: github.replace("https://", "") },
    linkedin && { label: "LinkedIn", href: linkedin, value: linkedin.replace("https://www.", "") },
    resume && { label: "Résumé", href: resume, value: "Download PDF" },
  ].filter(Boolean) as { label: string; href: string; value: string }[];

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="wrap">
        <div className="section-head">
          <p className="label">Contact</p>
          <h2 id="contact-title" className="h2">
            Have a system that needs to work in the real world?
          </h2>
        </div>
        <ul className={styles.contact}>
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className={styles.contactRow}
                {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <span className="label">{l.label}</span>
                <span className={styles.contactValue}>{l.value}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
