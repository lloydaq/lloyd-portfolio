import type { Certification, Education, Entry } from '../content/resume';

/** Building blocks shared by the home page's résumé section and the printable /resume/ page. */

export function EducationList({ items }: { items: Education[] }) {
  return (
    <ul className="cv-list cv-list--edu">
      {items.map((e) => (
        <li key={e.title} className="cv-item">
          <p className="cv-item__title">{e.title}</p>
          <p className="cv-item__meta">
            {e.school} <span aria-hidden="true">·</span> {e.detail}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function EntryList({ items }: { items: Entry[] }) {
  return (
    <ul className="cv-list">
      {items.map((e) => (
        <li key={e.title} className="cv-item">
          <p className="cv-item__title">
            {e.title} <span className="cv-item__context">· {e.context}</span>
          </p>
          {e.role && <p className="cv-item__meta">{e.role}</p>}
          {e.points.length > 0 && (
            <ul className="cv-points">
              {e.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export function CertificationList({ items }: { items: Certification[] }) {
  return (
    <ul className="cv-list">
      {items.map((c) => (
        <li key={c.name} className="cv-item">
          <p className="cv-item__title">
            {c.name} <span className="cv-item__context">· {c.issuer}</span>
          </p>
          <p className="cv-item__meta">
            {c.when} <span aria-hidden="true">·</span> {c.detail}
          </p>
        </li>
      ))}
    </ul>
  );
}
