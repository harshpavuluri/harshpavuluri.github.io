# Editorial Console Redesign — Design Spec

**Date:** 2026-06-09
**Status:** Approved by user (brainstorming session with visual companion)

## Goal

Rework the site to be cleaner but feel more alive, centered on knowledge graphs and Agentic AI, with that identity ingrained in the frontend UI itself — not just the content.

## Direction (decided)

- **Base:** Editorial, writing-first layout ("Editorial, Connected").
- **Blend:** Console accents — the site presents light "running system" elements on the homepage.
- **Graph placement:** The interactive force-graph lives as a compact live panel in the homepage console row, with a fullscreen expand overlay. No dedicated /graph route.
- **Sitewide spread:** Post pages get related-essay constellations + node-edge dividers. About and Portfolio get the same editorial-console restyle. Writing index gets a tag-network filter. Console framing (status line) appears sitewide via the footer.
- **Data honesty:** All console stats are real — content stats computed at build/render time, view counts from a privacy-friendly analytics service (GoatCounter). No fake numbers.

## 1. Homepage (`src/pages/Home.jsx`)

Order, top to bottom:

1. **Status bar** — bordered monospace strip above the name:
   `● online · {nodes} nodes · {edges} edges · {essays} essays · updated {date} · {views} views`
   Green dot, values from `siteStats` (see §5); the views segment comes from GoatCounter (§5b) and is omitted if unavailable. Theme-aware.
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

## 3b. Writing index (`src/pages/Writing.jsx`) — tag network filter

- A clickable **tag-node strip** above the essay list: each tag is a node; edges connect tags that co-occur on the same essay.
- Clicking a tag node filters the essay list to that tag (click again to clear; one active tag at a time). Active tag node is highlighted; non-matching essays are removed (or collapsed) with a brief transition.
- Rendered as a compact SVG/canvas band (~120px), theme-aware, keyboard-accessible (tags focusable, Enter toggles).

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

## 5b. Analytics (GoatCounter)

- **Service:** GoatCounter — free, privacy-friendly, no cookies, no GDPR banner needed. Requires the user to create a GoatCounter account and site code (setup prerequisite; documented in the plan).
- **Tracking:** count script added to `index.html` (SPA mode: manual `count()` on route change so each client-side navigation registers).
- **Display (progressive enhancement, fetched client-side from GoatCounter's public `counter/{path}.json` endpoint):**
  - Per-essay view count on post pages (e.g. `· 132 views` in the post meta line).
  - Total site views in the homepage status bar.
- **Graceful fallback:** if the fetch fails or returns no data (ad-blockers, first deploy), the view-count element is simply omitted — never show 0 or placeholder values.
- Public dashboard counting must be enabled in GoatCounter settings for the JSON endpoint to work unauthenticated.

## 5c. Sitewide console framing (Footer)

- The footer on **every page** carries a compact monospace status line: `● online · {nodes} nodes · {essays} essays · updated {date}` (same `siteStats` source as the homepage status bar).
- The homepage keeps its prominent hero status bar; the footer version is the quiet sitewide echo.
- Footer also picks up the social links removed from the hero.

## 6. Theme, accessibility, mobile

- All new elements theme-aware via the existing `useTheme` / palette pattern (light + dark).
- `prefers-reduced-motion`: no typing/cursor animation, no ambient drift, graphs settle without long simulation.
- Mobile: console row stacks (featured above graph panel); fullscreen overlay touch-enabled; status bar wraps or truncates gracefully.
- Focus-visible outlines and keyboard dismissal (ESC) for the overlay.

## 7. Testing & verification

- New unit tests: `siteStats` values against fixture posts; related-essay selection logic (shared tags, no self-reference).
- Existing 28 tests must keep passing.
- `npm run build` must succeed; manual visual check via `npm run dev` in both themes.

## 7b. Testing additions for expanded scope

- Tag co-occurrence computation (which tags share essays) unit-tested.
- View-count fetch helper unit-tested with mocked fetch (success, failure, empty → element omitted).

## Out of scope

- New essay content.
- Live concurrent-visitor counts ("reading now") — GoatCounter doesn't expose this; view counts only.
