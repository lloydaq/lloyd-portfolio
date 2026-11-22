import type { Certification, Education, Entry } from '../content/resume';

/** Building blocks shared by the home page's résumé section and the printable /resume/ page. */

export function EducationList({ items }: { items: Education[] }) {
  return (
    <ul className="cv-list cv-list--edu">
      {items.map((e) => (
        <li key={e.title} className="cv-item">
          {/* School and grade on the title's line, so the PDF text reads in order. */}
          <p className="cv-item__title">
            {e.title}{' '}
            <span className="cv-item__context">
              · {e.school} · {e.detail}
            </span>
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
            {c.when}
            {c.detail && (
              <>
                {' '}
                <span aria-hidden="true">·</span> {c.detail}
              </>
            )}
            {c.verify && (
              <>
                {' '}
                <span aria-hidden="true">·</span> Verify:{' '}
                {c.verify.map((v, i) => (
                  <span key={v.url}>
                    {i > 0 && ', '}
                    <a href={v.url}>{v.label}</a>
                  </span>
                ))}
              </>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
