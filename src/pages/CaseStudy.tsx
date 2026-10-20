import { Breakable, Ticks } from '../components/Code';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { KineticGrid } from '../components/KineticGrid';
import { ArrowLeft, ArrowUpRight, GitHub } from '../components/Icons';
import { PipelineDiagram } from '../components/PipelineDiagram';
import { ThemedShot } from '../components/ThemedShot';
import { useActiveSection } from '../components/useActiveSection';
import { tndRepo } from '../content/site';
import {
  backendTestFiles,
  claimStatuses,
  decisions,
  limitations,
  roadmap,
  scoreBands,
  screenshots,
  stages,
  tnd,
} from '../content/tnd';

const toc = [
  { id: 'problem', label: 'Problem' },
  { id: 'users', label: 'Intended users' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'implementation', label: 'Implementation' },
  { id: 'decisions', label: 'Engineering decisions' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'testing', label: 'Testing' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'future', label: 'Future work' },
] as const;

const tocIds = toc.map((t) => t.id);

const scoreRules = [
  ['Start', 'Neutral', '50'],
  ['Each signal marked warning', 'Sensational Language, Verifiable Claims, Source Attribution', '+15'],
  ['Each signal marked positive', 'the same three signals', '−10'],
  ['Source reliability (URL input)', 'Low / Moderate / High', '+15 / −5 / −10'],
  ['Each contradicted claim', '', '+25'],
  ['Each mixed claim', '', '+10'],
  ['Each supported claim', '', '−10'],
  ['Any contradicted claim', 'floor', 'at least 70'],
  ['Claims exist, none supported', 'floor', 'at least 40'],
  ['No claims, unknown source', 'floor', 'at least 35'],
] as const;

const testSuites = [
  {
    suite: 'Backend (pytest)',
    runs: '159',
    result: 'All passed',
    conditions: 'Re-run for this case study on 19 October 2026. Ollama, GNews and GDELT mocked; no network or API key.',
  },
  {
    suite: 'UI (Playwright)',
    runs: '132',
    result: 'All passed at v1.0.0',
    conditions: '33 tests in Chromium, Firefox, WebKit and mobile Chromium against a mocked API. Runs in GitHub Actions on pushes and pull requests to main. Figure from the README.',
  },
  {
    suite: 'Live (Playwright)',
    runs: '3',
    result: 'All passed at v1.0.0',
    conditions: 'Real backend, Ollama and providers. Provider outages produce degraded results, not failures. Figure from the README.',
  },
] as const;

const operatingLimits = [
  ['Request body', '512,000', 'bytes', 'main.py'],
  ['Submitted content', '1 to 100,000', 'characters', 'schemas.py'],
  ['Concurrent analyses', '2', 'per process', 'routes/analysis.py'],
  ['Article HTML', '2,000,000', 'bytes', 'article_extractor.py'],
  ['Article fetch', '30', 'seconds', 'article_extractor.py'],
  ['Redirects followed', '5', 'each re-validated', 'article_extractor.py'],
  ['Text sent to the model', '12,000', 'characters', 'analyzer.py'],
  ['Claims checked', '5', 'per article', 'analyzer.py'],
  ['Evidence articles fetched', '3', 'per claim', 'evidence_content.py'],
  ['Provider response', '512,000', 'bytes', 'evidence_retriever.py'],
  ['One Ollama request', '60', 'seconds (default)', 'ollama_config.py'],
  ['Whole analysis', '180', 'seconds (default)', 'ollama_config.py'],
] as const;

const challenges = [
  {
    title: 'A small model returns messy output',
    body: 'llama3.2:3b sometimes returns malformed JSON, fields of the wrong type, or references to evidence that does not exist. Every model response is validated before use; bad fields degrade the result with a stated reason instead of crashing, and an invented article reference can never create evidence or upgrade a claim.',
    proof: '`test_ollama_reliability.py`, `test_audit_regressions.py`',
  },
  {
    title: 'Evidence providers are unreliable',
    body: 'GDELT often times out or returns nothing; GNews needs a key some users will not have. Each provider is called with its own timeout, responses are streamed and capped at 512,000 bytes, GDELT redirects count as failures, and every outcome is reported separately so an outage reads as an outage.',
    proof: '`evidence_retriever.py`, `test_evidence_retriever.py`',
  },
  {
    title: 'One request, many slow calls',
    body: 'A single analysis can involve a page fetch, several model calls and dozens of evidence requests. The 180-second deadline is passed down into evidence fetching, so no new article is fetched after time runs out, and the result carries the reason “Analysis deadline exhausted”.',
    proof: '`analyzer.py`, `evidence_content.py`, `test_audit_regressions.py`',
  },
  {
    title: 'Agreement that is not independent',
    body: 'The same wire story appears on many sites, and both providers can return the same article. Duplicate URLs and identical syndicated text are assessed once and marked SAME_ARTICLE; when both providers return one article, independence stays UNKNOWN rather than counting as two confirmations.',
    proof: '`evidence_verifier.py`, `test_evidence_verifier.py`',
  },
  {
    title: 'Fetching URLs that users control',
    body: 'Any server that fetches user-supplied URLs can be pointed at internal addresses. TND resolves the host, refuses private, loopback, shared and cloud-metadata ranges including IPv4-mapped and NAT64 forms, pins the connection to the checked address, re-validates each redirect, and enforces a total deadline that a slow-drip response cannot escape.',
    proof: '`article_extractor.py`, `test_audit_regressions.py`',
  },
] as const;

export function CaseStudy() {
  const active = useActiveSection(tocIds);
  const [results, evidence, home] = screenshots;

  return (
    <>
      <KineticGrid />
      <div className="read-progress" aria-hidden="true" />
      <Header base="/" />
      <main id="main" className="case">
        <header className="case__head container">
          <a className="back-link" href="/#projects">
            <ArrowLeft /> Back to the portfolio
          </a>
          <h1 className="case__title">
            {tnd.short}: {tnd.name}
          </h1>
          <p className="case__summary">{tnd.summary}</p>
          <dl className="kv case__meta">
            <div className="kv__row">
              <dt>Role</dt>
              <dd>Sole developer: backend, evidence pipeline, frontend, tests</dd>
            </div>
            <div className="kv__row">
              <dt>Stack</dt>
              <dd>{tnd.stack}</dd>
            </div>
            <div className="kv__row">
              <dt>Release</dt>
              <dd>
                {tnd.version}, tagged {tnd.releaseDate}
              </dd>
            </div>
            <div className="kv__row">
              <dt>Status</dt>
              <dd>Runs locally. Not deployed, so there is no live demo.</dd>
            </div>
          </dl>
          <div className="actions case__actions">
            <a className="button button--primary" href={tndRepo} rel="noopener">
              <GitHub /> View the repository <ArrowUpRight />
            </a>
          </div>
        </header>

        <div className="case__layout container">
          <nav className="case__toc" aria-label="Case study sections">
            <p className="case__toc-title">On this page</p>
            <ol>
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} aria-current={active === item.id ? 'true' : undefined}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="case__body">
            <section id="problem" className="case__section" aria-labelledby="problem-h">
              <h2 id="problem-h">The problem</h2>
              <div className="prose">
                <p>
                  Most people meet a news story as a forwarded link or a screenshot, with no time to trace
                  each claim back to a source. Tools that answer with a single “true” or “false” ask to be
                  trusted instead of checked, and they hide the cases where the honest answer is “I could
                  not find out”.
                </p>
                <p>
                  TND gives a second look, not a verdict. It breaks an article into specific claims, looks
                  for related coverage, and shows how the evidence it actually retrieved bears on each
                  claim, together with a score that is explained rather than asserted.
                </p>
              </div>
              <p className="callout">{tnd.disclaimer}</p>
            </section>

            <section id="users" className="case__section" aria-labelledby="users-h">
              <h2 id="users-h">Intended users</h2>
              <div className="prose">
                <p>
                  Everyday news readers who have one article in hand and want to pause before believing or
                  sharing it. They are not professional fact-checkers, so the interface explains its
                  vocabulary in plain language, lists the evidence with links to the original sources, and
                  says clearly when an analysis is incomplete.
                </p>
              </div>
            </section>

            <section id="architecture" className="case__section" aria-labelledby="architecture-h">
              <h2 id="architecture-h">Architecture</h2>
              <div className="prose">
                <p>
                  A static frontend posts the article to a FastAPI service. The service extracts the text,
                  asks a local model for claims, then runs a per-claim loop of evidence search, evidence
                  fetching and verification before scoring. Nothing is stored on the server; the browser
                  keeps the result in <code>sessionStorage</code> for the results page.
                </p>
              </div>
              <div className="case__figure">
                <PipelineDiagram
                  animate={false}
                  initial="retrieve"
                  caption={
                    <span>
                      <b>Figure 1.</b> The request path through TND’s nine stages. Select a stage for its
                      limits and source files.
                    </span>
                  }
                />
              </div>
            </section>

            <section id="implementation" className="case__section" aria-labelledby="implementation-h">
              <h2 id="implementation-h">Implementation</h2>
              <div className="prose">
                <p>
                  The backend is plain FastAPI with Pydantic schemas and no database. Each concern lives in
                  one service module, so each can be tested with its neighbours mocked.
                </p>
              </div>

              <table className="spec-table spec-table--stack case__stages">
                <caption>Stages and the modules that own them</caption>
                <thead>
                  <tr>
                    <th scope="col">Stage</th>
                    <th scope="col">What it does</th>
                    <th scope="col">Module</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stage) => (
                    <tr key={stage.id}>
                      <th scope="row">{stage.label}</th>
                      <td data-label="What it does">{stage.specs[0]}</td>
                      <td data-label="Module">
                        {stage.files.map((f) => (
                          <code key={f} className="file">
                            {f.replace(/^backend\/app\/|^frontend\//, '')}
                          </code>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="case__h3">How the score is calculated</h3>
              <div className="prose">
                <p>
                  The risk score is a fixed formula in <code>calculate_risk_score</code>, not a model output
                  and not a probability. A 70 does not mean a 70% chance the article is false.
                </p>
              </div>
              <div className="case__tables">
                <table className="spec-table spec-table--stack">
                  <caption>Score rules</caption>
                  <thead>
                    <tr>
                      <th scope="col">Input</th>
                      <th scope="col">Note</th>
                      <th scope="col" className="num">
                        Effect
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreRules.map(([input, note, effect]) => (
                      <tr key={input}>
                        <th scope="row">{input}</th>
                        <td className="muted" data-label={note ? 'Note' : undefined}>
                          {note}
                        </td>
                        <td className="num" data-label="Effect">
                          {effect}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="spec-table">
                  <caption>Labels, after clamping to 0 to 100</caption>
                  <thead>
                    <tr>
                      <th scope="col">Score</th>
                      <th scope="col">Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreBands.map(([band, label]) => (
                      <tr key={band}>
                        <th scope="row">{band}</th>
                        <td>{label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <details className="disclosure">
                <summary>Claim statuses</summary>
                <table className="spec-table">
                  <thead>
                    <tr>
                      <th scope="col">Status</th>
                      <th scope="col">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimStatuses.map(([status, meaning]) => (
                      <tr key={status}>
                        <th scope="row">
                          <code>{status}</code>
                        </th>
                        <td>{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>

              <details className="disclosure">
                <summary>Request and response</summary>
                <pre className="code">
                  <code>{`POST /api/analyze
{ "type": "text", "content": "The council approved the budget on Monday." }

200 OK
{
  "riskScore": 40,
  "riskLabel": "Needs Verification",
  "sourceReliability": "Unknown",
  "signals": [{ "name": "...", "status": "positive" }],
  "claims": [{ "id": 1, "text": "...", "verificationStatus": "INSUFFICIENT_EVIDENCE", "evidence": [] }],
  "analysisStatus": "DEGRADED",
  "degradationReasons": ["The GDELT evidence source timed out."],
  "analysisExplanation": "Risk score: 40/100 (Needs Verification). ..."
}`}</code>
                </pre>
                <p className="muted small">
                  Field names follow the API; values are illustrative. Errors return{' '}
                  <code>{'{"detail": "..."}'}</code> with 400, 413, 422, 500, 502 or 503 and never include
                  stack traces or the submitted content.
                </p>
              </details>

              <div className="case__gallery">
                {[results, evidence, home].map((shot, i) =>
                  shot ? (
                    <figure key={shot.light} className={`figure${i === 0 ? ' case__gallery-lead' : ''}`}>
                      <div className="figure__frame">
                        <ThemedShot shot={shot} />
                      </div>
                      <figcaption>
                        <b>Figure {i + 2}.</b> {shot.caption}
                      </figcaption>
                    </figure>
                  ) : null,
                )}
              </div>
            </section>

            <section id="decisions" className="case__section" aria-labelledby="decisions-h">
              <h2 id="decisions-h">Key engineering decisions</h2>
              <table className="spec-table spec-table--stack">
                <thead>
                  <tr>
                    <th scope="col">Decision</th>
                    <th scope="col">Why</th>
                    <th scope="col">What it costs</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((d) => (
                    <tr key={d.title}>
                      <th scope="row">{d.title}</th>
                      <td data-label="Why">{d.why}</td>
                      <td data-label="What it costs" className="muted">
                        {d.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section id="challenges" className="case__section" aria-labelledby="challenges-h">
              <h2 id="challenges-h">Challenges</h2>
              <div className="prose">
                <p>
                  The commit history from 11 to 19 October 2026 is mostly about these problems. Each is
                  handled in code and pinned by tests.
                </p>
              </div>
              <div className="challenges">
                {challenges.map((c) => (
                  <article key={c.title} className="challenge">
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                    <p className="challenge__proof">
                      <span className="visually-hidden">Evidence: </span>
                      <Ticks text={c.proof} />
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section id="testing" className="case__section" aria-labelledby="testing-h">
              <h2 id="testing-h">Testing and verification</h2>
              <table className="spec-table spec-table--stack test-table">
                <caption>Test suites and the conditions they ran under</caption>
                <thead>
                  <tr>
                    <th scope="col">Suite</th>
                    <th scope="col" className="num">
                      Runs
                    </th>
                    <th scope="col">Result</th>
                    <th scope="col">Conditions</th>
                  </tr>
                </thead>
                <tbody>
                  {testSuites.map((t) => (
                    <tr key={t.suite}>
                      <th scope="row">{t.suite}</th>
                      <td className="num" data-label="Runs">
                        {t.runs}
                      </td>
                      <td data-label="Result">{t.result}</td>
                      <td data-label="Conditions" className="muted">
                        {t.conditions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="spec-table spec-table--stack">
                <caption>What the backend tests cover</caption>
                <thead>
                  <tr>
                    <th scope="col">File</th>
                    <th scope="col">Covers</th>
                  </tr>
                </thead>
                <tbody>
                  {backendTestFiles.map(([file, covers]) => (
                    <tr key={file}>
                      <th scope="row">
                        <code>
                          <Breakable text={file} />
                        </code>
                      </th>
                      <td data-label="Covers">{covers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section id="limitations" className="case__section" aria-labelledby="limitations-h">
              <h2 id="limitations-h">Current limitations</h2>
              <table className="spec-table spec-table--stack limits-table">
                <caption>Operating limits, enforced in code</caption>
                <thead>
                  <tr>
                    <th scope="col">Parameter</th>
                    <th scope="col" className="num">
                      Limit
                    </th>
                    <th scope="col">Unit</th>
                    <th scope="col">Enforced in</th>
                  </tr>
                </thead>
                <tbody>
                  {operatingLimits.map(([param, limit, unit, file]) => (
                    <tr key={param}>
                      <th scope="row">{param}</th>
                      <td className="num" data-label="Limit">
                        {limit}
                      </td>
                      <td data-label="Unit" className="muted">
                        {unit}
                      </td>
                      <td data-label="Enforced in">
                        <code>{file}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="case__h3">What it cannot do</h3>
              <ul className="limit-list">
                {limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </section>

            <section id="future" className="case__section" aria-labelledby="future-h">
              <h2 id="future-h">Future improvements</h2>
              <div className="prose">
                <p>
                  The project’s roadmap, with what is done and what is still open. Open items are not
                  started.
                </p>
              </div>
              <ul className="status-list">
                {roadmap.map((item) => (
                  <li key={item.text}>
                    <span className="status-mark" data-status={item.status} aria-hidden="true" />
                    <span>{item.text}</span>
                    <span className="status-label">{item.status === 'done' ? 'Done' : 'Open'}</span>
                  </li>
                ))}
              </ul>
              <div className="actions case__end">
                <a className="button button--primary" href={tndRepo} rel="noopener">
                  <GitHub /> Read the code on GitHub <ArrowUpRight />
                </a>
                <a className="button" href="/#contact">
                  Get in touch
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
