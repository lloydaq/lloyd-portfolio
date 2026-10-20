import type { Screenshot } from './site';

// Everything on this page was checked against the TND repository at v1.0.0
// (C:\projects\TND, github.com/lloydaq/TND-The-News-Detector). File paths are
// relative to that repository. Do not add a figure that is not in the code,
// its tests, or its README.

export const tnd = {
  name: 'Trustworthy News Detector',
  short: 'TND',
  version: 'v1.0.0',
  releaseDate: '19 October 2026',
  summary:
    'A misinformation risk assessment tool. Paste a news article or its URL; TND extracts the checkable claims, searches for related coverage, checks each claim against the evidence it actually retrieved, and returns an explainable risk score together with everything that failed along the way.',
  stack: 'Python, FastAPI, Pydantic, Ollama, Trafilatura, HTTPX; vanilla HTML, CSS and JavaScript',
  disclaimer:
    'TND does not decide what is true. Its score is a warning indicator, not a probability, and insufficient evidence is never treated as proof that a claim is false.',
} as const;

export type StageId =
  | 'browser'
  | 'api'
  | 'extract'
  | 'claims'
  | 'retrieve'
  | 'content'
  | 'verify'
  | 'score'
  | 'results';

export interface Stage {
  id: StageId;
  label: string;
  /** Second line in the diagram block. */
  sub: string;
  files: string[];
  specs: string[];
  /** Block position in the 600 x 470 diagram coordinate space. */
  box: { x: number; y: number };
}

export const STAGE_W = 160;
export const STAGE_H = 56;
export const DIAGRAM_W = 600;
export const DIAGRAM_H = 470;

export const stages: Stage[] = [
  {
    id: 'browser',
    label: 'Browser',
    sub: 'URL or pasted text',
    files: ['frontend/js/analysis.js'],
    specs: [
      'Posts { type: "url" | "text", content } to POST /api/analyze.',
      'Validates the response shape before rendering anything.',
    ],
    box: { x: 16, y: 16 },
  },
  {
    id: 'api',
    label: 'FastAPI',
    sub: 'limits and validation',
    files: ['backend/app/main.py', 'backend/app/routes/analysis.py'],
    specs: [
      'Rejects request bodies over 512,000 bytes with HTTP 413.',
      'Content must be 1 to 100,000 characters after trimming.',
      'At most two analyses at once; a third gets HTTP 503.',
    ],
    box: { x: 220, y: 16 },
  },
  {
    id: 'extract',
    label: 'Article extraction',
    sub: 'URL input only',
    files: ['backend/app/services/article_extractor.py'],
    specs: [
      'Destination must resolve to a public address; private, loopback and metadata addresses are refused.',
      'Every redirect is re-validated, up to five; HTML is capped at 2 MB and 30 seconds.',
      'Trafilatura first, then JSON-LD articleBody, then a constrained <article>/<main> fallback.',
    ],
    box: { x: 424, y: 16 },
  },
  {
    id: 'claims',
    label: 'Claim analysis',
    sub: 'local model via Ollama',
    files: ['backend/app/services/analyzer.py', 'backend/app/services/ollama_client.py'],
    specs: [
      'Reads the first 12,000 characters; longer input is marked DEGRADED.',
      'Returns three content signals and up to five checkable claims.',
      'The article is passed as untrusted data; the prompt tells the model not to follow instructions inside it.',
      'One bounded request to llama3.2:3b by default, with no automatic retries.',
    ],
    box: { x: 424, y: 122 },
  },
  {
    id: 'retrieve',
    label: 'Evidence search',
    sub: 'GNews and GDELT',
    files: ['backend/app/services/evidence_retriever.py'],
    specs: [
      'Both providers are queried in parallel with a bounded, deterministic query per claim.',
      'Responses are capped at 512,000 bytes before parsing; GDELT redirects count as failures.',
      'Provenance is kept and duplicate URLs merged; a missing GNews key is reported, not hidden.',
    ],
    box: { x: 424, y: 238 },
  },
  {
    id: 'content',
    label: 'Evidence text',
    sub: 'up to three articles',
    files: ['backend/app/services/evidence_content.py'],
    specs: [
      'Fetches at most three evidence articles per claim.',
      'Uses the same protected extractor as user URLs, so evidence fetching is not an SSRF hole.',
    ],
    box: { x: 220, y: 238 },
  },
  {
    id: 'verify',
    label: 'Claim verification',
    sub: 'claim against evidence',
    files: ['backend/app/services/evidence_verifier.py'],
    specs: [
      'Each article is classified as supports, contradicts, related only, or insufficient.',
      'Without retrieved article text, evidence cannot support or contradict anything.',
      'Syndicated copies are marked SAME_ARTICLE, not counted as independent confirmation.',
    ],
    box: { x: 16, y: 238 },
  },
  {
    id: 'score',
    label: 'Risk scoring',
    sub: 'deterministic heuristic',
    files: ['backend/app/services/analyzer.py'],
    specs: [
      'Starts at a neutral 50; signals, source reliability and claim results move it.',
      'Any contradicted claim holds the score at 70 or above.',
      'Claims with no support keep it at 40 or above, so missing evidence never reads as safe.',
    ],
    box: { x: 16, y: 386 },
  },
  {
    id: 'results',
    label: 'Results page',
    sub: 'status and reasons',
    files: ['frontend/results.html', 'frontend/js/main.js'],
    specs: [
      'The response is kept in sessionStorage; there is no database.',
      'Every degradation reason is listed in plain language.',
      'Article and evidence text are rendered as text, never as HTML.',
    ],
    box: { x: 220, y: 386 },
  },
];

export interface Edge {
  from: StageId;
  to: StageId;
  /** SVG path in diagram coordinates. */
  d: string;
  /** Conditional paths are dashed and labelled; colour never carries meaning alone. */
  conditional?: string;
}

const cx = (x: number) => x + STAGE_W / 2;
const right = (x: number) => x + STAGE_W;
const midY = (y: number) => y + STAGE_H / 2;

const S = Object.fromEntries(stages.map((s) => [s.id, s.box])) as Record<StageId, Stage['box']>;

export const edges: Edge[] = [
  { from: 'browser', to: 'api', d: `M${right(S.browser.x)} ${midY(16)} H${S.api.x}` },
  {
    from: 'api',
    to: 'extract',
    d: `M${right(S.api.x)} ${midY(16)} H${S.extract.x}`,
    conditional: 'URL',
  },
  { from: 'extract', to: 'claims', d: `M${cx(S.extract.x)} ${16 + STAGE_H} V${S.claims.y}` },
  {
    from: 'api',
    to: 'claims',
    d: `M${cx(S.api.x)} ${16 + STAGE_H} V${midY(S.claims.y)} H${S.claims.x}`,
    conditional: 'text',
  },
  { from: 'claims', to: 'retrieve', d: `M${cx(S.claims.x)} ${S.claims.y + STAGE_H} V${S.retrieve.y}` },
  { from: 'retrieve', to: 'content', d: `M${S.retrieve.x} ${midY(S.retrieve.y)} H${right(S.content.x)}` },
  { from: 'content', to: 'verify', d: `M${S.content.x} ${midY(S.content.y)} H${right(S.verify.x)}` },
  { from: 'verify', to: 'score', d: `M${cx(S.verify.x)} ${S.verify.y + STAGE_H} V${S.score.y}` },
  { from: 'score', to: 'results', d: `M${right(S.score.x)} ${midY(S.score.y)} H${S.results.x}` },
];

/** The per-claim loop drawn around retrieve, content and verify. */
export const loopFrame = { x: 6, y: 210, w: 588, h: 108, label: 'For each claim, up to five, within the 180-second deadline' };

export const features = [
  ['Stack', tnd.stack],
  ['Input', 'A public article URL, or pasted text up to 100,000 characters'],
  ['Model', 'llama3.2:3b running locally through Ollama (configurable)'],
  ['Evidence', 'GNews and GDELT, searched per claim with provenance kept'],
  ['Output', 'A 0 to 100 heuristic score, claim statuses, evidence and an explanation'],
  ['Honesty', 'COMPLETE or DEGRADED, with every failure listed'],
  ['Status', 'v1.0.0, tagged 19 October 2026; runs locally, not deployed'],
] as const;

export interface Decision {
  title: string;
  why: string;
  cost: string;
}

export const decisions: Decision[] = [
  {
    title: 'A heuristic score, labelled as one',
    why: 'Without a measured benchmark a probability would be a guess. A deterministic formula can be read, tested and explained, and the results page prints the reasoning beside the number.',
    cost: 'The score cannot claim calibrated accuracy, and the README says so.',
  },
  {
    title: 'Insufficient evidence is not false',
    why: 'GDELT timeouts and empty results are common. Treating silence as refutation would turn provider outages into accusations.',
    cost: 'Many claims end at INSUFFICIENT_EVIDENCE, which is less satisfying but true.',
  },
  {
    title: 'Fail visibly, not silently',
    why: 'Provider, model, extraction and time-limit failures are collected as sanitized reasons and returned with a DEGRADED status instead of a confident-looking partial answer.',
    cost: 'More states to design and test in the frontend.',
  },
  {
    title: 'A local model',
    why: 'Ollama keeps submitted articles on the machine and needs no paid API key. Each call is bounded and never retried automatically.',
    cost: 'A 3B-parameter model can miss claims or misjudge evidence; output quality is the main limitation.',
  },
  {
    title: 'URLs are a security boundary',
    why: 'Users submit URLs the server then fetches. Destinations are resolved and pinned, private and metadata ranges refused, redirects re-checked, and evidence pages go through the same gate.',
    cost: 'Some legitimate pages fail to extract; they are reported as errors, never guessed at.',
  },
];

export interface Principle {
  name: string;
  inTnd: string;
  evidence: string;
}

export const principles: Principle[] = [
  {
    name: 'Evidence over assumptions',
    inTnd: 'A claim can only be supported or contradicted by article text that was actually retrieved.',
    evidence: '`evidence_verifier.py`, `test_evidence_verifier.py`',
  },
  {
    name: 'Explainable decisions',
    inTnd: 'The risk score is a fixed formula, and the response carries a sentence explaining what moved it.',
    evidence: '`calculate_risk_score` in `analyzer.py`; `test_risk_scoring.py`',
  },
  {
    name: 'Secure defaults',
    inTnd: 'Size, time and concurrency limits on every input; SSRF checks on every fetch; errors never echo stack traces.',
    evidence: '`article_extractor.py`, `main.py`, `test_audit_regressions.py`',
  },
  {
    name: 'Honest about incompleteness',
    inTnd: 'Partial results are marked DEGRADED and each reason is shown to the reader.',
    evidence: '`degradationReasons` in `schemas.py`; the Playwright UI suite',
  },
  {
    name: 'Tests before claims',
    inTnd: 'External services are mocked so the backend suite runs offline; the README describes only verified behaviour.',
    evidence: '159 pytest tests; Playwright in GitHub Actions',
  },
];

export const scoreBands = [
  ['Below 30', 'Low Risk'],
  ['30 to 69', 'Needs Verification'],
  ['70 and above', 'High Risk'],
] as const;

export const claimStatuses = [
  ['SUPPORTED', 'Retrieved evidence directly supports the claim.'],
  ['CONTRADICTED', 'Retrieved evidence directly contradicts the claim.'],
  ['MIXED', 'The evidence points both ways.'],
  ['INSUFFICIENT_EVIDENCE', 'No decisive evidence was found. This does not mean the claim is false.'],
  ['UNVERIFIABLE', 'Verification itself failed, for example a model timeout.'],
] as const;

/** pytest functions per file, counted in the repository. Parametrised cases make the 159 total. */
export const backendTestFiles = [
  ['test_evidence_verifier.py', 'claim-versus-evidence classification, duplicate and syndicated sources'],
  ['test_evidence_retriever.py', 'provider queries, response caps, provenance and de-duplication'],
  ['test_evidence_content.py', 'evidence article fetching through the protected extractor'],
  ['test_audit_regressions.py', 'SSRF, size limits, malformed model output, error leakage'],
  ['test_api.py', 'endpoint validation, status codes and error bodies'],
  ['test_risk_scoring.py', 'score bounds, clamps and labels'],
  ['test_ollama_reliability.py', 'timeouts, unavailable models and malformed JSON'],
  ['test_analyzer.py', 'end-to-end orchestration with mocked services'],
] as const;

export const limitations = [
  'Cannot run JavaScript, bypass paywalls, or recover content a site does not send in its HTML.',
  'Analyses only the first 12,000 characters of long content.',
  'Evidence coverage depends on GNews and GDELT; GDELT timeouts are common and leave claims unresolved.',
  'Search ranking, HTTPS and publisher names do not measure truthfulness; syndicated copies may not be independent.',
  'A small local model can miss claims or misjudge evidence.',
  'An analysis takes tens of seconds and can run to the 180-second deadline.',
  'The concurrency limit is per process; public deployment needs rate limiting at a proxy or gateway.',
] as const;

export type ItemStatus = 'done' | 'open';

export const roadmap: { text: string; status: ItemStatus }[] = [
  { text: 'Bounded evidence retrieval pipeline', status: 'done' },
  { text: 'GNews and GDELT as provenance-preserving sources', status: 'done' },
  { text: 'Five claim statuses, including insufficient and unverifiable', status: 'done' },
  { text: 'Frontend connected to the live backend', status: 'done' },
  { text: 'pytest suite and Playwright UI and live suites', status: 'done' },
  { text: 'Deployment and configuration for public hosting', status: 'open' },
  { text: 'Distributed rate limiting at a reverse proxy or gateway', status: 'open' },
  { text: 'A health check that probes Ollama and the evidence providers', status: 'open' },
  { text: 'Evidence sources beyond GNews and GDELT', status: 'open' },
];

// Captured with scripts/project-shots.mjs from TND v1.0.0 running locally: one
// real analysis of a short demonstration text, rendered in both TND themes.
export const screenshots: Screenshot[] = [
  {
    light: '/tnd/tnd-results-light.png',
    dark: '/tnd/tnd-results-dark.png',
    width: 2880,
    height: 1800,
    alt: 'TND results page: a risk score of 40 out of 100 labelled Needs Verification, the written explanation of the score, and an Analysis is incomplete notice listing that GDELT timed out and GNews returned no results for at least one claim.',
    caption:
      'Results for a short demonstration text. GDELT timed out and GNews found nothing, so the analysis is marked incomplete and says why.',
  },
  {
    light: '/tnd/tnd-evidence-light.png',
    dark: '/tnd/tnd-evidence-dark.png',
    width: 2880,
    height: 1800,
    alt: 'Claims section of the TND results page listing claims about the James Webb Space Telescope, each marked Insufficient Evidence with the note that no supporting evidence was retrieved.',
    caption:
      'Claim-level review of the same run. No evidence was retrieved, so every claim stays Insufficient Evidence; none is called false.',
  },
  {
    light: '/tnd/tnd-home-light.png',
    dark: '/tnd/tnd-home-dark.png',
    width: 2880,
    height: 1800,
    alt: 'TND home page with tabs to analyse a URL or pasted text, a terms checkbox and the Analyze News button.',
    caption: 'The analyser: a URL or the article text.',
  },
];
