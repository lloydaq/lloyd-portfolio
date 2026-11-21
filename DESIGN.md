---
name: Lloyd Dsouza — portfolio
description: A component datasheet for an engineer — specs, block diagram, test conditions, limits.
colors:
  charcoal-ground: "#0b0d12"
  charcoal-sheet: "#141821"
  charcoal-sheet-raised: "#1c2130"
  warm-ink: "#f1ece4"
  warm-ink-muted: "#a7a3a0"
  hairline: "#262b37"
  hairline-strong: "#3b4252"
  ember: "#ff5a1f"
  sky-top: "#cfe6ff"
  sky-bottom: "#f6faff"
  cloud-sheet: "#fbfdff"
  navy-ink: "#0f1b2d"
  navy-ink-muted: "#475569"
  amber-red: "#c2410c"
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

# Design System: Lloyd Dsouza — portfolio

## Overview

**Creative North Star: "The Component Datasheet"**

The site reads like the datasheet for a part: a general description, a block diagram, characteristic tables, test conditions, operating limits. The engineer is presented the way a careful manufacturer presents a component, by what it does, how it is wired, how it was tested and where it stops working. Credibility comes from specificity and stated limits, not adjectives.

Night is a blue-black sheet with warm white ink and ember; day is a sky that fades from blue to white down the screen, with cloud-white surfaces, navy ink and amber-red. Structure is carried by 1px hairline rules, ruled tables with tabular numerals, and block-diagram linework, never by cards or shadows. There is vast quiet ground around each section's single figure. One ember orange marks live signal, focus and the primary action, nothing else.

Rejected by brief: neon, purple/blue AI gradients, glass content panels, decorative blobs, stock photos, fake terminals, rounded card grids, emoji, skill percentages.

**Key Characteristics:**
- Hairline-ruled tables and key/value rows instead of cards.
- One explorable block diagram as the signature figure (in the TND case study).
- The home page is a short index: compact project cards with one sentence and three tags each; depth is one click away in the case studies.
- Archivo's width axis does the hierarchy: expanded display, condensed table heads.
- State is drawn by stroke pattern plus text, never colour alone.
- Ember is rare (about 5% of the page): signal path, selection, focus, glow, the primary action.

## Colors

"Ink & Ember" (owner update, 2026-11-18): roughly 80% blue-black ground, 15% slate surfaces and 5% ember. Light theme ("daylight", owner update 2026-11-18): about 80% sky, a fixed gradient from #cfe6ff at the top of the screen to #f6faff at the bottom (painted on the background canvas so it holds still while scrolling, also on iOS); 15% cloud-white surfaces (#fbfdff, #edf3fa); 5% amber-red (#c2410c, used as text only through #a3360a, 5.3:1 or better everywhere on the sky); navy ink #0f1b2d. `--accent-rgb` carries the ember as an RGB triplet so glows and tints derive from one token.

### Primary
- **Ember / amber-red** (#ff5a1f dark / #c2410c light; text tint #ff7a45 / #a3360a): the live signal. The diagram's load pass, the selected stage's border and marker, focus rings, the reading-progress bar, the active table-of-contents marker, hover glow, the ink trail, the current menu item, and the fill of the primary button (dark text on ember in dark, white on ember on paper). Never a large area.

### Neutral
- **Ink Ground** (#0b0d12): page background, dark theme.
- **Slate Sheet** (#141821) / **Raised Sheet** (#1c2130): figure panels, diagram blocks, code blocks, hover fills.
- **Warm Ink** (#f1ece4): body text and headings.
- **Muted Ink** (#a7a3a0): secondary text, table heads, captions, unselected markers. 7.8:1 on the ground.
- **Hairline** (#262b37) / **Strong Hairline** (#3b4252): rules, table borders, diagram edges, block outlines.
- **Sky** (#cfe6ff → #f6faff), **Cloud Sheet** (#fbfdff / #edf3fa), **Navy Ink** (#0f1b2d), **Navy Muted** (#475569), **Hairlines** (#cddae8 / #9db0c6): the light theme, same roles.

### Named Rules
**The 5% Ember Rule.** Ember marks where the signal is, where focus is, and the one primary action in a group. It never fills a section, a card or a panel.

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

Rounded corners (owner update, 2026-11-13): `--radius` 12px for controls, cards and stages; `--radius-lg` 18px for figures and the hero index panel. Borders are 1px; emphasis is a 2px rule (the disclaimer callout) or an inset 1px second stroke (selected stage). Hover on buttons, index cards and screenshots adds the ember `--glow`. Buttons and the sticky header are glass: a translucent gradient over `backdrop-filter: blur()`, with a 1px inner highlight.

## Components

### Buttons
- **Shape:** 2px corners, 2.875rem high, 0 1.25rem padding, 600 weight at 0.875rem.
- **Primary:** warm-ink fill, ground-colour text; hover drops to muted ink.
- **Secondary:** transparent with a strong hairline; hover fills with sheet.
- **Text:** underlined, no padding; sits on the same left edge as the strip.
- **Icons:** trailing arrows nudge 2px on hover in the direction they point.

### Navigation
Sticky top bar, frosted (translucent ground with a backdrop blur, drawn by a pseudo-element) with a hairline below. Links are muted ink at 0.875rem and go to ink on hover or when their section is in view. Below 48rem, the links fold into a menu button whose burger lines fold into an X; the menu is the button, grown: a rounded glass card anchored on the button's top and right edges and clipped to the button's exact square and radius, which unclips to the full card with a slight overshoot when opened and clips back into the 3-line button when closed (the button's own glass steps aside while open, so its X sits on the card's corner, under a small "Menu" label), numbered link pills pop in one after another, the current section filled with ember from the left and marked with a pulsing ember dot (pressing or hovering a pill floods it the same way), a soft ember spotlight follows the finger across the glass, a streak of ember light runs once round the card's edge as it opens and settles into a faint rim, the corner label reads the local time in Karkala, and the bottom row holds Email, GitHub and LinkedIn bubbles and a Dark/Light pill with a sliding ember thumb (switching from there uses the same ink), and the page behind dims and blurs and stops scrolling. Escape, outside-click and choosing a link close it; focus returns to the button. The theme toggle is a square icon button that cross-fades moon and sun. Switching theme bleeds ink from the press point across the whole screen: a View Transition reveals the new theme through a freshly generated ink splat (irregular drop, tendrils, specks), pre-drawn into a bitmap, that grows until it covers every corner (0.9s, a quick first bloom then a steady soak). Pressing again mid-spread pulls the ink back. Without View Transitions the colours cross-fade; with reduced motion the switch is instant. Keyboard shortcuts (`?` lists them) cover the theme, section jumps and the next project.

### Ruled tables and key/value rows
Hairline top border per row, strong hairline above and below the head, condensed sentence-case heads, tabular numerals right-aligned. Below 40rem rows stack with each cell labelled from `data-label`.

### Pipeline diagram (signature)
Nine stage blocks (sheet fill, strong hairline, square marker before the label) joined by 1.5px edges with arrowheads, a dotted frame around the per-claim loop, and dashed edges for input-dependent paths. Selecting a block (click, or arrow keys with a single tab stop) fills its marker, thickens its border in ember, highlights its edges and prints its spec and source files below. On load, an ember signal travels the request path once and fades. Narrow containers render the same stages as a railed list with specs opening inline.

### Background grid
A fixed canvas behind every page (`KineticGrid`): quiet ink hairlines on a 55px cell (resting strength from `--grid-line` / `--grid-node`: 7% / 12% in dark, 5.5% / 10% on the sky), calming to `--grid-calm` (40%, 35% on the sky) of that once the reader scrolls past the hero, so it never competes with reading text. No dot texture. Near the mouse the intersections bend away and light up in the accent; a click sends one ring outward. Colours are read from `--ink` and `--accent`, so it follows the theme. It ignores touch and keyboard clicks, redraws only while moving, and is drawn once and held still under reduced motion. Holding the mouse down on empty page and dragging draws ink under the grid lines: slow strokes pool wider, a held pen leaves a blot, and the ink dries from ember into the page colour behind each point (the sky's shade at that height in light) over about 2.5s (its colour changes, not its opacity, so joints never bead). Typing `ink` splashes a few blots.

### Status list
Each row leads with a 2.75rem rule: solid for done, dashed for open, plus the word "Done" or "Open".

## Do's and Don'ts

### Do:
- **Do** put every claim beside its evidence: a file, a test, or a figure.
- **Do** keep ember to about 5%: the signal path, selection, focus, glow and the one primary action.
- **Do** draw state with stroke pattern and label it in text.
- **Do** use ruled tables for anything that has parameters and values.
- **Do** move between pages with the cross-document view transition (page out 0.26s: fade, lift 14px, blur 3px; page in 0.55s `cubic-bezier(0.22, 1, 0.36, 1)`: fade, rise 22px, unblur 6px), keep the header and grid named so they hold still, and give a shared element (a project title) the same name on both pages only when that pair is involved.
- **Do** gate entrance motion behind `prefers-reduced-motion: no-preference`; with reduced motion, animations are removed, not shortened.

### Don't:
- **Don't** fill sections, cards or panels with ember, or use more than one ember-filled button per group.
- **Don't** use cards, card grids, or big-number stat rows.
- **Don't** put a label or eyebrow above a heading.
- **Don't** set prose in monospace.
- **Don't** add neon, decorative gradients, glass on content panels, blobs, stock imagery, fake terminals, emoji or skill scores.
