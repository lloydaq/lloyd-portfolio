# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: React + TypeScript + Vite, static build, no backend. The owner listed this as a preference and did not answer the stack question; chosen because the site needs two routes (home and a TND case study) driven by one typed content file.

## Users

Primary: recruiters and hiring engineers who arrive from a résumé, LinkedIn, or GitHub and spend under a minute deciding whether Lloyd D'Souza is worth a conversation. Secondary: engineers who open the TND case study to judge technical depth and judgement.

## Product Purpose

A personal portfolio for Lloyd D'Souza, an AI/ML engineering student who builds practical AI applications and backend systems. It must show, within seconds, who he is and what he builds, and let a technical reader verify that through one real, well-documented project: TND.

Success: a visitor understands the role immediately, opens the TND case study or repository, and finds every claim traceable to code, tests, or documentation.

## Positioning

Most student portfolios list many projects and claim skills. This one makes one shipped project carry the proof: TND's own engineering choices (bounded inference, honest degradation, "insufficient evidence is not false", SSRF-hardened fetching, a tested heuristic instead of a fake probability) are the evidence of judgement.

## Operating Context

- Visitors come from links on a résumé, LinkedIn, or GitHub; often on a phone.
- No public URL exists yet; deployment target undecided. No canonical URL.
- Content is static; no analytics, no forms, no backend.

## Capabilities and Constraints

- Featured project: **TND — Trustworthy News Detector** (canonical name per the TND app and its PRODUCT.md; the repo slug says "The News Detector"). Source: `C:\projects\TND`, public at https://github.com/lloydaq/TND-The-News-Detector, tagged v1.0.0.
- Verified TND facts: FastAPI backend; local Ollama inference (`llama3.2:3b` default); Trafilatura article extraction; GNews + GDELT evidence retrieval; per-claim verification; deterministic 0–100 heuristic risk score; `COMPLETE`/`DEGRADED` status with listed reasons; vanilla HTML/CSS/JS frontend with light/dark/system themes; pytest backend suite (159 passed on 2026-10-19, re-run during this build) and Playwright UI suite.
- TND has **no database**; results are held in browser `sessionStorage`. Never claim SQLite or persistence.
- TND is not deployed; no live demo exists. Local development is its deployment assumption.
- **CampusSignal must never appear** anywhere on the site, in copy, metadata, or fetched data. Because the owner's GitHub has only two public repos (TND and CampusSignal), the site must not list repositories dynamically.
- No other projects are featured.

## Brand Commitments

- Name: Lloyd D'Souza. Role: AI/ML engineering student.
- Contact (confirmed for publication): GitHub https://github.com/lloydaq; email lloyd25dsouza@gmail.com; LinkedIn https://www.linkedin.com/in/lloyddso.
- Voice: plain, specific, grounded. No hype, no "passionate", no expert claims.
- Visual brief (owner-pinned): deep charcoal or near-black surfaces, warm white type, one restrained accent; no neon, no purple/blue AI gradients, no glassmorphism, no blobs, no stock photos, no fake terminals, no emoji, no skill percentages.

## Evidence on Hand

- TND screenshots: `docs/assets/tnd-home.png`, `tnd-results.png`, `tnd-evidence.png` (real output, 1920×1200 / 1824×1244).
- TND README, release notes, architecture SVG, test suites.
- Absent and never to be fabricated: education details, employment, internships, awards, user counts, accuracy figures, stars, contribution graphs, testimonials, a résumé file.

## Product Principles

1. **One project, fully evidenced** beats many projects lightly described.
2. **Every claim traceable** to code, tests, or the repo.
3. **Implemented vs planned is always explicit.**
4. **Recruiter-fast, engineer-deep:** scannable first, detail on demand.
5. **Honest absences:** missing information is left out, never filled.
