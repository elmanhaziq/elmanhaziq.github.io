// Project content is derived from the repository audit (source, READMEs,
// docs, dependency files and training summaries). Do not add claims here that
// cannot be traced back to those sources.

export type ProjectSlug = "spinevision" | "cliniq-care" | "art-museum";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: ProjectSlug;
  index: string;
  title: string;
  kind: string;
  oneLiner: string;
  problem: string;
  role: string;
  /** Technologies verified in dependency files or imports. */
  stack: string[];
  /** What the system does, as implemented. */
  built: string[];
  /** Results that can be traced to a file in the repo or report. */
  evidence: string[];
  limitations: string[];
  links: ProjectLink[];
  /** Note shown beside links when the source is not public. */
  availability?: string;
}

export const PROJECTS: Project[] = [
  {
    slug: "spinevision",
    index: "01",
    title: "SpineVision AI",
    kind: "Computer vision · Clinical decision support",
    oneLiner:
      "AI-assisted lumbar MRI grading with Grad-CAM evidence, clinician validation and a rule-based treatment layer.",
    problem:
      "Grading lumbar spinal stenosis on MRI is manual, slow and varies between clinicians. The aim was a prototype that grades axial and sagittal MRI, shows where the model looked, and keeps the clinician as the decision-maker.",
    role:
      "Final-year project, extended into V2.0. Trained and compared the classification models, built the detection and inference pipeline, the Flask application, the expert-system layer and the deployment package.",
    stack: [
      "TensorFlow / Keras",
      "ResNet50V2",
      "MobileNetV2",
      "Ultralytics YOLO",
      "Grad-CAM",
      "Flask",
      "SQLAlchemy",
      "Docker",
      "Render",
      "Hugging Face Hub",
    ],
    built: [
      "Axial pipeline: MRI input guard → YOLO ROI crop → YOLO structure overlay → ResNet50V2 Lee grade (4 classes, ordinal loss) → Grad-CAM.",
      "Sagittal pipeline: YOLO disc detection → level assignment L1-L2…L5-S1 only when exactly five discs are found → MobileNetV2 grouped Pfirrmann grade.",
      "Human-in-the-loop data model: AI predictions are write-once; clinician confirmation or correction is stored separately with a required reason.",
      "Deterministic treatment decision-support engine with safety rules first, a full rule trace and an audited accept / modify / override / decline step.",
      "Role-based access, CSRF protection, authenticated image serving and an additive, idempotent database migration from V1.1.",
    ],
    evidence: [
      "Dataset: 515 axial T2 images from 132 patients, labelled into four grades by a clinical specialist.",
      "5-fold stratified cross-validation: 74.37% mean validation accuracy (final report).",
      "Backbone comparison logged: MobileNetV2 74.9% vs DenseNet121 71.8% accuracy on the same split.",
    ],
    limitations: [
      "Small single-centre dataset; folds are image-level, so the CV figure may be optimistic.",
      "A patient-level test on a separate public dataset reached 58.8% accuracy — a clear generalisation gap.",
      "L1-L2 and L2-L3 are outside the classifier's training data and are flagged as exploratory.",
      "Research prototype. Not clinically validated and not a medical device.",
    ],
    links: [],
    availability: "Source is private. Model weights and patient data are never published.",
  },
  {
    slug: "cliniq-care",
    index: "02",
    title: "ClinIQ Care",
    kind: "LLM application · Expert system",
    oneLiner:
      "A local LLM interviews the patient; a deterministic, read-only rule base does the reasoning.",
    problem:
      "A form-based symptom checker could not handle natural language or missing information. Adding an LLM had to happen without letting the model decide a condition, invent advice or override safety checks.",
    role:
      "Designed and implemented the conversational layer, the tri-state rule engine and question planner, the safety layer, the guardrails, the clinic finder and the test suite.",
    stack: [
      "Python",
      "Flask",
      "Ollama · Qwen3 4B",
      "JSON-schema structured output",
      "OpenStreetMap Overpass",
      "Nominatim",
      "Leaflet",
      "pytest",
    ],
    built: [
      "LLM extraction constrained by a JSON schema whose symptom names are an enum of the knowledge-base vocabulary; invalid output is retried, then replaced by a keyword extractor.",
      "Tri-state patient state (true / false / unknown): an unmentioned symptom is never treated as absent.",
      "Rule engine over 22 original rules plus general observations, reporting matched, partial and excluded rules with coverage.",
      "Question planner that scores missing symptoms by rule progress, completion, red-flag value and distinguishing power.",
      "Safety layer that runs before every rule evaluation; the LLM can add a red flag but never remove one.",
      "Guardrails reject LLM sentences that claim certainty, give probabilities, name medication or mention unmatched conditions.",
    ],
    evidence: [
      "Runs fully locally; patient messages are only sent to the local Ollama endpoint.",
      "Degrades gracefully: keyword mode and the original form-based assessment remain available when the LLM is down.",
      "Automated pytest suite covering extraction, rules, planner, safety, clinic search, LLM failure and end-to-end scenarios — runs without Ollama or network.",
    ],
    limitations: [
      "Knowledge base is small and not clinically validated; output is general information only.",
      "In-memory session store suits a single-process prototype, not production.",
      "A 4B model can still misread unusual phrasing; the deterministic layers limit the impact.",
    ],
    links: [{ label: "Repository", href: "https://github.com/elmanhaziq/cliniq_care" }],
  },
  {
    slug: "art-museum",
    index: "03",
    title: "Interactive Art Museum",
    kind: "3D web · Static deployment",
    oneLiner:
      "A guided virtual exhibition for the artist Kasih Arissa, built in React Three Fiber and shipped as a static site.",
    problem:
      "Present an artist's physical and digital work as a walkable exhibition that still works on phones, with a guided tour for visitors who do not want to navigate in 3D.",
    role:
      "Built the 3D gallery, layout system, guided-tour camera, detail views and the GitHub Pages deployment. Artwork is by Kasih Arissa.",
    stack: [
      "Next.js 15",
      "TypeScript",
      "React Three Fiber",
      "Three.js",
      "Drei",
      "GSAP",
      "GitHub Actions",
      "GitHub Pages",
    ],
    built: [
      "Procedural gallery architecture with a wall-placement system that validates artwork positions.",
      "Guided tour with previous / next, keyboard arrows and touch controls, plus an index and per-artwork detail routes.",
      "Static export with a base path, deployed by a GitHub Actions workflow to GitHub Pages.",
    ],
    evidence: ["Live on GitHub Pages; 15 commits of iterative work on lighting, layout and responsive UX."],
    limitations: [
      "The artworks belong to the artist. This portfolio documents the engineering and does not reproduce the collection.",
    ],
    links: [
      { label: "Live site", href: "https://elmanhaziq.github.io/museum-website/" },
      { label: "Repository", href: "https://github.com/elmanhaziq/museum-website" },
    ],
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
