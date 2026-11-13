import { profile } from './site';

export interface Summary {
  title: string;
  summary: string;
  features: readonly (readonly [string, string])[];
  caseStudy: string;
  repo: string;
  demo?: string;
}

/**
 * A plain-text summary of one project, for pasting into notes or an applicant tracking
 * system. Built from the same content as the page; links are absolute for this site.
 */
export function projectSummaryText({ title, summary, features, caseStudy, repo, demo }: Summary, origin: string): string {
  const field = (key: string) => features.find(([k]) => k === key)?.[1];
  return [
    title,
    '',
    summary,
    '',
    ...(field('Stack') ? [`Stack: ${field('Stack')}`] : []),
    ...(field('Status') ? [`Status: ${field('Status')}`] : []),
    `Case study: ${origin}${caseStudy}`,
    `Code: ${repo}`,
    ...(demo ? [`Live demo: ${demo}`] : []),
    '',
    `${profile.name}, ${profile.role} · ${profile.email}`,
  ].join('\n');
}
