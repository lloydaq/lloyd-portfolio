import type { Screenshot } from './site';

// Everything on this page was checked against the DataSentry repository at
// commit 05e437d (github.com/lloydaq/DataSentry, application version 0.1.0,
// phases 0–11 of PHASES.md complete): its code, tests, README and PHASES.md. File paths are relative to that repository. Do
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
  ['Input', 'A CSV with a header row: comma, semicolon, tab or pipe; UTF-8 or Latin-1; your own missing-value tokens; up to 10 MB, 200,000 rows and 500 columns by default'],
  ['Checks', 'Profiling, exact and near-duplicate rows, column quality, consistency, target analysis and a single-feature leakage screen'],
  ['ML checks', 'Opt-in label review (with optional Cleanlab), train/test overlap, Split Doctor split advice and reproducible model-impact experiments'],
  ['Workflow', 'Version comparison, data contracts, a datasheet draft, a finding review log and a command-line quality gate for CI'],
  ['Output', 'Findings by category with evidence, a strict JSON report and a script-free HTML report'],
  ['Privacy', 'One local process: no database, accounts, analytics or external calls; uploads never touch disk'],
  ['Status', 'Application version 0.1.0; all twelve planned phases complete, CI green on main; runs locally, not deployed'],
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

/** Test files and what each covers, from their docstrings. */
export const testFiles = [
  ['test_api.py', 'endpoints, error codes, limits, security headers, uploads never spooled to disk'],
  ['test_loader.py', 'CSV validation: BOM, quoting, headers, malformed rows, limits, safe error messages'],
  ['test_parsing.py', 'configurable delimiter, encoding and extra missing-value tokens'],
  ['test_profiler.py', 'type inference, missing values, duplicates, statistics, redundancy'],
  ['test_near_duplicates.py', 'normalized grouping, ignored identifiers, bounds and the finding'],
  ['test_target.py', 'task inference, class balance, label conflicts'],
  ['test_findings.py', 'finding rules, severities, ordering, partial results, determinism'],
  ['test_ml_checks.py', 'label review and train/test overlap'],
  ['test_cleanlab.py', 'optional Cleanlab: works when installed, degrades honestly when not'],
  ['test_splits.py', 'Split Doctor: split advice, entity and time checks across two files'],
  ['test_experiments.py', 'model-impact experiments: reproducibility, the planted leakage fixture, edge cases'],
  ['test_diff.py', 'version comparison: schema, rows, distributions, missing values, finding changes'],
  ['test_contract.py', 'data contracts: export, untrusted-contract validation, checking'],
  ['test_datasheet.py', 'datasheet draft: every filled field traces to the analysis'],
  ['test_reviews.py', 'review log: decisions validated as untrusted input, carried in reports, escaped in HTML'],
  ['test_cli.py', 'quality gate: exit codes, thresholds, outputs matching the API'],
  ['test_report.py', 'JSON and HTML reports, value redaction, escaping, reproducibility'],
] as const;

export const limitations = [
  'CSV only. Delimiter and encoding are chosen from a fixed list (comma, semicolon, tab or pipe; UTF-8 or Latin-1), never detected automatically.',
  'Near-duplicates are found only when rows match after normalizing case, spacing, punctuation and numeric precision; typos are not, and train/test overlap is exact.',
  'Datetimes are recognised in ISO 8601 only; booleans as true/false, not yes/no.',
  'Fixed-threshold heuristics can produce false positives and false negatives.',
  'The leakage screen catches only single features with near-perfect association; it cannot detect temporal leakage, leakage through feature engineering, or leakage spread across several columns.',
  'Label review uses one linear model; a weak model makes its disagreements uninformative.',
  'Model-impact experiments cover classification targets only, use one simple model and measure this dataset; they are not significance tests.',
  'No authentication: the server is meant to be bound to 127.0.0.1, not exposed.',
] as const;

export type ItemStatus = 'done' | 'open';

/** PHASES.md at commit 05e437d: phases 0–11 done; 12–17 proposed, none started. */
export const roadmap: { text: string; status: ItemStatus }[] = [
  { text: 'Validation, profiling, target analysis, the leakage screen, label review and train/test overlap', status: 'done' },
  { text: 'CI, frontend unit tests and a browser smoke test (phases 0–1)', status: 'done' },
  { text: 'Configurable delimiter, encoding and missing-value tokens (phase 2)', status: 'done' },
  { text: 'Split Doctor: group-aware and time-based split advice (phase 3)', status: 'done' },
  { text: 'Version comparison and data contracts (phases 4–5)', status: 'done' },
  { text: 'Command-line quality gate, datasheet draft and review log (phases 6–8)', status: 'done' },
  { text: 'Near-duplicate detection (phase 9)', status: 'done' },
  { text: 'Reproducible model-impact experiments and optional Cleanlab (phases 10–11)', status: 'done' },
  { text: 'Re-identification risk screen (phase 12)', status: 'open' },
  { text: 'Detector self-test on planted problems (phase 13)', status: 'open' },
  { text: 'Evidence notebook export (phase 14)', status: 'open' },
  { text: 'Source audit, learning curve and Split Lab (phases 15–17)', status: 'open' },
];

// From the DataSentry repository's docs/screenshots (commit 05e437d, after its
// redesign): the app running locally on its synthetic customer churn sample,
// with churned as the target.
export const screenshots: Screenshot[] = [
  {
    light: '/datasentry/datasentry-overview-light.png',
    dark: '/datasentry/datasentry-overview-dark.png',
    width: 1440,
    height: 900,
    alt: 'DataSentry dashboard for customer_churn.csv: a summary reading 8 potential problems, 1 of high severity, and 7 observations; checks by category with Completeness and Leakage marked Issue; and dataset figures of 535 rows, 13 columns and 15 duplicate rows.',
    caption:
      'The synthetic churn sample, analysed with churned as the target. Each category is reported on its own; there is no overall score.',
  },
  {
    light: '/datasentry/datasentry-findings-light.png',
    dark: '/datasentry/datasentry-findings-dark.png',
    width: 1440,
    height: 900,
    alt: 'DataSentry findings list with the high-severity finding that cancellation_code almost perfectly predicts the target expanded, showing what was found, affected columns, why it matters, the recommended next step, its limitations, the evidence statistic 0.93893 and a review decision control.',
    caption:
      'The planted leakage column, found and explained. The finding states its own limitation: a strong association does not prove leakage.',
  },
  {
    light: '/datasentry/datasentry-ml-checks-light.png',
    dark: '/datasentry/datasentry-ml-checks-dark.png',
    width: 1440,
    height: 900,
    alt: 'DataSentry ML checks: label review reporting out-of-fold accuracy 83.9%, balanced accuracy 74.2% and a 75.2% majority baseline with Cleanlab results, a train/test overlap check finding 20 of 180 holdout rows copied from training, and the Split Doctor panel.',
    caption:
      'Opt-in checks. Label review reports its own accuracy beside the baseline; the overlap check finds the 20 holdout rows copied from training; Split Doctor advises how to split.',
  },
];
