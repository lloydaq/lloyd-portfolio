// Résumé content. Personal details (education, grades, hackathons, the certificate and
// AIvibeX) were supplied by the owner on 2026-11-13, from his résumé and NPTEL
// certificate. Hackathon finals (both reached the offline final
// round) and the AIvibeX figures (40 teams, 118 participants; technical and media team)
// were supplied on 2026-11-22. Project lines restate facts already verified in the project content
// files; keep them in step. No phone number or street address: the site is public.

export const RESUME_PDF = '/lloyd-dsouza-resume.pdf';
export const RESUME_PAGE = '/resume/';

export const resume = {
  headline: 'AI & ML engineer (student)',
  location: 'Karkala, Karnataka, India',
} as const;

export interface Education {
  title: string;
  school: string;
  detail: string;
}

export const education: Education[] = [
  {
    title: 'Bachelor of Engineering (BE) in Artificial Intelligence and Machine Learning',
    school: 'Mangalore Institute of Technology and Engineering (MITE)',
    detail: 'CGPA 8.43 · expected graduation 2028',
  },
  { title: 'Pre-University Course (Science)', school: 'Christ King PU College', detail: '86%' },
  { title: 'SSLC (Class 10)', school: 'Christ King English Medium School', detail: '85%' },
];

export interface Entry {
  title: string;
  /** Event, issuer or organisation. */
  context: string;
  /** What the role or project was. */
  role?: string;
  points: string[];
}

export const hackathons: Entry[] = [
  {
    title: 'JalSetu-Lite',
    context: 'Build for Billions Hackathon, NITK · Finalist, offline final round',
    points: [
      'Built backend APIs, with teammates, for order verification, delivery validation and disputes.',
      'Implemented OTP verification and server-side validation logic.',
    ],
  },
  {
    title: 'FocusCut',
    context: 'Tech Fusion 2.0 · Finalist, offline final round',
    points: [
      'Built the timelines and progress tracking for an app turning YouTube videos into summaries and flashcards.',
    ],
  },
];

export const leadership: Entry[] = [
  {
    title: 'AIvibeX',
    context: 'Mangalore Institute of Technology and Engineering',
    role: '5-hour AI hackathon: 40 teams, 118 participants',
    points: ['Technical and media team: posters and participant certificates.'],
  },
];

export interface Certification {
  name: string;
  issuer: string;
  when: string;
  detail?: string;
  /** Public pages where anyone can check the credential, one per badge. */
  verify?: { label: string; url: string }[];
}

export const certifications: Certification[] = [
  {
    name: 'Foundations of Virtual Reality',
    issuer: 'NPTEL, IIT Madras',
    when: 'Jul–Oct 2026, 12-week course',
    detail: 'Elite certificate',
  },
];

export interface ResumeProject {
  id: 'tnd' | 'datasentry' | 'flowcast' | 'campussignal' | 'inkshift';
  name: string;
  stack: string;
  status: string;
  points: string[];
}

// Shorter than the project pages, for one printed page. Every figure is in the
// project content files (tnd.ts, datasentry.ts, flowcast.ts, campussignal.ts).
export const resumeProjects: ResumeProject[] = [
  {
    id: 'tnd',
    name: 'Trustworthy News Detector (TND)',
    stack: 'Python, FastAPI, Pydantic, Ollama, Trafilatura, HTTPX; HTML, CSS, JavaScript',
    status: 'github.com/lloydaq/TND-The-News-Detector',
    points: [
      'Built a fact-checker: a local LLM pulls up to 5 claims per article and checks each against GNews and GDELT.',
      'Designed a deterministic 0–100 risk score; failed runs are marked DEGRADED; 159 pytest tests, Playwright CI.',
    ],
  },
  {
    id: 'datasentry',
    name: 'DataSentry',
    stack: 'Python, FastAPI, pandas, NumPy, scikit-learn; HTML, CSS, JavaScript',
    status: 'github.com/lloydaq/DataSentry',
    points: [
      'Built a tool screening CSVs of up to 200,000 rows for target leakage, label conflicts and quality issues.',
      'Caught a near-perfect leaking column and 20 of 180 test rows copied from training on its churn sample.',
    ],
  },
  {
    id: 'flowcast',
    name: 'FlowCast',
    stack: 'Python, pandas, LightGBM, PyTorch (DCRNN), FastAPI; React, TypeScript, Leaflet',
    status: 'live demo at lloydaq.github.io/flowcast',
    points: [
      'Built traffic-speed forecasts 15–60 min ahead for 207 LA sensors; DCRNN reaches 2.64 mph MAE at 15 min.',
      'Cut 15-min MAE 24% below the persistence baseline; DCRNN beats LightGBM at 15–45 min (95% bootstrap).',
    ],
  },
  {
    id: 'campussignal',
    name: 'CampusSignal',
    stack: 'Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL; React, TypeScript, Tailwind CSS',
    status: 'github.com/lloydaq/CampusSignal-pro',
    points: [
      'Built a multi-tenant campus platform; the server enforces college isolation on every request, with tests.',
      'Implemented server-side sessions, CSRF checks and Argon2id password hashing; runs on demo data.',
    ],
  },
  {
    id: 'inkshift',
    name: 'Inkshift (open source)',
    stack: 'TypeScript, View Transitions, Web Animations; React entry point',
    status: 'npm, MIT · github.com/lloydaq/inkshift',
    points: [
      'Published this site’s ink-bleed theme switch as a library: reversible, about 6 kB gzipped, no dependencies.',
    ],
  },
];

export const resumeSkills: { name: string; items: string[] }[] = [
  { name: 'Languages', items: ['Python', 'Java', 'C', 'C++', 'TypeScript', 'JavaScript', 'SQL'] },
  { name: 'ML and data', items: ['NumPy', 'pandas', 'scikit-learn', 'LightGBM', 'PyTorch', 'Ollama'] },
  { name: 'Backend', items: ['FastAPI', 'REST APIs', 'Pydantic', 'PostgreSQL', 'SQLAlchemy'] },
  { name: 'Frontend', items: ['React', 'Vite', 'Tailwind CSS'] },
  { name: 'Tools', items: ['Git', 'GitHub Actions', 'pytest', 'Playwright'] },
];

export const spokenLanguages = ['English', 'Hindi', 'Kannada'];
