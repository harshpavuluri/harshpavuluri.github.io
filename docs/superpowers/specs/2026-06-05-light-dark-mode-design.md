# Light / Dark Mode — Design Spec

**Date:** 2026-06-05
**Branch:** essay/documents-knowledge-graph

## Summary

Add a user-controlled light/dark mode toggle to the portfolio site. Default follows the OS system preference (`prefers-color-scheme`), persists the manual override in `localStorage`. Light mode uses a warm editorial palette (cream background, amber accents). Toggle is a pill-style ☀️/🌙 selector in the navbar.

---

## 1. CSS Architecture

### Approach

CSS custom properties + `data-theme` attribute on `<html>`. The existing `@theme {}` block in `index.css` becomes the **dark mode defaults**. A `[data-theme="light"]` block overrides each variable with warm editorial values. Tailwind utilities already reference `var(--color-*)` so no component classes change.

### Variable Overrides

```css
/* index.css — add after @theme block */
[data-theme="light"] {
  --color-primary:       #b45309;   /* amber replaces cyan */
  --color-primary-dim:   #92400e;
  --color-secondary:     #6d28d9;   /* purple unchanged */
  --color-bg-dark:       #fafaf8;   /* warm off-white */
  --color-bg-card:       #f5f2eb;
  --color-bg-card-hover: #ede9df;
  --color-text-primary:  #1c1917;   /* near-black, warm */
  --color-text-muted:    #78716c;   /* warm gray */
  --color-border:        #d6cfc4;   /* warm gray border */
}
```

A `--color-border` variable is added (initially `#1e1e2e` for dark, `#d6cfc4` for light) to replace hardcoded border hex values throughout `.prose-post` styles.

### Body + Glow

- `body { background-color }` converts from hardcoded `#0a0a0f` → `var(--color-bg-dark)`
- `.glow-cyan`, `.glow-text`, `.glow-border` all get `[data-theme="light"]` overrides that zero out box-shadow and text-shadow (cyan glows on cream look wrong regardless of color)

---

## 2. Theme Hook — `src/hooks/useTheme.js`

Single hook, single responsibility. Public API: `{ theme, toggleTheme }`.

**Mount behavior:**
1. Read `localStorage.getItem('theme')`
2. If nothing stored, read `window.matchMedia('(prefers-color-scheme: dark)').matches`
3. Set `document.documentElement.setAttribute('data-theme', resolved)`

**System preference listener:**
- `matchMedia.addEventListener('change', ...)` updates theme automatically when the user changes their OS setting — unless they have a manual override stored in `localStorage`

**Toggle:**
- Flips between `'dark'` and `'light'`
- Writes to `localStorage`
- Updates `data-theme` on `document.documentElement`

---

## 3. App Integration — `src/App.jsx`

`useTheme()` is called inside the `Layout` component (which already wraps every page). The hook only needs to run once at the root — no prop drilling needed since it writes directly to `document.documentElement`.

No new context or provider component required.

---

## 4. Navbar Toggle — `src/components/Navbar.jsx`

**Pill toggle** — segmented ☀️/🌙 control, active indicator animated with Framer Motion (consistent with existing hamburger animation style).

**Placement:**
- Desktop: rightmost element in the nav, after the page links
- Mobile: bottom of the expanded mobile menu, after the page links

**Behavior:**
- Calls `toggleTheme()` on click
- Active icon (current mode) is visually highlighted; inactive is dimmed
- Framer Motion `AnimatePresence` or `layout` prop handles the highlight sliding between segments

---

## 5. Prose Post Styles — `src/index.css`

All hardcoded hex values in `.prose-post` convert to CSS variables:

| Element | Current | Variable |
|---|---|---|
| `p`, `ul`, `ol` color | `#cccccc` | `var(--color-text-muted)` |
| `h2` color | `#ffffff` | `var(--color-text-primary)` |
| `h3` color | `#e2e8f0` | `var(--color-text-primary)` |
| `a`, `code` color | `#00f0ff` | `var(--color-primary)` |
| `strong` color | `#ffffff` | `var(--color-text-primary)` |
| `em` color | `#aaaaaa` | `var(--color-text-muted)` |
| `code`, `pre` background | `#111118` | `var(--color-bg-card)` |
| `code`, `pre`, `hr` borders | `#1e1e2e` | `var(--color-border)` |
| `pre code` color | `#e2e8f0` | `var(--color-text-primary)` |
| `blockquote` border | `#00f0ff` | `var(--color-primary)` |
| `blockquote` color | `#94a3b8` | `var(--color-text-muted)` |

---

## 6. Particle Background — `src/components/ParticleBackground.jsx`

Calls `useTheme()` directly (same hook, no prop drilling needed). In light mode, particle color switches from cyan (`#00f0ff`) to a muted amber (`#d97706`) at low opacity — a subtle warm dust effect instead of the cyber glow. The particle count and behavior stay the same.

---

## 7. Home.jsx — Hardcoded Color Fixes

`ParticleBackground` is rendered in `Home.jsx`, not `Layout`, so it gets the hook directly (covered above). Two additional hardcoded values in `Home.jsx` also need manual fixes:

- `<h1 className="... text-white">` → change to `text-text-primary` so it responds to the warm editorial palette in light mode
- Two Framer Motion `whileHover` inline styles use `rgba(0,240,255,...)` — these bypass Tailwind and CSS variables entirely. Replace with neutral `rgba(0,0,0,0.1)` / `rgba(0,0,0,0.05)` for the light-compatible hover, or conditionally set the color via the theme value from `useTheme()`.

---

## Out of Scope

- Page section components (About, Skills, Projects, Contact, Footer) beyond what Tailwind variable inheritance handles automatically — spot checks recommended after implementation
- Changes to routing, MDX pipeline, or data files
- Server-side rendering considerations (static SPA)
