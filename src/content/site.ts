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
export const flowCastRepo = 'https://github.com/lloydaq/flowcast';
export const campusSignalRepo = 'https://github.com/lloydaq/CampusSignal-pro';

export const caseStudyPath = '/work/tnd/';
export const dataSentryPath = '/work/datasentry/';
export const flowCastPath = '/work/flowcast/';
export const campusSignalPath = '/work/campussignal/';

export type ProjectId = 'tnd' | 'datasentry' | 'flowcast' | 'campussignal';

/**
 * The four projects in reading order. Kept here (not imported from each project's
 * content file) so a case study can link to the next one without bundling its content.
 * Taglines must match the content files; content.test.ts checks that.
 */
export const projectOrder: readonly { id: ProjectId; name: string; tagline: string; path: string }[] = [
  { id: 'tnd', name: 'Trustworthy News Detector', tagline: 'Checks the claims in a news article against evidence it retrieves', path: caseStudyPath },
  { id: 'datasentry', name: 'DataSentry', tagline: 'Dataset diagnostics for machine learning', path: dataSentryPath },
  { id: 'flowcast', name: 'FlowCast', tagline: 'Traffic speed forecasting for Los Angeles highways', path: flowCastPath },
  { id: 'campussignal', name: 'CampusSignal', tagline: 'One platform for many colleges', path: campusSignalPath },
];

/** The project after `id`, wrapping from the last back to the first. */
export function nextProject(id: ProjectId) {
  const i = projectOrder.findIndex((p) => p.id === id);
  return projectOrder[(i + 1) % projectOrder.length]!;
}

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
  { id: 'resume', label: 'Résumé' },
  { id: 'contact', label: 'Contact' },
] as const;

export interface SkillGroup {
  name: string;
  items: string[];
}

// Only tools with code to point at: the backends, frontends and tests of TND,
// DataSentry, FlowCast and CampusSignal, and this portfolio's own source.
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
      'LightGBM',
      'PyTorch',
      'Graph neural networks for forecasting (DCRNN)',
      'Day-block bootstrap for comparing models',
    ],
  },
  {
    name: 'Backend',
    items: [
      'FastAPI',
      'Pydantic',
      'HTTPX',
      'Uvicorn',
      'Trafilatura',
      'Beautiful Soup',
      'PostgreSQL',
      'SQLAlchemy',
      'Alembic',
      'Multi-tenant isolation and server-side sessions',
    ],
  },
  {
    name: 'Frontend',
    items: ['React', 'Vite', 'TanStack Query', 'React Router', 'Tailwind CSS', 'Leaflet', 'Vanilla JavaScript', 'Responsive CSS'],
  },
  {
    name: 'Testing and tooling',
    items: ['pytest', 'Playwright', 'Vitest', 'axe accessibility checks', 'Ruff', 'Git', 'GitHub Actions'],
  },
];
