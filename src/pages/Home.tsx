import { useEffect, useState } from 'react';
import { Ticks } from '../components/Code';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { KineticGrid } from '../components/KineticGrid';
import { ArrowDown, ArrowUpRight, Check, Copy, GitHub, LinkedIn, Mail } from '../components/Icons';
import { FullSizeLink, ThemedShot } from '../components/ThemedShot';
import { useActiveSection } from '../components/useActiveSection';
import * as cs from '../content/campussignal';
import * as ds from '../content/datasentry';
import * as fc from '../content/flowcast';
import {
  campusSignalPath,
  campusSignalRepo,
  caseStudyPath,
  dataSentryPath,
  dataSentryRepo,
  flowCastPath,
  flowCastRepo,
  homeSections,
  profile,
  skills,
  tndRepo,
  type Screenshot,
} from '../content/site';
import * as tndContent from '../content/tnd';

const { principles, tnd } = tndContent;

const sectionIds = homeSections.map((s) => s.id);

// The hero's at-a-glance list: what each project is, what it is built with, and how it can be seen.
const projectIndex = [
  {
    id: 'tnd',
    name: `${tnd.name} (${tnd.short})`,
    tagline: 'Checks the claims in a news article against evidence it retrieves',
    stack: 'FastAPI · Ollama · Trafilatura',
    status: `${tnd.version} · runs locally`,
  },
  {
    id: 'datasentry',
    name: ds.dataSentry.name,
    tagline: ds.dataSentry.tagline,
    stack: 'FastAPI · pandas · scikit-learn',
    status: `${ds.dataSentry.version} · runs locally`,
  },
  {
    id: 'flowcast',
    name: fc.flowCast.name,
    tagline: fc.flowCast.tagline,
    stack: 'LightGBM · PyTorch · React',
    status: 'v1.0.0 · public demo',
  },
  {
    id: 'campussignal',
    name: cs.campusSignal.name,
    tagline: cs.campusSignal.tagline,
    stack: 'FastAPI · PostgreSQL · React',
    status: 'Demo data · not deployed',
  },
] as const;

function CopyEmail() {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 2400);
  };
  return (
    <>
      <button type="button" className="icon-button" onClick={copy} aria-label="Copy email address">
        {state === 'copied' ? <Check /> : <Copy />}
      </button>
      <span className="contact__status" role="status">
        {state === 'copied' && 'Email address copied.'}
        {state === 'failed' && 'Copy failed. Select the address instead.'}
      </span>
    </>
  );
}

interface ProjectProps {
  id: string;
  title: string;
  summary: string;
  shot: Screenshot;
  figure: number;
  features: readonly (readonly [string, string])[];
  decisions: readonly { title: string; why: string }[];
  note: string;
  caseStudy: string;
  repo: string;
  /** A public demo, when the project has one. */
  demo?: string;
}

// One project as a datasheet entry: description, a real screenshot that
// follows the site theme, characteristics, design rationale and links.
function Project({ id, title, summary, shot, figure, features, decisions, note, caseStudy, repo, demo }: ProjectProps) {
  const titleId = `${id}-title`;
  return (
    <article className="project" id={id} aria-labelledby={titleId}>
      <div className="project__head">
        <h3 id={titleId} className="project__title">
          {title}
        </h3>
        <p className="project__summary">{summary}</p>
      </div>

      <figure className="figure project__shot">
        <div className="figure__frame">
          <ThemedShot shot={shot} />
        </div>
        <figcaption>
          <b>Figure {figure}.</b> {shot.caption}
          <FullSizeLink shot={shot} />
        </figcaption>
      </figure>

      <div className="project__grid">
        <div>
          <h4 className="sub-title">Characteristics</h4>
          <dl className="kv">
            {features.map(([key, value]) => (
              <div key={key} className="kv__row">
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h4 className="sub-title">Why it is built this way</h4>
          <ul className="decision-list">
            {decisions.slice(0, 3).map((d) => (
              <li key={d.title}>
                <strong>{d.title}.</strong> {d.why}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="project__note">{note}</p>

      <div className="actions project__actions">
        {/* Each project has the same two actions, so the label names the project. */}
        <a className="button button--primary" href={caseStudy} aria-label={`Read the case study: ${title}`}>
          Read the case study
        </a>
        <a className="button" href={repo} rel="noopener" aria-label={`View the repository: ${title}`}>
          <GitHub /> View the repository <ArrowUpRight />
        </a>
        {demo && (
          <a className="button" href={demo} rel="noopener" aria-label={`Open the live demo: ${title}`}>
            Open the live demo <ArrowUpRight />
          </a>
        )}
      </div>
    </article>
  );
}

export function Home() {
  const active = useActiveSection(sectionIds);

  // The page is rendered by script, after the browser's own jump to a #fragment, so a link
  // such as /#flowcast (each case study's back link) would land at the top. Jump once on load.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <>
      <KineticGrid />
      <Header base="" activeId={active} />
      <main id="main">
        {/* ---------- Hero ---------- */}
        <section className="hero container" id="top" aria-labelledby="hero-name">
          <div className="hero__intro">
            <p className="hero__eyebrow">{profile.role}</p>
            <h1 id="hero-name" className="hero__name">
              {profile.name}
            </h1>
            <p className="hero__statement">I build AI software that shows its&nbsp;work.</p>
            <p className="hero__desc">
              AI/ML engineering student working on applied machine learning and backend systems. TND checks
              the claims in a news article against evidence it retrieves, and says plainly when it cannot
              tell. DataSentry explains the problems in a training dataset. FlowCast forecasts highway
              traffic and checks every forecast against what happened. CampusSignal serves many colleges on
              one platform without any of them seeing another’s data.
            </p>
            <div className="actions hero__actions">
              <a className="button button--primary" href="#projects">
                Explore projects <ArrowDown />
              </a>
              <a className="button" href={profile.github} rel="me noopener">
                <GitHub /> View GitHub
              </a>
              <a className="button button--text" href="#contact">
                Contact me
              </a>
            </div>
          </div>
          <nav className="hero__index" aria-labelledby="index-title">
            <h2 id="index-title" className="hero__index-title">
              Project index
            </h2>
            <ol className="index-list">
              {projectIndex.map((p, i) => (
                <li key={p.id}>
                  <a className="index-card" href={`#${p.id}`}>
                    <span className="index-card__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="index-card__body">
                      <span className="index-card__name">{p.name}</span>
                      <span className="index-card__tagline">{p.tagline}</span>
                      <span className="index-card__meta">
                        <span>{p.stack}</span>
                        <span className="index-card__status">{p.status}</span>
                      </span>
                    </span>
                    <ArrowDown />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        {/* ---------- Projects ---------- */}
        <section className="section" id="projects" aria-labelledby="projects-title">
          <div className="container">
            <div className="section__head">
              <h2 id="projects-title" className="section__title">
                Projects
              </h2>
              <p className="section__lede">
                Four projects, each built end to end: the service, the checks around it, the interface that
                explains what it found, and the tests. FlowCast has a public demo; the others run locally.
              </p>
            </div>

            <Project
              id="tnd"
              title={tnd.name}
              summary={tnd.summary}
              shot={tndContent.screenshots[0]!}
              figure={1}
              features={tndContent.features}
              decisions={tndContent.decisions}
              note={tnd.disclaimer}
              caseStudy={caseStudyPath}
              repo={tndRepo}
            />
            <Project
              id="datasentry"
              title={ds.dataSentry.name}
              summary={ds.dataSentry.summary}
              shot={ds.screenshots[0]!}
              figure={2}
              features={ds.features}
              decisions={ds.decisions}
              note={ds.dataSentry.disclaimer}
              caseStudy={dataSentryPath}
              repo={dataSentryRepo}
            />
            <Project
              id="flowcast"
              title={fc.flowCast.name}
              summary={fc.flowCast.summary}
              shot={fc.screenshots[0]!}
              figure={3}
              features={fc.features}
              decisions={fc.decisions}
              note={fc.flowCast.disclaimer}
              caseStudy={flowCastPath}
              repo={flowCastRepo}
              demo={fc.flowCast.demo}
            />
            <Project
              id="campussignal"
              title={cs.campusSignal.name}
              summary={cs.campusSignal.summary}
              shot={cs.screenshots[0]!}
              figure={4}
              features={cs.features}
              decisions={cs.decisions}
              note={cs.campusSignal.disclaimer}
              caseStudy={campusSignalPath}
              repo={campusSignalRepo}
            />
          </div>
        </section>

        {/* ---------- Engineering ---------- */}
        <section className="section" id="engineering" aria-labelledby="engineering-title">
          <div className="container">
            <div className="section__head">
              <h2 id="engineering-title" className="section__title">
                How I work
              </h2>
              <p className="section__lede">
                Five rules I hold myself to, each with the place in TND where you can check it.
              </p>
            </div>

            <table className="spec-table spec-table--stack principles">
              <thead>
                <tr>
                  <th scope="col">Principle</th>
                  <th scope="col">What it means in TND</th>
                  <th scope="col">Where to look</th>
                </tr>
              </thead>
              <tbody>
                {principles.map((p) => (
                  <tr key={p.name}>
                    <th scope="row">{p.name}</th>
                    <td data-label="What it means in TND">{p.inTnd}</td>
                    <td data-label="Where to look">
                      <Ticks text={p.evidence} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="toolchain">
              <h3 className="sub-title">Toolchain</h3>
              <p className="muted toolchain__note">
                Listed where there is code to point at, in these four projects or this site.
              </p>
              <dl className="toolchain__groups">
                {skills.map((group) => (
                  <div key={group.name} className="toolchain__group">
                    <dt>{group.name}</dt>
                    {group.items.map((item) => (
                      <dd key={item}>{item}</dd>
                    ))}
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ---------- About ---------- */}
        <section className="section" id="about" aria-labelledby="about-title">
          <div className="container about">
            <h2 id="about-title" className="section__title">
              About
            </h2>
            <div className="prose about__body">
              <p>
                I’m an AI/ML engineering student interested in applied AI, backend systems, and building
                complete applications: not just a model, but the input handling, the checks around it, and
                the interface that explains what it found.
              </p>
              <p>
                TND is the clearest example so far. I built it end to end, from the FastAPI service and the
                evidence pipeline to the frontend and the test suites, and tagged version 1.0.0 in October
                2026. It runs a language model locally, checks its output against retrieved evidence, and
                reports what failed instead of hiding it.
              </p>
              <p>
                DataSentry applies the same habit to training data. It profiles a CSV, screens it for
                leakage and label problems, and reports each finding with its evidence and its limits,
                instead of a single score that could hide the one problem that matters.
              </p>
              <p>
                FlowCast is the same habit applied to model evaluation: every model scored on identical
                rows, features tested so they cannot see the future, and a bootstrap that says where the
                best model is not actually better. CampusSignal is a larger system, many colleges on one
                platform, where the hard part is making sure none of them can ever see another’s data.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Contact ---------- */}
        <section className="section contact" id="contact" aria-labelledby="contact-title">
          <div className="container">
            <div className="section__head">
              <h2 id="contact-title" className="section__title">
                Contact
              </h2>
              <p className="section__lede">
                Email is the quickest way to reach me. I’m glad to talk about any of these projects, applied AI,
                or backend work.
              </p>
            </div>
            <ul className="contact__list">
              <li className="contact__row">
                <Mail />
                <span className="contact__kind">Email</span>
                <a className="contact__link" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
                <CopyEmail />
              </li>
              <li className="contact__row">
                <GitHub />
                <span className="contact__kind">GitHub</span>
                <a className="contact__link" href={profile.github} rel="me noopener">
                  github.com/lloydaq
                </a>
              </li>
              <li className="contact__row">
                <LinkedIn />
                <span className="contact__kind">LinkedIn</span>
                <a className="contact__link" href={profile.linkedin} rel="me noopener">
                  linkedin.com/in/lloyddso
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
