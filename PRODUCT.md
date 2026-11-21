# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: React + TypeScript + Vite, static build, no backend. The owner listed this as a preference and did not answer the stack question; chosen because the site needs two routes (home and a TND case study) driven by one typed content file.

## Users

Primary: recruiters and hiring engineers who arrive from a résumé, LinkedIn, or GitHub and spend under a minute deciding whether Lloyd Dsouza is worth a conversation. Secondary: engineers who open the TND case study to judge technical depth and judgement.

## Product Purpose

A personal portfolio for Lloyd Dsouza, an AI/ML engineering student who builds practical AI applications and backend systems. It must show, within seconds, who he is and what he builds, and let a technical reader verify that through one real, well-documented project: TND.

Success: a visitor understands the role immediately, opens the TND case study or repository, and finds every claim traceable to code, tests, or documentation.

## Positioning

Most student portfolios list many projects and claim skills. This one makes one shipped project carry the proof: TND's own engineering choices (bounded inference, honest degradation, "insufficient evidence is not false", SSRF-hardened fetching, a tested heuristic instead of a fake probability) are the evidence of judgement.

## Operating Context

- Visitors come from links on a résumé, LinkedIn, or GitHub; often on a phone.
- Deployed on Vercel at https://lloyd-portfolio-sand.vercel.app (the default canonical URL).
- Content is static; no analytics, no forms, no backend.

## Capabilities and Constraints

- Featured project: **TND — Trustworthy News Detector** (canonical name per the TND app and its PRODUCT.md; the repo slug says "The News Detector"). Source: `C:\projects\TND`, public at https://github.com/lloydaq/TND-The-News-Detector, tagged v1.0.0.
- Verified TND facts: FastAPI backend; local Ollama inference (`llama3.2:3b` default); Trafilatura article extraction; GNews + GDELT evidence retrieval; per-claim verification; deterministic 0–100 heuristic risk score; `COMPLETE`/`DEGRADED` status with listed reasons; vanilla HTML/CSS/JS frontend with light/dark/system themes; pytest backend suite (159 passed on 2026-10-19, re-run during this build) and Playwright UI suite.
- TND has **no database**; results are held in browser `sessionStorage`. Never claim SQLite or persistence.
- TND is not deployed; no live demo exists. Local development is its deployment assumption.
- Featured projects (owner, 2026-11-10): TND, DataSentry, **FlowCast** (https://github.com/lloydaq/flowcast, v1.0.0, public demo on GitHub Pages) and **CampusSignal** (https://github.com/lloydaq/CampusSignal-pro; not deployed, demo data only). Link CampusSignal only through `CampusSignal-pro`, never the older `lloydaq/CampusSignal` repository. The site still must not list repositories dynamically.
- Also featured (owner, 2026-11-19): **Inkshift** (https://github.com/lloydaq/inkshift, https://www.npmjs.com/package/inkshift), this site's ink theme switch published as an MIT library. Claim only the npm version actually published (0.1.0 on 2026-11-19; 0.2.0 is released in the repo but not yet on npm). It has a wide card and a résumé line, no case study.
- No other projects are featured.
- Home page trimmed (owner, 2026-11-19): from about 14 desktop screens and 2,100 words to about 5.5 screens and 600 words. Projects are compact cards (screenshot, one sentence, three tags, links); characteristics, decisions and disclaimers live in the case studies; the five-principle table moved to the TND case study (`#principles`); the résumé section is one line plus the PDF. A browser test keeps the page at or under 7 desktop / 11 phone screens and 900 words.
- Looking for (owner, 2026-11-19): software engineering internships; remote, or on-site in Bengaluru or Mangaluru; no start date shown. Shown in the hero and on the résumé.
- Project facts refreshed 2026-11-18 from the repositories: DataSentry at commit 05e437d (phases 0–11 of its PHASES.md complete, still application version 0.1.0; 422 pytest runs, 26 frontend unit tests and a 28-check browser smoke test all passed when run for the site; screenshots now its redesigned UI from `docs/screenshots/`). CampusSignal status from its README at 0fad707 (phases 0–6 and 8 done; 7 and 9 merged, awaiting sign-off; not deployed). TND unchanged since v1.0.0; FlowCast unchanged since its v1.0.0 demo.

## Brand Commitments

- Name: Lloyd Dsouza (owner, 2026-11-21: spelled "Dsouza", never "D'Souza" or "DSouza"). Role: AI/ML engineering student.
- Contact (confirmed for publication): GitHub https://github.com/lloydaq; email lloyd25dsouza@gmail.com; LinkedIn https://www.linkedin.com/in/lloyddso.
- Voice: plain, specific, grounded. No hype, no "passionate", no expert claims.
- Visual brief (owner-pinned): deep charcoal or near-black surfaces, warm white type, one restrained accent; no neon, no purple/blue AI gradients, no blobs, no stock photos, no fake terminals, no emoji, no skill percentages.
- Owner update (2026-11-13): rounded corners on boxes and figures, an amber hover glow on buttons, cards and screenshots, and glass (translucent, blurred) buttons and header. Glass stays on controls only, never on content panels.
- Owner update (2026-11-18): palette "Ink & Ember": about 80% blue-black ground, 15% slate surfaces, 5% ember (#ff5a1f; #bf3a0a on paper). Ember now also fills the primary button. Light theme (same day): a sky-blue-to-white gradient (about 80%), cloud-white surfaces (15%), amber-red #c2410c (5%), navy ink. Phone menu: glass card morphing out of the menu button, with an ember edge trace, spotlight, ink-fill links, local time and an in-menu theme switch.

## Evidence on Hand

- TND screenshots: `docs/assets/tnd-home.png`, `tnd-results.png`, `tnd-evidence.png` (real output, 1920×1200 / 1824×1244).
- TND README, release notes, architecture SVG, test suites.
- Résumé (owner, 2026-11-13, from his résumé and NPTEL certificate): BE in AI & ML at MITE, CGPA 8.43, expected 2028; PU (Science) Christ King PU College 86%; SSLC Christ King English Medium School 85%; hackathons JalSetu-Lite (Build for Billions, NITK) and FocusCut (Tech Fusion 2.0); conducted AIvibeX, a 5-hour hackathon at MITE; NPTEL Foundations of Virtual Reality (IIT Madras, Jul–Oct 2026, Elite; the 67% score is deliberately not shown, owner 2026-11-19); languages English, Hindi, Kannada; location Karkala, Karnataka. All in `src/content/resume.ts`. No phone number or address on the site.
- Absent and never to be fabricated: employment, internships, awards beyond the above, hackathon placings, user counts, accuracy figures, stars, contribution graphs, testimonials.

## Product Principles

1. **One project, fully evidenced** beats many projects lightly described.
2. **Every claim traceable** to code, tests, or the repo.
3. **Implemented vs planned is always explicit.**
4. **Recruiter-fast, engineer-deep:** scannable first, detail on demand.
5. **Honest absences:** missing information is left out, never filled.
