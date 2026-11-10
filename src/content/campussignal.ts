import type { Screenshot } from './site';

// Everything on this page was checked against the CampusSignal-pro repository at
// commit 618458d (github.com/lloydaq/CampusSignal-pro): its code, tests, PRD.md,
// architecture.md and Phases.md. Where the README's feature table lags the code
// (it still lists the community and Academic Hub as planned), the code and
// Phases.md win. File paths are relative to that repository.

export const campusSignal = {
  name: 'CampusSignal',
  tagline: 'One platform for many colleges',
  summary:
    'A multi-college campus platform: official notices, department pages, a moderated student community, academic records and campus problem reporting in one place. Every college gets its own private space, and the server enforces on every request that people only ever see their own college.',
  stack:
    'Python, FastAPI, SQLAlchemy 2, Alembic, Pydantic, PostgreSQL; React 19, TypeScript, Vite, Tailwind CSS, TanStack Query',
  disclaimer:
    'CampusSignal is not deployed and has no real users. Every college, person and record in it is fictional demo data, labelled as such on every screen, and it never connects to a college’s own systems.',
} as const;

export const features = [
  ['Stack', campusSignal.stack],
  ['Built', 'Accounts and sessions; colleges, roles and joining; notices and notifications; campus issues; community with moderation; Academic Hub; role-based home screens'],
  ['Tenancy', 'Shared schema; the college comes from the signed-in member’s membership, never from the request'],
  ['Security', 'Server-side sessions, CSRF and Origin checks, Argon2id passwords, one policy module for every permission'],
  ['Tests', 'pytest with a tenant-isolation suite, Vitest, Playwright with axe accessibility checks'],
  ['Status', 'Phases 0–6 done; 7 and 8 built and merged, awaiting review; not deployed'],
] as const;

export interface Decision {
  title: string;
  why: string;
  cost: string;
}

/** From architecture.md §23 (the ADRs), in the project's own words where possible. */
export const decisions: Decision[] = [
  {
    title: 'The college comes from the session',
    why: 'Campus routes never accept a college from the client. The server derives it from the signed-in user’s active membership, so a request cannot be pointed at another college by editing it (ADR-03).',
    cost: 'A person can belong to only one college at a time; several memberships would need a redesign.',
  },
  {
    title: 'Another college’s data does not exist',
    why: 'Reading anything in another college answers 404, exactly like something that was never there, so nothing leaks by existence. Lists, counts and single reads all go through the same policies.',
    cost: 'Every route has to answer “not yours” exactly as it answers “not there”, which the tenant-isolation suite checks route by route.',
  },
  {
    title: 'One shared schema, keyed by college',
    why: 'College-scoped tables carry college_id with composite (college_id, id) foreign keys, so the database itself refuses a row that points into another college (ADR-02).',
    cost: 'Isolation depends on application discipline and tests; row-level security in PostgreSQL is deferred (ADR-10).',
  },
  {
    title: 'Sessions on the server',
    why: 'Sessions live in PostgreSQL behind HttpOnly cookies, so signing out or changing a role takes effect at once. Faculty and admin sessions expire sooner: 24 hours idle, 7 days at most (ADR-04, ADR-12).',
    cost: 'One database read per request.',
  },
  {
    title: 'No extra infrastructure',
    why: 'Rate limits are counted in the database, notifications are fetched by polling every 60 seconds, and an hourly jobs command does the retention purges (ADR-05, 06, 07).',
    cost: 'A notification can take up to a minute to appear, and there is no real-time feed.',
  },
];

/** Product areas and where each lives. */
export const modules = [
  ['Accounts and sessions', 'Registration, email verification, sign-in, password reset, CSRF-protected sessions', 'services/auth.py'],
  ['Colleges and roles', 'Students join by roll number against the roster, staff by invitation; approval queue; college and department admins', 'services/members.py, invites.py'],
  ['Notices', 'College and department notices with drafts, urgent pins, expiry and withdrawal; department pages; in-app notifications', 'api/v1/notices.py'],
  ['Campus issues', 'Report a problem and follow it; coordinators triage, assign and mark duplicates; internal notes', 'services/issues/'],
  ['Community', 'College and department feeds, comments, reactions, reports and moderation with reasons', 'services/community.py'],
  ['Academic Hub', 'Terms, sections, timetables, attendance with an edit window, assessments and published results', 'services/academic_setup.py, attendance.py'],
  ['Home', 'Role-based home screens: urgent notices, today’s classes, attendance, open issues', 'services/home.py'],
] as const;

/** The campus issue lifecycle, from services/issues/state_machine.py. */
export const issueTransitions = [
  ['Submitted → Acknowledged', 'Coordinator or college admin', 'No'],
  ['Acknowledged → In progress', 'Coordinator, college admin or the assignee', 'No'],
  ['In progress → Resolved', 'Coordinator, college admin or the assignee', 'Yes'],
  ['Submitted or Acknowledged → Rejected', 'Coordinator or college admin; a duplicate links its original', 'Yes'],
  ['Resolved → Acknowledged (reopen)', 'Staff, or the reporter twice within 14 days', 'Yes'],
] as const;

export const securityPoints = [
  'Every permission decision lives in one place, backend/app/policies/, and the routes check again whatever the page sends.',
  'Every campus route is in a tenant-isolation test suite, and a route-inventory test fails if a new route skips it.',
  'State-changing requests need the session’s CSRF token and a same-site Origin; passwords are hashed with Argon2id.',
  'An audit log records administrative actions and is append-only, enforced by a database trigger.',
  'Responses to join requests are the same whatever the reason, so roll numbers cannot be probed.',
  'No uploads in this version, which keeps a whole class of attacks out of scope (ADR-11).',
] as const;

export const limitations = [
  'Not deployed: the staging deployment was deferred, so there is no live demo.',
  'Demo data only. Real student or college data waits for a pilot college and a data agreement.',
  'One active college membership per person.',
  'Isolation is enforced by the application and its tests; PostgreSQL row-level security is not used yet.',
  'Notifications arrive by polling, up to 60 seconds late; there is no real-time feed.',
  'No file uploads, so an issue report cannot carry a photo.',
  'No licence has been chosen yet, so the code is all rights reserved.',
] as const;

export type ItemStatus = 'done' | 'open';

/** Phases.md, as of commit 618458d. */
export const roadmap: { text: string; status: ItemStatus }[] = [
  { text: 'Phases 0–1: requirements, architecture, design system, backend, frontend shell and CI', status: 'done' },
  { text: 'Phase 2: accounts, email verification, sessions, password reset, platform admins', status: 'done' },
  { text: 'Phase 3: colleges, departments, roster, joining and approval, roles, tenant isolation', status: 'done' },
  { text: 'Phase 4: notices, department pages, in-app notifications', status: 'done' },
  { text: 'Phase 5: campus issues, the coordinator queue, assignment, duplicates', status: 'done' },
  { text: 'Phase 6: community feeds, reports and moderation', status: 'done' },
  { text: 'Phase 7: Academic Hub (built; its second policy review is outstanding)', status: 'open' },
  { text: 'Phase 8: home screens and profile (built; awaiting review)', status: 'open' },
  { text: 'Phase 9: hardening for security, accessibility, responsiveness and performance', status: 'open' },
  { text: 'Phase 10: deployment and the MVP release', status: 'open' },
];

// Captured with scripts/project-shots.mjs from CampusSignal running locally against a
// disposable PostgreSQL with its own `seed-demo` data. The demo student, issue, notices
// and posts were created through the app's API as the fictional demo accounts.
export const screenshots: Screenshot[] = [
  {
    light: '/campussignal/campussignal-home-light.png',
    dark: '/campussignal/campussignal-home-dark.png',
    width: 2880,
    height: 1800,
    alt: 'CampusSignal student home for the demo college Mangalore Institute of Technology and Engineering, labelled as demo data: an urgent examination notice, today’s class CS302 Database Management Systems at 11:00, an empty attendance summary, and one open issue in progress.',
    caption:
      'A student’s home in a demo college: the urgent notice, today’s class, attendance and their open issue, each from its own module.',
  },
  {
    light: '/campussignal/campussignal-issue-light.png',
    dark: '/campussignal/campussignal-issue-dark.png',
    width: 2880,
    height: 1800,
    alt: 'CampusSignal issue page for “Projector in room 204 keeps switching off”: in progress, handled by Deepa Bhat, a progress line from submitted through acknowledged to in progress, and a timeline of the report, the acknowledgement note, the assignment and the move to in progress.',
    caption:
      'A reported problem followed through its lifecycle. Nothing resolves itself: closing an issue takes a person and a note.',
  },
  {
    light: '/campussignal/campussignal-notices-light.png',
    dark: '/campussignal/campussignal-notices-dark.png',
    width: 2880,
    height: 1800,
    alt: 'CampusSignal notices: an urgent examination notice pinned above the latest notices, which include a college event, a high-priority Computer Science department notice and a facilities notice, with filters by category and department.',
    caption:
      'Official notices, urgent ones pinned first. A department notice reaches that department’s members and the college’s admins only.',
  },
];
