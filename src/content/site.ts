// Personal details confirmed by the owner. Nothing here is inferred.
export const profile = {
  name: "Lloyd D'Souza",
  role: 'AI/ML engineering student',
  email: 'lloyd25dsouza@gmail.com',
  github: 'https://github.com/lloydaq',
  linkedin: 'https://www.linkedin.com/in/lloyddso',
} as const;

export const tndRepo = 'https://github.com/lloydaq/TND-The-News-Detector';
export const dataSentryRepo = 'https://github.com/lloydaq/DataSentry';

export const caseStudyPath = '/work/tnd/';
export const dataSentryPath = '/work/datasentry/';

/**
 * A real screenshot of a project, captured in both of its own themes from the
 * same data and viewport (scripts/project-shots.mjs). The portfolio shows the
 * one that matches its current theme.
 */
export interface Screenshot {
  light: string;
  dark: string;
  width: number;
  height: number;
  /** Describes the interface; true of both themes. */
  alt: string;
  caption: string;
}

// Section anchors on the home page, in page order.
export const homeSections = [
  { id: 'projects', label: 'Projects' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

export interface SkillGroup {
  name: string;
  items: string[];
}

// Only tools with code to point at: TND's and DataSentry's backends, frontends
// and tests, and this portfolio's own source.
export const skills: SkillGroup[] = [
  { name: 'Languages', items: ['Python', 'JavaScript', 'TypeScript', 'HTML', 'CSS'] },
  {
    name: 'Applied AI',
    items: [
      'Local LLM inference with Ollama',
      'Structured JSON output from LLMs, validated before use',
      'Claim extraction and evidence classification with LLMs',
    ],
  },
  {
    name: 'Data and ML',
    items: [
      'pandas',
      'NumPy',
      'scikit-learn',
      'Cross-validation with preprocessing fitted inside each fold',
      'Leakage and label-quality screening',
    ],
  },
  {
    name: 'Backend',
    items: ['FastAPI', 'Pydantic', 'HTTPX', 'Uvicorn', 'Trafilatura', 'Beautiful Soup'],
  },
  { name: 'Frontend', items: ['React', 'Vite', 'Vanilla JavaScript', 'Responsive CSS'] },
  {
    name: 'Testing and tooling',
    items: ['pytest', 'Playwright', 'Vitest', 'Git', 'GitHub Actions'],
  },
];
