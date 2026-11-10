import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { KineticGrid } from '../components/KineticGrid';
import { ArrowLeft, ArrowUpRight, GitHub } from '../components/Icons';
import { FullSizeLink, ThemedShot } from '../components/ThemedShot';
import { useActiveSection } from '../components/useActiveSection';
import {
  decisions,
  flowCast,
  limitations,
  pipeline,
  results,
  roadmap,
  screenshots,
  securityPoints,
  significance,
} from '../content/flowcast';
import { flowCastRepo } from '../content/site';

const toc = [
  { id: 'problem', label: 'Problem' },
  { id: 'approach', label: 'Approach' },
  { id: 'results', label: 'Results' },
  { id: 'decisions', label: 'Engineering decisions' },
  { id: 'security', label: 'Security' },
  { id: 'testing', label: 'Testing' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'future', label: 'Future work' },
] as const;

const tocIds = toc.map((t) => t.id);

const dataset = [
  ['Source', 'METR-LA, Los Angeles County highway loop detectors'],
  ['Sensors', '207, with coordinates and a published directed road graph'],
  ['Resolution', 'One speed reading (mph) every 5 minutes'],
  ['Training', '1 March to 23 May 2012'],
  ['Validation', '23 May to 4 June 2012'],
  ['Test', '4 to 27 June 2012, the period the dashboard replays'],
  ['Missing readings', 'Recorded as 0 in the source; treated as missing and excluded from every loss and metric'],
] as const;

export function FlowCastStudy() {
  const active = useActiveSection(tocIds);

  return (
    <>
      <KineticGrid />
      <div className="read-progress" aria-hidden="true" />
      <Header base="/" />
      <main id="main" className="case">
        <header className="case__head container">
          <a className="back-link" href="/#flowcast">
            <ArrowLeft /> Back to the portfolio
          </a>
          <h1 className="case__title">
            {flowCast.name}: {flowCast.tagline}
          </h1>
          <p className="case__summary">{flowCast.summary}</p>
          <dl className="kv case__meta">
            <div className="kv__row">
              <dt>Role</dt>
              <dd>Sole developer: data pipeline, models, evaluation, API, dashboard, tests</dd>
            </div>
            <div className="kv__row">
              <dt>Stack</dt>
              <dd>{flowCast.stack}</dd>
            </div>
            <div className="kv__row">
              <dt>Release</dt>
              <dd>{flowCast.release}, MIT licence</dd>
            </div>
            <div className="kv__row">
              <dt>Status</dt>
              <dd>A public demo runs entirely in the browser on GitHub Pages; the full API runs locally.</dd>
            </div>
          </dl>
          <div className="actions case__actions">
            <a className="button button--primary" href={flowCast.demo} rel="noopener">
              Open the live demo <ArrowUpRight />
            </a>
            <a className="button" href={flowCastRepo} rel="noopener">
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
                  Traffic forecasts are easy to make look good. A model scored on easier rows than its rivals,
                  a feature that quietly reads a value from after the forecast time, or a dashboard that shows
                  something other than what was measured can each make the numbers better than the model.
                </p>
                <p>
                  FlowCast forecasts highway speed an hour ahead and is built so that each of those shortcuts
                  is closed off by a test or by construction, and so that every forecast can be checked
                  against what actually happened next.
                </p>
              </div>
              <p className="callout">{flowCast.disclaimer}</p>
            </section>

            <section id="approach" className="case__section" aria-labelledby="approach-h">
              <h2 id="approach-h">Data and approach</h2>
              <dl className="kv">
                {dataset.map(([key, value]) => (
                  <div key={key} className="kv__row">
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <table className="spec-table spec-table--stack">
                <caption>From the raw dataset to the dashboard</caption>
                <thead>
                  <tr>
                    <th scope="col">Step</th>
                    <th scope="col">What it does</th>
                    <th scope="col">Where</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.map(([step, does, where]) => (
                    <tr key={step}>
                      <th scope="row">{step}</th>
                      <td data-label="What it does">{does}</td>
                      <td data-label="Where">
                        <code className="file">{where}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section id="results" className="case__section" aria-labelledby="results-h">
              <h2 id="results-h">Results</h2>
              <div className="prose">
                <p>
                  Mean absolute error in mph on the test period, lower is better. Every model is scored on the
                  same rows with missing targets masked, and the test period was scored once per model.
                </p>
              </div>
              <table className="spec-table spec-table--stack">
                <caption>Test-period MAE (mph), from models/metrics/</caption>
                <thead>
                  <tr>
                    <th scope="col">Model</th>
                    <th scope="col" className="num">15 min</th>
                    <th scope="col" className="num">30 min</th>
                    <th scope="col" className="num">45 min</th>
                    <th scope="col" className="num">60 min</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(([model, ...mae]) => (
                    <tr key={model}>
                      <th scope="row">{model}</th>
                      {mae.map((value, i) => (
                        <td key={i} className="num" data-label={`${15 * (i + 1)} min`}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="case__h3">Is the graph model really better?</h3>
              <div className="prose">
                <p>
                  The gap between DCRNN and LightGBM is small, so it is tested rather than assumed: a 95%
                  day-block bootstrap with 2,000 resamples. A difference counts only when its interval excludes
                  zero. At 60 minutes it does not.
                </p>
              </div>
              <table className="spec-table spec-table--stack">
                <caption>DCRNN minus LightGBM, test period (negative means DCRNN is better)</caption>
                <thead>
                  <tr>
                    <th scope="col">Horizon</th>
                    <th scope="col" className="num">Gap (mph)</th>
                    <th scope="col">95% interval</th>
                    <th scope="col">Days DCRNN better</th>
                    <th scope="col">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {significance.map(([horizon, gap, interval, days, verdict]) => (
                    <tr key={horizon}>
                      <th scope="row">{horizon}</th>
                      <td className="num" data-label="Gap (mph)">
                        {gap}
                      </td>
                      <td data-label="95% interval">{interval}</td>
                      <td data-label="Days DCRNN better">{days}</td>
                      <td data-label="Verdict">{verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="case__gallery">
                {screenshots.map((shot, i) => (
                  <figure key={shot.light} className={`figure${i === 0 ? ' case__gallery-lead' : ''}`}>
                    <div className="figure__frame">
                      <ThemedShot shot={shot} />
                    </div>
                    <figcaption>
                      <b>Figure {i + 1}.</b> {shot.caption}
                      <FullSizeLink shot={shot} />
                    </figcaption>
                  </figure>
                ))}
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
              <h2 id="security-h">Security</h2>
              <ul className="limit-list">
                {securityPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>

            <section id="testing" className="case__section" aria-labelledby="testing-h">
              <h2 id="testing-h">Testing and verification</h2>
              <table className="spec-table spec-table--stack test-table">
                <caption>Suites run for this page, and the conditions they ran under</caption>
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
                      116
                    </td>
                    <td data-label="Result">105 passed, 11 skipped</td>
                    <td data-label="Conditions" className="muted">
                      Run on 10 November 2026 with Python 3.12.3 on Linux, without the 230 MB dataset or PyTorch:
                      the real-data tests and the DCRNN tests skip by design. All 31 API security tests passed.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Frontend (Vitest)</th>
                    <td className="num" data-label="Runs">
                      12
                    </td>
                    <td data-label="Result">10 passed, 2 skipped</td>
                    <td data-label="Conditions" className="muted">
                      Same day, Node 22. The two skipped tests check the static demo against exported data,
                      which needs the dataset. The TypeScript type-check passed.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">End-to-end (Playwright)</th>
                    <td className="num" data-label="Runs">
                      21
                    </td>
                    <td data-label="Result">Not run for this page</td>
                    <td data-label="Conditions" className="muted">
                      Flows on desktop and phone against the real API and the static build; they need the
                      dataset, so the project runs them locally rather than in CI.
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section id="limitations" className="case__section" aria-labelledby="limitations-h">
              <h2 id="limitations-h">Current limitations</h2>
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
                <a className="button button--primary" href={flowCastRepo} rel="noopener">
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
