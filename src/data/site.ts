// Single source for personal details. Every value here must be supplied or
// verified — leave a field null rather than inventing it.

export const SITE = {
  name: "Elman Haziq",
  positioning: "AI Engineer & Systems Builder",
  headline: ["I build intelligent systems.", "Then I make them work in the real world."],
  summary:
    "AI/ML engineering, application development, and infrastructure — from experimentation to deployment.",
  status: {
    role: "AI Engineer",
    organisation: "Advanced Interventional Pain",
    location: "Shah Alam",
  },
  education: {
    // Verified from the CSP650 F6 submission form.
    degree: "Bachelor of Information Systems (Hons.) Intelligent Systems Engineering",
    code: "CDCS259",
    faculty: "Faculty of Computer and Mathematical Sciences",
    institution: "Universiti Teknologi MARA (UiTM)",
  },
  links: {
    github: "https://github.com/elmanhaziq",
    // Not supplied yet — rendered only once filled in.
    email: null as string | null,
    linkedin: null as string | null,
    resume: null as string | null,
  },
} as const;
