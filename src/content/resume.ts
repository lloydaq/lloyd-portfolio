// Résumé content. Personal details (education, grades, hackathons, the certificate and
// AIvibeX) were supplied by the owner on 2026-11-13, from his résumé and NPTEL
// certificate. Hackathon finals (both reached the offline final
// round) and the AIvibeX figures (40 teams, 118 participants; technical and media team)
// were supplied on 2026-11-22, as were the BE start year (2024) and the coursework list
// (the owner's course included Java, C and C++). The 2026-11-22 rewrite also draws on the
// tradeoffs on the project case-study pages, which were checked against each repository;
// the owner approved using them. Project lines restate facts already verified in the project content
// files; keep them in step. No phone number or street address: the site is public.

export const RESUME_PDF = '/lloyd-dsouza-resume.pdf';
export const RESUME_PAGE = '/resume/';

export const resume = {
  headline: 'AI & ML engineer (student)',
  location: 'Karkala, Karnataka, India',
  summary:
    'Third-year AIML student (CGPA 8.43) and two-time hackathon finalist. Built a DCRNN traffic forecaster with 24% lower 15-minute error than the persistence baseline, plus Python/FastAPI systems with leakage tests, failure handling and CI.',
} as const;

export interface Education {
  title: string;
  school: string;
  detail: string;
  /** Printed on its own line under the entry. */
  coursework?: string;
}

export const education: Education[] = [
  {
    title: 'B.E. in AI & ML',
    school: 'Mangalore Institute of Technology and Engineering (MITE)',
    detail: '2024 – 2028 (expected) · CGPA 8.43',
    coursework: 'Data Structures & Algorithms, OOP with Java, DBMS, Operating Systems, Machine Learning',
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

// "Finalist" leads each line: both teams reached the offline final round.
export const hackathons: Entry[] = [
  {
    title: 'Finalist (offline final round)',
    context: 'Build for Billions Hackathon, NITK · JalSetu-Lite',
    points: [
      'Built backend APIs with teammates for order verification, delivery validation and disputes, including OTP verification.',
    ],
  },
  {
    title: 'Finalist (offline final round)',
    context: 'Tech Fusion 2.0 · FocusCut',
    points: ['Built the timelines and progress tracking for an app that turns YouTube videos into summaries and flashcards.'],
  },
];

export const leadership: Entry[] = [
  {
    title: 'Organising team (technical and media)',
    context: 'AIvibeX 5-hour AI hackathon, MITE · 40 teams, 118 participants',
    points: [],
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
  id: 'tnd' | 'datasentry' | 'flowcast' | 'campussignal';
  name: string;
  /** What it is, after the name. */
  tagline: string;
  stack: string;
  /** Repository or demo address; linked on the page. */
  status: string;
  points: string[];
}

// Depth over breadth: FlowCast and TND carry the page. Every figure and decision is in
// the project content files (flowcast.ts, tnd.ts, datasentry.ts, campussignal.ts).
export const resumeProjects: ResumeProject[] = [
  {
    id: 'flowcast',
    name: 'FlowCast',
    tagline: 'Traffic speed forecasting with graph neural networks',
    stack: 'Python, PyTorch (DCRNN), LightGBM, pandas, FastAPI · React, TypeScript, Leaflet',
    status: 'lloydaq.github.io/flowcast (live demo)',
    points: [
      'Built a DCRNN graph neural network and a LightGBM forecaster for 207 Los Angeles highway sensors (METR-LA benchmark), predicting speed 15–60 min ahead and scored against four baselines on identical rows.',
      'Reached 2.64 mph MAE at 15 min, 24% below the persistence baseline (3.48); a 95% day-block bootstrap shows DCRNN beats LightGBM at 15–45 min, with no clear difference at 60 min.',
      'Blocked look-ahead leakage with a test that randomises all future readings and requires every earlier feature to stay exactly identical; treated zero readings as missing so no model scores better by skipping hard rows.',
    ],
  },
  {
    id: 'tnd',
    name: 'TND',
    tagline: 'Trustworthy News Detector',
    stack: 'Python, FastAPI, Pydantic, Ollama, HTTPX, Trafilatura · pytest, Playwright',
    status: 'github.com/lloydaq/TND-The-News-Detector',
    points: [
      'Built a fact-checking pipeline where a local LLM (Ollama) extracts up to 5 claims per article and checks each against GNews and GDELT evidence within a 180-second deadline.',
      'Chose a deterministic 0–100 risk score over a model-generated probability: with no benchmark a probability would be a guess, so the formula is testable and its reasoning is printed beside the score.',
      'Marked runs DEGRADED with every provider, model and timeout failure listed, and treated missing evidence as “insufficient”, never “false”, so API outages don’t become accusations.',
    ],
  },
  {
    id: 'datasentry',
    name: 'DataSentry',
    tagline: 'Dataset diagnostics for machine learning',
    stack: 'Python, FastAPI, pandas, scikit-learn',
    status: 'github.com/lloydaq/DataSentry',
    points: [
      'Built a local tool that screens CSVs of up to 200,000 rows for target leakage, label conflicts, near-duplicate rows and train/test overlap, reporting each finding with its evidence and limits.',
      'Reported findings per category instead of one quality score, so a single severe leak can’t hide behind a good average; flags any feature that predicts the target with ROC AUC of at least 0.99.',
    ],
  },
  {
    id: 'campussignal',
    name: 'CampusSignal',
    tagline: 'Multi-tenant campus platform',
    stack: 'Python, FastAPI, SQLAlchemy, PostgreSQL · React, TypeScript',
    status: 'github.com/lloydaq/CampusSignal-pro',
    points: [
      'Built a multi-college platform where the server takes each request’s college from the session, backed by composite foreign keys and a route-by-route tenant-isolation test suite; Argon2id passwords and CSRF checks.',
    ],
  },
];

// Only what the projects use (plus coursework languages), strongest first.
export const resumeSkills: { name: string; items: string[] }[] = [
  { name: 'ML & Data', items: ['PyTorch (graph neural networks)', 'LightGBM', 'scikit-learn', 'pandas', 'NumPy', 'Ollama (local LLMs)'] },
  { name: 'Backend', items: ['Python', 'FastAPI', 'Pydantic', 'PostgreSQL', 'SQLAlchemy', 'Alembic', 'REST APIs'] },
  { name: 'Testing & CI', items: ['pytest', 'Playwright', 'GitHub Actions', 'Git'] },
  { name: 'Frontend', items: ['TypeScript', 'React', 'Vite', 'Leaflet', 'Tailwind CSS'] },
  { name: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'Java, C, C++ (coursework)'] },
];

export const spokenLanguages = ['English', 'Hindi', 'Kannada'];
