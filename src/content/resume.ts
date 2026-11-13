// Résumé content. Personal details (education, grades, hackathons, the certificate and
// AIvibeX) were supplied by the owner on 2026-11-13, from his résumé and NPTEL
// certificate. Project lines restate facts already verified in the project content
// files; keep them in step. No phone number or street address: the site is public.

export const RESUME_PDF = '/lloyd-dsouza-resume.pdf';
export const RESUME_PAGE = '/resume/';

export const resume = {
  headline: 'AI & ML engineering student',
  location: 'Karkala, Karnataka, India',
  summary:
    'AI & ML engineering student who builds complete applications: the backend service, the checks around a model, the interface that explains its output, and the tests. Four projects built end to end, two team hackathons, and one hackathon conducted for my college.',
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
    context: 'Build for Billions Hackathon, NITK',
    role: 'Backend: verification, security and disputes',
    points: [
      'Built backend workflows for order verification, delivery validation and dispute handling.',
      'Worked on OTP verification and server-side validation logic.',
      'Developed APIs for the water-delivery workflow with teammates.',
    ],
  },
  {
    title: 'FocusCut',
    context: 'Tech Fusion 2.0',
    role: 'AI-powered learning assistant',
    points: [
      'Contributed to a tool that turns YouTube videos into summaries, key takeaways and flashcards.',
      'Worked on interactive timelines and progress tracking for long-form learning.',
    ],
  },
];

export const leadership: Entry[] = [
  {
    title: 'AIvibeX',
    context: 'Mangalore Institute of Technology and Engineering',
    role: 'Conducted a 5-hour AI hackathon for the college',
    points: [],
  },
];

export interface Certification {
  name: string;
  issuer: string;
  when: string;
  detail: string;
}

export const certifications: Certification[] = [
  {
    name: 'Foundations of Virtual Reality',
    issuer: 'NPTEL, IIT Madras',
    when: 'Jul–Oct 2026, 12-week course',
    detail: 'Elite certificate · consolidated score 67% · 4 credits recommended',
  },
];

export interface ResumeProject {
  id: 'tnd' | 'datasentry' | 'flowcast' | 'campussignal';
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
    status: 'v1.0.0 · github.com/lloydaq/TND-The-News-Detector',
    points: [
      'Extracts claims from an article with a local LLM, searches GNews and GDELT, and checks each claim against the evidence retrieved.',
      'Deterministic 0–100 risk score; each run is marked COMPLETE or DEGRADED with every failure listed; pytest and Playwright suites.',
    ],
  },
  {
    id: 'datasentry',
    name: 'DataSentry',
    stack: 'Python, FastAPI, pandas, NumPy, scikit-learn; HTML, CSS, JavaScript',
    status: 'v0.1.0 · github.com/lloydaq/DataSentry',
    points: [
      'Profiles a CSV and screens it for target leakage, label conflicts and quality problems, reporting each finding with its evidence and limits.',
      'Cross-validated label review and train/test overlap checks; JSON and HTML reports; runs locally with no database or external calls.',
    ],
  },
  {
    id: 'flowcast',
    name: 'FlowCast',
    stack: 'Python, pandas, LightGBM, PyTorch (DCRNN), FastAPI; React, TypeScript, Leaflet',
    status: 'v1.0.0 · live demo at lloydaq.github.io/flowcast',
    points: [
      'Forecasts traffic speed 15–60 min ahead for 207 LA highway sensors (METR-LA): four baselines, LightGBM and a DCRNN, on identical rows.',
      'Leakage-tested features, a day-block bootstrap to compare models, and a React dashboard that replays June 2012.',
    ],
  },
  {
    id: 'campussignal',
    name: 'CampusSignal',
    stack: 'Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL; React, TypeScript, Tailwind CSS',
    status: 'Not deployed; demo data · github.com/lloydaq/CampusSignal-pro',
    points: [
      'A multi-college campus platform: notices, department pages, a moderated community, academic records and issue reporting.',
      'College isolation enforced by the server on every request; server-side sessions, CSRF checks, Argon2id, tenant-isolation tests.',
    ],
  },
];

export const resumeSkills: { name: string; items: string[] }[] = [
  { name: 'Languages', items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'HTML', 'CSS'] },
  { name: 'ML and data', items: ['NumPy', 'pandas', 'scikit-learn', 'LightGBM', 'PyTorch', 'Ollama'] },
  { name: 'Backend', items: ['FastAPI', 'REST APIs', 'Pydantic', 'PostgreSQL', 'SQLAlchemy'] },
  { name: 'Frontend', items: ['React', 'Vite', 'Tailwind CSS'] },
  { name: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'pytest', 'Playwright', 'GitHub Actions'] },
];

export const spokenLanguages = ['English', 'Hindi', 'Kannada'];
