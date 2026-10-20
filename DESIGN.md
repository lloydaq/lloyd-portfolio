---
name: Lloyd D'Souza — portfolio
description: A component datasheet for an engineer — specs, block diagram, test conditions, limits.
colors:
  charcoal-ground: "#16161a"
  charcoal-sheet: "#1e1e23"
  charcoal-sheet-raised: "#25252b"
  warm-ink: "#ede6da"
  warm-ink-muted: "#a39e94"
  hairline: "#33333a"
  hairline-strong: "#4d4d55"
  sodium-amber: "#e0a84f"
  paper-ground: "#f2eee6"
  paper-sheet: "#fbf9f4"
  paper-ink: "#1b1b1f"
  paper-ink-muted: "#57524a"
  paper-amber: "#8f5b0e"
typography:
  display:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.2rem + 5.4vw, 5.75rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 1.4rem + 2vw, 2.75rem)"
    fontWeight: 620
    lineHeight: 1.1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 118"
  title:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 620
    lineHeight: 1.1
    fontVariation: "'wdth' 118"
  body:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 78"
  code:
    fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.86em"
    fontWeight: 400
rounded:
  hair: "2px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.5rem"
  "6": "2rem"
  "7": "3rem"
  "8": "4.5rem"
  "9": "clamp(4.5rem, 3rem + 6vw, 8rem)"
components:
  button-primary:
    backgroundColor: "{colors.warm-ink}"
    textColor: "{colors.charcoal-ground}"
    rounded: "{rounded.hair}"
    padding: "0 1.25rem"
    height: "2.875rem"
  button-primary-hover:
    backgroundColor: "{colors.warm-ink-muted}"
    textColor: "{colors.charcoal-ground}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.hair}"
    padding: "0 1.25rem"
    height: "2.875rem"
  button-secondary-hover:
    backgroundColor: "{colors.charcoal-sheet}"
  stage-block:
    backgroundColor: "{colors.charcoal-sheet}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.hair}"
  stage-block-selected:
    backgroundColor: "{colors.charcoal-sheet}"
    textColor: "{colors.warm-ink}"
---

# Design System: Lloyd D'Souza — portfolio

## Overview

**Creative North Star: "The Component Datasheet"**

The site reads like the datasheet for a part: a general description, a block diagram, characteristic tables, test conditions, operating limits. The engineer is presented the way a careful manufacturer presents a component, by what it does, how it is wired, how it was tested and where it stops working. Credibility comes from specificity and stated limits, not adjectives.

Surfaces are a dark charcoal sheet with warm white ink; the light theme is the same sheet printed on paper. Structure is carried by 1px hairline rules, ruled tables with tabular numerals, and block-diagram linework, never by cards or shadows. There is vast quiet ground around each section's single figure. One sodium amber marks live signal and focus, nothing else.

Rejected by brief: neon, purple/blue AI gradients, glassmorphism, decorative blobs, stock photos, fake terminals, rounded card grids, emoji, skill percentages.

**Key Characteristics:**
- Hairline-ruled tables and key/value rows instead of cards.
- One explorable block diagram as the signature figure.
- Archivo's width axis does the hierarchy: expanded display, condensed table heads.
- State is drawn by stroke pattern plus text, never colour alone.
- Amber is rare: signal path, selection, focus.

## Colors

A near-monochrome warm charcoal system with a single sodium-amber signal colour.

### Primary
- **Sodium Amber** (#e0a84f dark / #8f5b0e light): the live signal. The diagram's load pass, the selected stage's border and marker, the edges touching the selected stage, focus rings, the reading-progress bar and the active table-of-contents marker. Never a fill for buttons or large areas.

### Neutral
- **Charcoal Ground** (#16161a): page background, dark theme.
- **Charcoal Sheet** (#1e1e23) / **Raised Sheet** (#25252b): figure panels, diagram blocks, code blocks, hover fills.
- **Warm Ink** (#ede6da): body text, headings, and the primary button fill.
- **Muted Ink** (#a39e94): secondary text, table heads, captions, unselected markers. 7:1 on the ground.
- **Hairline** (#33333a) / **Strong Hairline** (#4d4d55): rules, table borders, diagram edges, block outlines.
- **Paper** (#f2eee6), **Paper Sheet** (#fbf9f4), **Paper Ink** (#1b1b1f), **Paper Muted** (#57524a): the light theme, same roles.

### Named Rules
**The Signal-Only Amber Rule.** Amber marks where the signal is or where focus is. Primary actions are filled with ink, not amber.

**The Stroke-Not-Colour Rule.** Solid means always runs or done; dashed means depends on input or still open; dotted frames the per-claim loop. Every such mark also carries a text label.

## Typography

**Display, Body and Label Font:** Archivo Variable (self-hosted via @fontsource, width axis 62–125%)
**Code Font:** JetBrains Mono Variable (self-hosted)

**Character:** one grotesque used at different widths, like a datasheet's part number versus its table legends. Mono appears only for literal identifiers.

### Hierarchy
- **Display** (700, clamp 2.5–5.75rem, 0.92, width 125%): the name on the home hero and the case-study title.
- **Headline** (620, clamp 1.875–2.75rem, 1.1, width 118%): section titles.
- **Statement** (560, clamp 1.5–2rem, 1.2): the hero statement and contact links.
- **Title** (620, 1.25rem, width 118%): sub-sections and the diagram detail heading.
- **Body** (400, 1.0625rem, 1.6): prose, max 66ch.
- **Small** (0.875rem): table cells, specs, captions.
- **Label** (600, 0.8125rem, width 78%): table heads, key/value keys, legend tags. Sentence case.

### Named Rules
**The Literal Mono Rule.** Monospace is for file names, function names and status codes only. Connecting words stay in Archivo. Paths may break only after "/".

**The No-Eyebrow Rule.** No label above a heading. Headings stand alone; sentence case throughout.

## Layout

A 90rem (1440px) container with a fluid gutter (`clamp(1rem, 0.5rem + 2.5vw, 3rem)`), so laptop screens are filled to the gutter and only wider displays show margin. Sections are separated by a full-width hairline and generous padding (`clamp(4.5rem, 3rem + 6vw, 8rem)`); each opens with a 5/7 split of title and lede. The home hero is a 5/7 split of introduction and Figure 1, stacking below 64rem. The case study runs a 12rem sticky contents rail beside a reading column, collapsing to an inline contents list below 64rem. Ruled tables stack into labelled rows below 40rem. The pipeline diagram switches to a vertical list through a container query when its own width falls below 480px.

## Elevation & Depth

Flat by default. Depth comes from tonal layering (ground, sheet, raised sheet) and hairlines. A single soft shadow (`0 1px 0 rgb(0 0 0 / 0.4), 0 18px 40px -24px rgb(0 0 0 / 0.7)`) sits under screenshot frames and the open mobile menu only.

## Shapes

Square corners: 2px radius everywhere, essentially a softened hairline corner. Borders are 1px; emphasis is a 2px rule (the disclaimer callout) or an inset 1px second stroke (selected stage). No pills, no circles, no clipped shapes.

## Components

### Buttons
- **Shape:** 2px corners, 2.875rem high, 0 1.25rem padding, 600 weight at 0.875rem.
- **Primary:** warm-ink fill, ground-colour text; hover drops to muted ink.
- **Secondary:** transparent with a strong hairline; hover fills with sheet.
- **Text:** underlined, no padding; sits on the same left edge as the strip.
- **Icons:** trailing arrows nudge 2px on hover in the direction they point.

### Navigation
Sticky top bar on the ground colour with a hairline below. Links are muted ink at 0.875rem and go to ink on hover or when their section is in view. Below 48rem, the links fold into a menu button that opens a full-width ruled list (Escape and outside-click close it, focus returns to the button). The theme toggle is a square icon button that cross-fades moon and sun.

### Ruled tables and key/value rows
Hairline top border per row, strong hairline above and below the head, condensed sentence-case heads, tabular numerals right-aligned. Below 40rem rows stack with each cell labelled from `data-label`.

### Pipeline diagram (signature)
Nine stage blocks (sheet fill, strong hairline, square marker before the label) joined by 1.5px edges with arrowheads, a dotted frame around the per-claim loop, and dashed edges for input-dependent paths. Selecting a block (click, or arrow keys with a single tab stop) fills its marker, thickens its border in amber, highlights its edges and prints its spec and source files below. On load, an amber signal travels the request path once and fades. Narrow containers render the same stages as a railed list with specs opening inline.

### Background grid
A fixed canvas behind every page (`KineticGrid`): ink hairlines at 13% on a 55px cell with a faint 28px dot texture. Near the mouse the intersections bend away and light up in the accent; a click sends one ring outward. Colours are read from `--ink` and `--accent`, so it follows the theme. It ignores touch and keyboard clicks, redraws only while moving, and is drawn once and held still under reduced motion.

### Status list
Each row leads with a 2.75rem rule: solid for done, dashed for open, plus the word "Done" or "Open".

## Do's and Don'ts

### Do:
- **Do** put every claim beside its evidence: a file, a test, or a figure.
- **Do** keep amber to the signal path, selection and focus.
- **Do** draw state with stroke pattern and label it in text.
- **Do** use ruled tables for anything that has parameters and values.
- **Do** gate entrance motion behind `prefers-reduced-motion: no-preference`; with reduced motion, animations are removed, not shortened.

### Don't:
- **Don't** fill buttons or large areas with amber.
- **Don't** use cards, card grids, or big-number stat rows.
- **Don't** put a label or eyebrow above a heading.
- **Don't** set prose in monospace.
- **Don't** add neon, gradients, glass, blobs, stock imagery, fake terminals, emoji or skill scores.
