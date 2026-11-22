import { useLayoutEffect } from 'react';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { KineticGrid } from '../components/KineticGrid';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Copy, Download, GitHub, LinkedIn, Mail } from '../components/Icons';
import { ThemedShot } from '../components/ThemedShot';
import { switchTheme } from '../components/themeSwitch';
import { useActiveSection } from '../components/useActiveSection';
import { useCopy } from '../components/useCopy';
import { projectSummaryText, type Summary } from '../content/summary';
import * as cs from '../content/campussignal';
import * as ds from '../content/datasentry';
import * as fc from '../content/flowcast';
import * as ink from '../content/inkshift';
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
import { RESUME_PAGE, RESUME_PDF } from '../content/resume';
import * as tndContent from '../content/tnd';

const { tnd } = tndContent;

const sectionIds = homeSections.map((s) => s.id);

// The hero's at-a-glance list (desktop): what each project is, what it is built with, and how it can be seen.
const projectIndex = [
  {
    id: 'tnd',
    name: `${tnd.name} (${tnd.short})`,
    tagline: tnd.tagline,
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
  {
    id: 'inkshift',
    name: ink.inkshift.name,
    tagline: ink.inkshift.tagline,
    stack: 'TypeScript · React · npm',
    status: `v${ink.inkshift.npmVersion} on npm · open source`,
  },
] as const;

/** The three principles shown on the home page; the full table, with where to check each in TND, is in its case study. */
const howIWork = [
  ['Evidence over assumptions', 'Every result says what it was based on, and missing evidence is never treated as proof.'],
  ['Honest about incompleteness', 'When part of a system fails, the output says what is missing instead of looking complete.'],
  ['Tests before claims', 'Nothing goes in a README, or on this page, unless the code or a test backs it.'],
] as const;

function CopyEmail() {
  const [state, copy] = useCopy();
  return (
    <>
      <button type="button" className="icon-button" onClick={() => copy(profile.email)} aria-label="Copy email address">
        {state === 'copied' ? <Check /> : <Copy />}
      </button>
      <span className="contact__status" role="status">
        {state === 'copied' && 'Email address copied.'}
        {state === 'failed' && 'Copy failed. Select the address instead.'}
      </span>
    </>
  );
}

interface ProjectProps extends Summary {
  id: string;
  /** One sentence: what it does, in plain words. */
  pitch: string;
  tags: readonly string[];
  shot: Screenshot;
}

// One project as a compact card: a real screenshot that follows the theme, one sentence,
// three tags and its links. The depth (characteristics, decisions, limits) is in the case study.
function Project({ id, pitch, tags, shot, ...summary }: ProjectProps) {
  const { title, caseStudy, repo, demo } = summary;
  const titleId = `${id}-title`;
  const [state, copy] = useCopy();
  return (
    <article className="pcard" id={id} aria-labelledby={titleId}>
      <div className="figure__frame project__shot">
        <ThemedShot shot={shot} sizes="(min-width: 90rem) 660px, (min-width: 64rem) 46vw, 94vw" />
      </div>
      <div className="pcard__body">
        <div className="pcard__head">
          {/* Morphs into the case study's headline when its case study is opened (titleMorph.ts). */}
          <h3 id={titleId} className="pcard__title" data-morph={`title-${id}`} data-morph-href={caseStudy}>
            {title}
          </h3>
          <button
            type="button"
            className="icon-button pcard__copy"
            onClick={() => copy(projectSummaryText(summary, window.location.origin))}
            aria-label={`Copy summary: ${title}`}
            title="Copy a text summary"
          >
            {state === 'copied' ? <Check /> : <Copy />}
          </button>
        </div>
        <p className="pcard__pitch">{pitch}</p>
        <ul className="pcard__tags" aria-label="Key facts">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="pcard__actions">
          <a className="button button--primary" href={caseStudy} aria-label={`Read the case study: ${title}`}>
            Case study <ArrowRight />
          </a>
          <a className="button" href={repo} rel="noopener" aria-label={`View code: ${title}`}>
            <GitHub /> View code
          </a>
          {demo && (
            <a className="button" href={demo} rel="noopener" aria-label={`Open the live demo: ${title}`}>
              Live demo <ArrowUpRight />
            </a>
          )}
        </div>
        <span className="project__copy-status" role="status">
          {state === 'copied' && `Summary of ${title} copied.`}
          {state === 'failed' && 'Copy failed. Open the case study to select the text instead.'}
        </span>
      </div>
    </article>
  );
}

// The open-source library behind this site's theme switch: a wide card, with "Try it"
// playing the real thing from the button.
function InkshiftCard() {
  const { inkshift, inkshiftRepo, inkshiftNpm, screenshot } = ink;
  return (
    <article className="pcard pcard--wide" id="inkshift" aria-labelledby="inkshift-title">
      <div className="figure__frame project__shot">
        <ThemedShot shot={screenshot} sizes="(min-width: 90rem) 760px, (min-width: 64rem) 55vw, 94vw" />
      </div>
      <div className="pcard__body">
        <p className="pcard__kicker">Open source · npm</p>
        <h3 id="inkshift-title" className="pcard__title">
          {inkshift.name}
        </h3>
        <p className="pcard__pitch">{inkshift.pitch}</p>
        <ul className="pcard__tags" aria-label="Key facts">
          <li>npm v{inkshift.npmVersion}</li>
          <li>≈6 kB gzipped</li>
          <li>React + vanilla JS</li>
        </ul>
        <div className="pcard__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={(event) =>
              switchTheme(event.currentTarget, event.detail === 0 ? undefined : { x: event.clientX, y: event.clientY })
            }
            aria-label="Try it: switch the theme with Inkshift's ink"
          >
            Try it
          </button>
          <a className="button" href={inkshiftRepo} rel="noopener" aria-label={`View code: ${inkshift.name}`}>
            <GitHub /> View code
          </a>
          <a className="button" href={inkshiftNpm} rel="noopener" aria-label={`Open on npm: ${inkshift.name}`}>
            Open on npm <ArrowUpRight />
          </a>
        </div>
      </div>
    </article>
  );
}

export function Home() {
  const active = useActiveSection(sectionIds);

  // The page is rendered by script, after the browser's own jump to a #fragment, so a link
  // such as /#flowcast (each case study's back link) would land at the top. Jump once on load.
  // A layout effect, so the jump happens before the first paint: a page transition back from
  // a case study then lands on (and morphs into) the right card.
  useLayoutEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
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
              AI/ML engineering student building applied AI and backend systems that say plainly what they
              found, and what they could not check.
            </p>
            <p className="hero__open">
              <span className="hero__open-dot" aria-hidden="true" />
              <span>
                <strong>{profile.lookingFor}</strong>
                <span className="hero__open-where">{profile.workWhere}</span>
              </span>
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
                Four projects, each built end to end and tested, and one open-source library. Open a case
                study for the architecture, the decisions and the limits.
              </p>
            </div>

            <div className="pcard-grid">
              <Project
                id="tnd"
                title={tnd.name}
                pitch="Checks each claim in a news article against evidence it retrieves, and says plainly when it cannot tell."
                tags={['FastAPI', 'Local LLM (Ollama)', tnd.version]}
                shot={tndContent.screenshots[0]!}
                summary={tnd.summary}
                features={tndContent.features}
                caseStudy={caseStudyPath}
                repo={tndRepo}
              />
              <Project
                id="datasentry"
                title={ds.dataSentry.name}
                pitch="Finds leakage, label and quality problems in a training dataset, each with its evidence and its limits."
                tags={['pandas', 'scikit-learn', `v${ds.dataSentry.version}`]}
                shot={ds.screenshots[0]!}
                summary={ds.dataSentry.summary}
                features={ds.features}
                caseStudy={dataSentryPath}
                repo={dataSentryRepo}
              />
              <Project
                id="flowcast"
                title={fc.flowCast.name}
                pitch="Forecasts Los Angeles highway traffic up to an hour ahead and checks every forecast against what happened."
                tags={['LightGBM', 'DCRNN (PyTorch)', 'Live demo']}
                shot={fc.screenshots[0]!}
                summary={fc.flowCast.summary}
                features={fc.features}
                caseStudy={flowCastPath}
                repo={flowCastRepo}
                demo={fc.flowCast.demo}
              />
              <Project
                id="campussignal"
                title={cs.campusSignal.name}
                pitch="Many colleges on one platform, with the server making sure none of them can see another’s data."
                tags={['FastAPI', 'PostgreSQL', 'Multi-tenant']}
                shot={cs.screenshots[0]!}
                summary={cs.campusSignal.summary}
                features={cs.features}
                caseStudy={campusSignalPath}
                repo={campusSignalRepo}
              />
              <InkshiftCard />
            </div>
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
                Three rules I hold myself to.{' '}
                <a href={`${caseStudyPath}#principles`}>See where to check them in TND</a>.
              </p>
            </div>
            <ol className="how">
              {howIWork.map(([name, line], i) => (
                <li key={name} className="how__item">
                  <span className="how__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="how__name">{name}</h3>
                  <p className="how__line">{line}</p>
                </li>
              ))}
            </ol>

            <div className="toolchain">
              <h3 className="sub-title">Toolchain</h3>
              <dl className="toolchain__rows">
                {skills.map((group) => (
                  <div key={group.name} className="toolchain__row">
                    <dt>{group.name}</dt>
                    <dd>{group.items.join(' · ')}</dd>
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
                Across TND, DataSentry, FlowCast and CampusSignal the habit is the same: measure honestly, say
                where a result stops, and test it before claiming it.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Résumé ---------- */}
        <section className="section" id="resume" aria-labelledby="resume-title">
          <div className="container section__head resume-line">
            <h2 id="resume-title" className="section__title">
              Résumé
            </h2>
            <div>
              <p className="section__lede">
                BE in AI &amp; ML at MITE · CGPA 8.43 · finalist in two team hackathons · organised AIvibeX (118
                participants) · NPTEL Foundations of Virtual Reality (Elite)
              </p>
              <div className="actions resume__actions">
                <a className="button button--primary" href={RESUME_PDF} download="Lloyd-Dsouza-Resume.pdf">
                  <Download /> Download résumé (PDF)
                </a>
                <a className="button" href={RESUME_PAGE}>
                  View the full résumé <ArrowUpRight />
                </a>
              </div>
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
