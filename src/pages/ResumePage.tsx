import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { ArrowLeft, Download } from '../components/Icons';
import { KineticGrid } from '../components/KineticGrid';
import { CertificationList, EducationList, EntryList } from '../components/ResumeParts';
import {
  RESUME_PDF,
  certifications,
  education,
  hackathons,
  leadership,
  resume,
  resumeProjects,
  resumeSkills,
  spokenLanguages,
} from '../content/resume';
import { profile } from '../content/site';

const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '');

/**
 * The résumé as one printable sheet. On screen it sits on the site like any page; in
 * print (and in the PDF made from it by scripts/make-resume-pdf.mjs) only the sheet
 * remains, on light paper, sized for one A4 page.
 */
export function ResumePage() {
  return (
    <>
      <KineticGrid />
      <Header base="/" />
      <main id="main" className="container resume-page">
        <div className="resume-page__bar">
          <a className="back-link" href="/#resume">
            <ArrowLeft /> Back to the portfolio
          </a>
          <div className="actions">
            <a className="button button--primary" href={RESUME_PDF} download="Lloyd-DSouza-Resume.pdf">
              <Download /> Download PDF
            </a>
            <button type="button" className="button" onClick={() => window.print()}>
              Print
            </button>
          </div>
        </div>

        <article className="cv-sheet" aria-labelledby="cv-name">
          <header className="cv-sheet__head">
            <h1 id="cv-name" className="cv-sheet__name">
              {profile.name}
            </h1>
            <p className="cv-sheet__headline">{resume.headline}</p>
            <p className="cv-sheet__contact">
              <span>{resume.location}</span>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <a href={profile.linkedin}>{strip(profile.linkedin)}</a>
              <a href={profile.github}>{strip(profile.github)}</a>
              <a href="https://lloyd-portfolio-sand.vercel.app">lloyd-portfolio-sand.vercel.app</a>
            </p>
          </header>

          <section className="cv-section" aria-labelledby="cv-summary">
            <h2 id="cv-summary" className="cv-section__title">
              Summary
            </h2>
            <p>{resume.summary}</p>
          </section>

          <section className="cv-section" aria-labelledby="cv-education">
            <h2 id="cv-education" className="cv-section__title">
              Education
            </h2>
            <EducationList items={education} />
          </section>

          <section className="cv-section" aria-labelledby="cv-projects">
            <h2 id="cv-projects" className="cv-section__title">
              Projects
            </h2>
            <ul className="cv-list">
              {resumeProjects.map((p) => (
                <li key={p.id} className="cv-item">
                  <p className="cv-item__title">
                    {p.name} <span className="cv-item__context">· {p.status}</span>
                  </p>
                  <p className="cv-item__meta">{p.stack}</p>
                  <ul className="cv-points">
                    {p.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section className="cv-section" aria-labelledby="cv-hackathons">
            <h2 id="cv-hackathons" className="cv-section__title">
              Hackathons
            </h2>
            <EntryList items={hackathons} />
          </section>

          <div className="cv-columns">
            <section className="cv-section" aria-labelledby="cv-leadership">
              <h2 id="cv-leadership" className="cv-section__title">
                Leadership
              </h2>
              <EntryList items={leadership} />
            </section>
            <section className="cv-section" aria-labelledby="cv-cert">
              <h2 id="cv-cert" className="cv-section__title">
                Certification
              </h2>
              <CertificationList items={certifications} />
            </section>
          </div>

          <section className="cv-section" aria-labelledby="cv-skills">
            <h2 id="cv-skills" className="cv-section__title">
              Skills
            </h2>
            <dl className="cv-skills">
              {resumeSkills.map((g) => (
                <div key={g.name}>
                  <dt>{g.name}</dt>
                  <dd>{g.items.join(', ')}</dd>
                </div>
              ))}
              <div>
                <dt>Spoken</dt>
                <dd>{spokenLanguages.join(', ')}</dd>
              </div>
            </dl>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
