import type { Screenshot } from './site';

// Everything on this page was checked against the DataSentry repository at
// commit ae58615 (github.com/lloydaq/DataSentry, application version 0.1.0):
// its code, tests and README. File paths are relative to that repository. Do
// not add a figure that is not in the code, its tests, or its README.

export const dataSentry = {
  name: 'DataSentry',
  tagline: 'Dataset diagnostics for machine learning',
  version: '0.1.0',
  summary:
    'A local-first dataset diagnostics tool. Upload a CSV and DataSentry profiles it, screens it for target leakage, label conflicts and quality problems, and turns each result into an explained finding: what was measured, why it matters for modelling, what to check next, and the limits of the evidence.',
  stack: 'Python, FastAPI, Pydantic, pandas, NumPy, scikit-learn; vanilla HTML, CSS and JavaScript',
  disclaimer:
    'DataSentry reports evidence, not verdicts. Nothing is labelled a confirmed problem, there is no single quality score, and a strong association is never presented as proof of leakage.',
} as const;

export const features = [
  ['Stack', dataSentry.stack],
  ['Input', 'One UTF-8, comma-separated CSV with a header row; up to 10 MB, 200,000 rows and 500 columns by default'],
  ['Checks', 'Profiling, column quality, consistency, target analysis and a single-feature leakage screen'],
  ['ML checks', 'Opt-in cross-validated label review and a train/test overlap check, both with scikit-learn'],
  ['Output', 'Findings by category with evidence, a strict JSON report and a script-free HTML report'],
  ['Privacy', 'One local process: no database, accounts, analytics or external calls; uploads never touch disk'],
  ['Status', 'Application version 0.1.0; runs locally, not deployed'],
] as const;

export interface Decision {
  title: string;
  why: string;
  cost: string;
}

export const decisions: Decision[] = [
  {
    title: 'No single quality score',
    why: 'Any weighting of missing values against leakage or label noise would be arbitrary, and one good number could hide one severe problem. Each category is reported separately, including which checks did not run.',
    cost: 'There is no headline number to put on a dashboard; the reader has to look at the categories.',
  },
  {
    title: 'Findings, not statistics',
    why: 'Every finding carries a stable code, its evidence, why it matters, a next step and its limitations, so the reader can judge it instead of trusting it.',
    cost: 'Each new check needs its explanation, thresholds and limitations written and tested, not just a computed value.',
  },
  {
    title: 'Observations are not problems',
    why: 'Class imbalance, outlier candidates and identifier-like columns are often legitimate. They are reported as observations and never counted as defects.',
    cost: 'Some real problems surface only as observations and depend on the reader to follow them up.',
  },
  {
    title: 'Corrections only with approval',
    why: 'Removing rows or columns changes what a model learns. Corrections are proposals until explicitly approved, are applied to a copy, and return an audit record with input and output SHA-256 hashes.',
    cost: 'An extra step for the user; imputation is deliberately not offered, because it belongs inside a training pipeline.',
  },
  {
    title: 'A partial result says so',
    why: 'Analysis runs in stages. If one fails, the result is marked partial and names the checks that are missing instead of looking complete.',
    cost: 'The frontend and reports have to handle sections that are absent.',
  },
];

/** The request path, from routes.py to the response contract. */
export const pipeline = [
  ['Upload', 'Bounded, in-memory multipart parsing; oversized bodies are rejected while streaming', 'api/uploads.py'],
  ['Validation', 'CSV parsing with size, row and column limits; empty, duplicate and malformed headers rejected', 'services/loader.py'],
  ['Profiling', 'Types, missing values, duplicates, numeric and categorical statistics, redundancy', 'services/profiler.py'],
  ['Target', 'Classification or regression from the chosen column, class balance, label conflicts', 'services/target.py'],
  ['Leakage', 'Single features that predict the target almost perfectly; train/test overlap', 'services/leakage.py'],
  ['Findings', 'Rules turn observations into findings, sorted deterministically, with a qualitative summary', 'services/findings.py'],
  ['Orchestration', 'Runs the stages; a failing stage marks the result partial', 'services/analysis.py'],
  ['Response', 'Pydantic contracts with strict JSON: no NaN or Infinity, floats rounded to six decimals', 'models/schemas.py'],
] as const;

export const leakageRules = [
  ['Classification, repeated values', 'Goodman–Kruskal λ', 'at least 0.8'],
  ['Binary target, numeric feature', 'single-feature ROC AUC', 'at least 0.99 or at most 0.01'],
  ['Regression', '|Pearson r|', 'at least 0.99'],
  ['Any', 'labelled rows needed', 'at least 20'],
] as const;

export const securityPoints = [
  'Uploads are parsed in memory and never written to disk; a test fails if one is ever spooled to a temporary file.',
  'Files are only parsed as CSV: no eval, pickle, Excel parsing or code execution. Client file names are never used as paths.',
  'Error responses use fixed templates with no cell values and no tracebacks; logs record exception types, not messages.',
  'The interface inserts dataset strings as text only and is served with a strict Content-Security-Policy, nosniff and X-Frame-Options: DENY.',
  'HTML reports are self-contained, escape every dynamic string and cannot run scripts.',
] as const;

/** pytest functions per file, counted in the repository. Parametrised cases make the 161 runs. */
export const testFiles = [
  ['test_api.py', 'endpoints, error codes, limits, security headers, uploads never spooled to disk'],
  ['test_profiler.py', 'type inference, missing values, duplicates, statistics, redundancy'],
  ['test_loader.py', 'CSV validation: BOM, quoting, headers, malformed rows, limits, safe error messages'],
  ['test_ml_checks.py', 'label review and train/test overlap'],
  ['test_target.py', 'task inference, class balance, label conflicts'],
  ['test_findings.py', 'finding rules, severities, ordering, partial results, determinism'],
  ['test_report.py', 'JSON and HTML reports, value redaction, escaping, reproducibility'],
] as const;

export const limitations = [
  'CSV only: comma-separated, UTF-8. Other delimiters and encodings are rejected rather than guessed.',
  'Only exact duplicates and exact train/test matches are detected, not near-duplicates or related records.',
  'Datetimes are recognised in ISO 8601 only; booleans as true/false, not yes/no.',
  'Fixed-threshold heuristics can produce false positives and false negatives.',
  'The leakage screen catches only single features with near-perfect association; it cannot detect temporal leakage or leakage spread across several columns.',
  'Label review uses one linear model; a weak model makes its disagreements uninformative.',
  'No authentication: the server is meant to be bound to 127.0.0.1, not exposed.',
] as const;

export type ItemStatus = 'done' | 'open';

export const roadmap: { text: string; status: ItemStatus }[] = [
  { text: 'Validation, profiling, target analysis and the leakage screen', status: 'done' },
  { text: 'Opt-in label review and train/test overlap', status: 'done' },
  { text: 'Approved, audited corrections', status: 'done' },
  { text: 'JSON and HTML reports', status: 'done' },
  { text: 'pytest suite covering services, API and security boundaries', status: 'done' },
  { text: 'Reproducible model-impact experiments', status: 'open' },
  { text: 'Group-aware and temporal train/test checks', status: 'open' },
  { text: 'Near-duplicate detection', status: 'open' },
  { text: 'Configurable missing-value tokens, delimiter and encoding', status: 'open' },
  { text: 'Frontend unit tests and a browser test in CI', status: 'open' },
];

// Captured with scripts/project-shots.mjs from DataSentry running locally on
// its synthetic customer churn sample, with churned as the target.
export const screenshots: Screenshot[] = [
  {
    light: '/datasentry/datasentry-overview-light.png',
    dark: '/datasentry/datasentry-overview-dark.png',
    width: 2880,
    height: 1800,
    alt: 'DataSentry dashboard for customer_churn.csv: a summary reading 8 potential problems, 1 of high severity, and 7 observations; checks by category with Completeness and Leakage marked Issue; and dataset figures of 535 rows, 13 columns and 15 duplicate rows.',
    caption:
      'The synthetic churn sample, analysed with churned as the target. Each category is reported on its own; there is no overall score.',
  },
  {
    light: '/datasentry/datasentry-findings-light.png',
    dark: '/datasentry/datasentry-findings-dark.png',
    width: 2880,
    height: 1800,
    alt: 'DataSentry findings list with the high-severity finding that cancellation_code almost perfectly predicts the target expanded, showing what was found, affected columns, why it matters, the recommended next step, its limitations and the evidence statistic 0.93893.',
    caption:
      'The planted leakage column, found and explained. The finding states its own limitation: a strong association does not prove leakage.',
  },
  {
    light: '/datasentry/datasentry-ml-checks-light.png',
    dark: '/datasentry/datasentry-ml-checks-dark.png',
    width: 2880,
    height: 1800,
    alt: 'DataSentry ML checks: label review reporting out-of-fold accuracy 83.9%, balanced accuracy 74.2% and a 75.2% majority baseline with rows to review, and a train/test overlap check finding 20 of 180 holdout rows copied from training.',
    caption:
      'Opt-in checks. Label review reports its own accuracy beside the baseline; the overlap check finds the 20 holdout rows copied from training.',
  },
];
