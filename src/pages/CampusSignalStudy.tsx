import { Footer } from '../components/Footer';
import { NextProject } from '../components/NextProject';
import { Header } from '../components/Header';
import { KineticGrid } from '../components/KineticGrid';
import { ArrowLeft, ArrowUpRight, GitHub } from '../components/Icons';
import { FullSizeLink, SIZES_GALLERY_LEAD, SIZES_GALLERY_TILE, ThemedShot } from '../components/ThemedShot';
import { useActiveSection } from '../components/useActiveSection';
import {
  campusSignal,
  decisions,
  issueTransitions,
  limitations,
  modules,
  roadmap,
  screenshots,
  securityPoints,
} from '../content/campussignal';
import { campusSignalRepo } from '../content/site';

const toc = [
  { id: 'problem', label: 'Problem' },
  { id: 'users', label: 'Intended users' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'isolation', label: 'College isolation' },
  { id: 'issues', label: 'Campus issues' },
  { id: 'decisions', label: 'Engineering decisions' },
  { id: 'security', label: 'Security' },
  { id: 'testing', label: 'Testing' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'future', label: 'Future work' },
] as const;

const tocIds = toc.map((t) => t.id);

const requestPath = [
  ['Session', 'An HttpOnly cookie identifies the signed-in user; writes also need the CSRF token and a same-site Origin'],
  ['Membership', 'The user’s one active membership fixes the college; nothing in the request can change it'],
  ['Repository', 'Every query is scoped to that college_id'],
  ['Policy', 'One function in app/policies/ decides each permission, for lists, counts and single reads alike'],
  ['Answer', 'Anything outside the college answers 404, the same as something that does not exist'],
] as const;

export function CampusSignalStudy() {
  const active = useActiveSection(tocIds);

  return (
    <>
      <KineticGrid />
      <div className="read-progress" aria-hidden="true" />
      <Header base="/" />
      <main id="main" className="case">
        <header className="case__head container">
          <a className="back-link" href="/#campussignal">
            <ArrowLeft /> Back to the portfolio
          </a>
          <h1 className="case__title">
            {/* The name is one long word in a wide face: let it break between its parts on phones. */}
            Campus<wbr />Signal: {campusSignal.tagline}
          </h1>
          <p className="case__summary">{campusSignal.summary}</p>
          <dl className="kv case__meta">
            <div className="kv__row">
              <dt>Role</dt>
              <dd>Sole developer: requirements, architecture, backend, database, frontend, tests</dd>
            </div>
            <div className="kv__row">
              <dt>Stack</dt>
              <dd>{campusSignal.stack}</dd>
            </div>
            <div className="kv__row">
              <dt>Progress</dt>
              <dd>Phases 0–6 done; 7 and 8 built and merged, awaiting review; 9 and 10 (hardening, deployment) to come</dd>
            </div>
            <div className="kv__row">
              <dt>Status</dt>
              <dd>Runs locally with fictional demo colleges. Not deployed, so there is no live demo.</dd>
            </div>
          </dl>
          <div className="actions case__actions">
            <a className="button button--primary" href={campusSignalRepo} rel="noopener">
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
                  Students and staff juggle disconnected college websites, messaging groups and notice boards.
                  An urgent notice gets buried in a chat, a broken projector is reported to whoever is nearby
                  and never followed up, and timetables and attendance live somewhere else again.
                </p>
                <p>
                  CampusSignal brings notices, department pages, a moderated community, academic records and
                  problem reporting into one place, for many colleges at once, without any college ever
                  seeing another’s data.
                </p>
              </div>
              <p className="callout">{campusSignal.disclaimer}</p>
            </section>

            <section id="users" className="case__section" aria-labelledby="users-h">
              <h2 id="users-h">Intended users</h2>
              <div className="prose">
                <p>
                  Students, faculty and staff of a college, each seeing what their role allows: students read
                  notices, follow their classes and report problems; faculty record attendance and results
                  for the sections they teach; college and department admins publish, triage and moderate.
                  Platform operators onboard colleges but cannot read any college’s data.
                </p>
              </div>
            </section>

            <section id="architecture" className="case__section" aria-labelledby="architecture-h">
              <h2 id="architecture-h">Architecture</h2>
              <div className="prose">
                <p>
                  A modular monolith: one FastAPI backend with routers, policies, services and repositories
                  over PostgreSQL, and a React single-page app served from the same origin. There is no Redis,
                  queue or WebSocket server; an hourly jobs command handles the retention purges.
                </p>
              </div>
              <table className="spec-table spec-table--stack">
                <caption>Product areas and the backend modules that own them, under backend/app/</caption>
                <thead>
                  <tr>
                    <th scope="col">Area</th>
                    <th scope="col">What it does</th>
                    <th scope="col">Module</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map(([area, does, file]) => (
                    <tr key={area}>
                      <th scope="row">{area}</th>
                      <td data-label="What it does">{does}</td>
                      <td data-label="Module">
                        <code className="file">{file}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section id="isolation" className="case__section" aria-labelledby="isolation-h">
              <h2 id="isolation-h">College isolation</h2>
              <div className="prose">
                <p>
                  Isolation is the core requirement, so it is enforced at every layer a request passes
                  through, and the database backs it up with composite foreign keys.
                </p>
              </div>
              <table className="spec-table spec-table--stack">
                <caption>How a campus request is scoped</caption>
                <thead>
                  <tr>
                    <th scope="col">Layer</th>
                    <th scope="col">What it enforces</th>
                  </tr>
                </thead>
                <tbody>
                  {requestPath.map(([layer, does]) => (
                    <tr key={layer}>
                      <th scope="row">{layer}</th>
                      <td data-label="What it enforces">{does}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section id="issues" className="case__section" aria-labelledby="issues-h">
              <h2 id="issues-h">Campus issues</h2>
              <div className="prose">
                <p>
                  A reported problem follows a fixed lifecycle, written as a pure transition table with no
                  database code so every transition can be tested on its own. The reporter is notified of
                  every status change, and internal notes never reach them.
                </p>
              </div>
              <table className="spec-table spec-table--stack">
                <caption>Transitions, from services/issues/state_machine.py</caption>
                <thead>
                  <tr>
                    <th scope="col">Change</th>
                    <th scope="col">Who may make it</th>
                    <th scope="col">Note required</th>
                  </tr>
                </thead>
                <tbody>
                  {issueTransitions.map(([change, who, note]) => (
                    <tr key={change}>
                      <th scope="row">{change}</th>
                      <td data-label="Who may make it">{who}</td>
                      <td data-label="Note required">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="case__gallery">
                {screenshots.map((shot, i) => (
                  <figure key={shot.light} className={`figure${i === 0 ? ' case__gallery-lead' : ''}`}>
                    <div className="figure__frame">
                      <ThemedShot shot={shot} sizes={i === 0 ? SIZES_GALLERY_LEAD : SIZES_GALLERY_TILE} />
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
                      1,410
                    </td>
                    <td data-label="Result">All passed</td>
                    <td data-label="Conditions" className="muted">
                      Run on 10 November 2026 with Python 3.12 on Linux, unit and database integration tests
                      together, against a disposable local PostgreSQL 16 (the project targets 17). Includes the
                      tenant-isolation suite and the route-inventory check.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Frontend (Vitest)</th>
                    <td className="num" data-label="Runs">
                      355
                    </td>
                    <td data-label="Result">All passed</td>
                    <td data-label="Conditions" className="muted">
                      Same day, Node 22: components, the API client, theme and a WCAG colour-contrast suite.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Browser (Playwright + axe)</th>
                    <td className="num" data-label="Runs">
                      None
                    </td>
                    <td data-label="Result">Not run for this page</td>
                    <td data-label="Conditions" className="muted">
                      The project runs them in CI at 1280 and 390 px, failing on any WCAG A/AA violation axe
                      finds, plus full-stack journeys against a real API, database and mail catcher.
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
                <p>
                  Where each phase stands, from the project’s Phases.md. A phase is marked done only when its
                  definition of done is verified.
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
                <a className="button button--primary" href={campusSignalRepo} rel="noopener">
                  <GitHub /> Read the code on GitHub <ArrowUpRight />
                </a>
                <a className="button" href="/#contact">
                  Get in touch
                </a>
              </div>
            </section>
          </div>
        </div>
        <NextProject current="campussignal" />
      </main>
      <Footer />
    </>
  );
}
