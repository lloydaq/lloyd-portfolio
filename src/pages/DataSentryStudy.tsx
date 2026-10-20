import { Breakable } from '../components/Code';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { KineticGrid } from '../components/KineticGrid';
import { ArrowLeft, ArrowUpRight, GitHub } from '../components/Icons';
import { FullSizeLink, ThemedShot } from '../components/ThemedShot';
import { useActiveSection } from '../components/useActiveSection';
import {
  dataSentry,
  decisions,
  leakageRules,
  limitations,
  pipeline,
  roadmap,
  screenshots,
  securityPoints,
  testFiles,
} from '../content/datasentry';
import { dataSentryRepo } from '../content/site';

const toc = [
  { id: 'problem', label: 'Problem' },
  { id: 'users', label: 'Intended users' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'checks', label: 'What it checks' },
  { id: 'decisions', label: 'Engineering decisions' },
  { id: 'security', label: 'Security and privacy' },
  { id: 'testing', label: 'Testing' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'future', label: 'Future work' },
] as const;

const tocIds = toc.map((t) => t.id);

const findingKinds = [
  ['Observation', 'A neutral fact worth knowing, such as class imbalance or outlier candidates. Never counted as a problem.'],
  ['Potential issue', 'A pattern that often hurts modelling but depends on context, including every leakage signal.'],
  ['Likely issue', 'Almost always a problem, such as an all-missing or single-class column.'],
  ['Inconclusive', 'A check that could not reach a result, for example too few values. Said so, not hidden.'],
] as const;

const operatingLimits = [
  ['Upload size', '10,485,760', 'bytes per file', 'config.py'],
  ['Data rows', '200,000', 'per file', 'config.py'],
  ['Columns', '500', 'per file', 'config.py'],
  ['Concurrent analyses', '2', 'others wait up to 30 s, then 503', 'config.py'],
  ['Label review', '20,000', 'rows', 'config.py'],
] as const;

export function DataSentryStudy() {
  const active = useActiveSection(tocIds);
  const [overview, findings, mlChecks] = screenshots;

  return (
    <>
      <KineticGrid />
      <div className="read-progress" aria-hidden="true" />
      <Header base="/" />
      <main id="main" className="case">
        <header className="case__head container">
          <a className="back-link" href="/#datasentry">
            <ArrowLeft /> Back to the portfolio
          </a>
          <h1 className="case__title">
            {dataSentry.name}: {dataSentry.tagline}
          </h1>
          <p className="case__summary">{dataSentry.summary}</p>
          <dl className="kv case__meta">
            <div className="kv__row">
              <dt>Role</dt>
              <dd>Sole developer: diagnostics services, API, frontend, tests</dd>
            </div>
            <div className="kv__row">
              <dt>Stack</dt>
              <dd>{dataSentry.stack}</dd>
            </div>
            <div className="kv__row">
              <dt>Version</dt>
              <dd>Application version {dataSentry.version}; no tagged release yet</dd>
            </div>
            <div className="kv__row">
              <dt>Status</dt>
              <dd>Runs locally. Not deployed, so there is no live demo.</dd>
            </div>
          </dl>
          <div className="actions case__actions">
            <a className="button button--primary" href={dataSentryRepo} rel="noopener">
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
                  Many model failures start as data problems: a duplicated record that lands on both sides of
                  a split, a column recorded after the outcome, a target with a handful of rare classes, or
                  numbers quietly stored as text. Generic profilers list statistics and leave the reader to
                  work out which of them matter.
                </p>
                <p>
                  DataSentry turns those statistics into findings. Each one states what was measured, why it
                  matters for modelling, what to check next, and the limits of the evidence.
                </p>
              </div>
              <p className="callout">{dataSentry.disclaimer}</p>
            </section>

            <section id="users" className="case__section" aria-labelledby="users-h">
              <h2 id="users-h">Intended users</h2>
              <div className="prose">
                <p>
                  Machine learning practitioners about to train on a tabular dataset who want to know what
                  is wrong with it first. The tool runs on their own machine, so a private dataset never
                  leaves it.
                </p>
              </div>
            </section>

            <section id="architecture" className="case__section" aria-labelledby="architecture-h">
              <h2 id="architecture-h">Architecture</h2>
              <div className="prose">
                <p>
                  One local FastAPI process serves both the API and a vanilla JavaScript frontend with no
                  build step. The diagnostics in <code>app/services/</code> are plain Python with no web
                  framework imports, so each can be tested without HTTP. There is no database: the server
                  keeps no state, and each action re-uploads the file from the browser.
                </p>
              </div>
              <table className="spec-table spec-table--stack">
                <caption>The request path and the modules that own it</caption>
                <thead>
                  <tr>
                    <th scope="col">Stage</th>
                    <th scope="col">What it does</th>
                    <th scope="col">Module</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.map(([stage, does, file]) => (
                    <tr key={stage}>
                      <th scope="row">{stage}</th>
                      <td data-label="What it does">{does}</td>
                      <td data-label="Module">
                        <code className="file">{file}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section id="checks" className="case__section" aria-labelledby="checks-h">
              <h2 id="checks-h">What it checks</h2>
              <div className="prose">
                <p>
                  Findings fall into four kinds, so the reader can tell a fact from a likely defect. Every
                  threshold is a named constant in the module that uses it, and the same list is printed in
                  each report’s methodology section.
                </p>
              </div>
              <table className="spec-table spec-table--stack">
                <caption>Kinds of finding</caption>
                <thead>
                  <tr>
                    <th scope="col">Kind</th>
                    <th scope="col">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {findingKinds.map(([kind, meaning]) => (
                    <tr key={kind}>
                      <th scope="row">{kind}</th>
                      <td data-label="Meaning">{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="case__h3">The leakage screen</h3>
              <div className="prose">
                <p>
                  A feature that predicts the target almost perfectly is often derived from it or recorded
                  after the outcome. The screen flags it as a potential issue to verify, never as proof.
                </p>
              </div>
              <table className="spec-table spec-table--stack">
                <caption>Leakage signals, from leakage.py</caption>
                <thead>
                  <tr>
                    <th scope="col">Case</th>
                    <th scope="col">Statistic</th>
                    <th scope="col">Flagged at</th>
                  </tr>
                </thead>
                <tbody>
                  {leakageRules.map(([kase, stat, at]) => (
                    <tr key={kase}>
                      <th scope="row">{kase}</th>
                      <td data-label="Statistic">{stat}</td>
                      <td data-label="Flagged at">{at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="case__h3">Label review</h3>
              <div className="prose">
                <p>
                  An opt-in check. A logistic regression is evaluated with stratified 5-fold
                  cross-validation, with imputation, scaling and one-hot encoding inside a scikit-learn{' '}
                  <code>Pipeline</code> so preprocessing is fitted on training folds only. Rows whose
                  out-of-fold prediction disagrees with their label are listed for review, beside the
                  model’s accuracy and the majority-class baseline so the reader can judge whether the model
                  is informative. Labels are never changed.
                </p>
              </div>

              <div className="case__gallery">
                {[overview, findings, mlChecks].map((shot, i) =>
                  shot ? (
                    <figure key={shot.light} className={`figure${i === 0 ? ' case__gallery-lead' : ''}`}>
                      <div className="figure__frame">
                        <ThemedShot shot={shot} />
                      </div>
                      <figcaption>
                        <b>Figure {i + 1}.</b> {shot.caption}
                        <FullSizeLink shot={shot} />
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

            <section id="security" className="case__section" aria-labelledby="security-h">
              <h2 id="security-h">Security and privacy</h2>
              <div className="prose">
                <p>
                  An uploaded file is untrusted input. The upload path, parsing, errors, logging and
                  rendering were reviewed and covered by regression tests; this was not a penetration test.
                </p>
              </div>
              <ul className="limit-list">
                {securityPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>

            <section id="testing" className="case__section" aria-labelledby="testing-h">
              <h2 id="testing-h">Testing and verification</h2>
              <table className="spec-table spec-table--stack test-table">
                <caption>Test suite and the conditions it ran under</caption>
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
                  <tr>
                    <th scope="row">Backend (pytest)</th>
                    <td className="num" data-label="Runs">
                      161
                    </td>
                    <td data-label="Result">All passed</td>
                    <td data-label="Conditions" className="muted">
                      Run for this page on 20 October 2026 with Python 3.14.4 on Windows 11. Unit, API
                      integration, security-boundary and determinism tests; no network.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Frontend</th>
                    <td className="num" data-label="Runs">
                      None
                    </td>
                    <td data-label="Result">Not automated</td>
                    <td data-label="Conditions" className="muted">
                      Frontend unit tests and a browser test in CI are on the roadmap.
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="spec-table spec-table--stack">
                <caption>What the tests cover</caption>
                <thead>
                  <tr>
                    <th scope="col">File</th>
                    <th scope="col">Covers</th>
                  </tr>
                </thead>
                <tbody>
                  {testFiles.map(([file, covers]) => (
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
                <caption>Default operating limits, each overridable by an environment variable</caption>
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
                <p>What is built and what is still open, from the project’s roadmap. Open items are not started.</p>
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
                <a className="button button--primary" href={dataSentryRepo} rel="noopener">
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
