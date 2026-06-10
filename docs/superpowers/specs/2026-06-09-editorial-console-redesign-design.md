# Editorial Console Redesign — Design Spec

**Date:** 2026-06-09
**Status:** Approved by user (brainstorming session with visual companion)

## Goal

Rework the site to be cleaner but feel more alive, centered on knowledge graphs and Agentic AI, with that identity ingrained in the frontend UI itself — not just the content.

## Direction (decided)

- **Base:** Editorial, writing-first layout ("Editorial, Connected").
- **Blend:** Console accents — the site presents light "running system" elements on the homepage.
- **Graph placement:** The interactive force-graph lives as a compact live panel in the homepage console row, with a fullscreen expand overlay. No dedicated /graph route.
- **Sitewide spread:** Post pages get related-essay constellations + node-edge dividers. About and Portfolio get the same editorial-console restyle. Writing index stays simple; no sitewide console framing.
- **Data honesty:** All console stats are real, computed at build/render time from actual content. No fake numbers, no analytics dependency.

## 1. Homepage (`src/pages/Home.jsx`)

Order, top to bottom:

1. **Status bar** — bordered monospace strip above the name:
   `● online · {nodes} nodes · {edges} edges · {essays} essays · updated {date}`
   Green dot, values from `siteStats` (see §5). Theme-aware.
2. **Hero** — name (slightly smaller than current), then a monospace prompt-style tagline: `> building agentic systems that remember` with a blinking cursor. Replaces the current role line + paragraph. Behind the hero: a faint ambient graph drift (low-opacity decorative SVG/canvas), disabled under `prefers-reduced-motion`.
3. **Console row** — two panels side by side (stacked on mobile):
   - Left (~60%): featured essay card (existing SpotlightCard styling).
   - Right (~40%): **live site-graph panel** — compact `SiteGraph` in `panel` mode. Header label `SITE GRAPH · live` + `expand ↗` button → fullscreen overlay.
4. **Recent Writing** — existing list rows, kept.
5. **Node-edge dividers** between sections (line with a node dot, replacing plain gradient dividers).

Removed: the current 440px `SiteGraphHero` hero block; the hero paragraph; social link pills move out of the hero (footer/About keep them).

## 2. Graph component refactor

- `src/components/SiteGraphHero.jsx` → `src/components/SiteGraph.jsx` with a `mode` prop:
  - `panel`: compact height (~260px), drag + hover + click-to-navigate, no zoom/pan.
  - `fullscreen`: rendered in an overlay portal (dimmed backdrop, ESC and close button to dismiss, body scroll locked), zoom/pan enabled, touch-enabled.
- `buildSiteGraph()` is unchanged and is the single source for both rendering and stats.
- Existing hover-highlight, theme palettes, and pointer behavior carry over.

## 3. Post pages (`src/pages/Post.jsx`)

Keep: reading progress bar, scroll-spy TOC, back-to-top.

Add:

- **Node-edge section dividers** — styled `hr` rendering within MDX content.
- **"Connected" constellation** at the end of each essay: mini graph of the current essay node + its tags + related essays (essays sharing ≥1 tag). Clickable nodes navigate. Built by filtering `buildSiteGraph()` to the essay's neighborhood. If an essay has no related essays, show tags only; if no tags, omit the section.

## 4. About + Portfolio restyle

- Shared language: console-style uppercase tracking labels, consistent card borders (`border-primary-dim/20`), fewer competing glows, tightened spacing.
- **About:** skill categories render as small connected node-clusters (category node + skill leaves) instead of a flat icon grid. Bio copy unchanged.
- **Portfolio:** subtle SVG edge-connectors drawn between project cards so the grid reads as one connected system. Cards keep SpotlightCard behavior.

## 5. Data layer (`src/lib/siteStats.js`)

- `getSiteStats()` returns `{ nodeCount, edgeCount, essayCount, lastUpdated }`:
  - node/edge counts from `buildSiteGraph()` output.
  - essay count from `getAllPosts()`.
  - `lastUpdated` = newest post date (formatted e.g. "Jun 6").
- Pure function, unit-tested. No network, no git dependency.

## 6. Theme, accessibility, mobile

- All new elements theme-aware via the existing `useTheme` / palette pattern (light + dark).
- `prefers-reduced-motion`: no typing/cursor animation, no ambient drift, graphs settle without long simulation.
- Mobile: console row stacks (featured above graph panel); fullscreen overlay touch-enabled; status bar wraps or truncates gracefully.
- Focus-visible outlines and keyboard dismissal (ESC) for the overlay.

## 7. Testing & verification

- New unit tests: `siteStats` values against fixture posts; related-essay selection logic (shared tags, no self-reference).
- Existing 28 tests must keep passing.
- `npm run build` must succeed; manual visual check via `npm run dev` in both themes.

## Out of scope

- Writing index tag-network filter (explicitly declined).
- Sitewide console framing on every page (declined).
- Analytics / live visitor counts (declined — real build-time data only).
- New essay content.
