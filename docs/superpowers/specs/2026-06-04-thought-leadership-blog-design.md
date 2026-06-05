# Thought Leadership Blog — Design Spec

**Date:** 2026-06-04  
**Status:** Approved

## Overview

Rework harshpavuluri.github.io from a portfolio-first SPA into a thought leadership site with an integrated long-form essay blog. The primary goal is establishing Harsha as an Agentic AI expert to support career growth at IBM. The portfolio remains but is demoted to a secondary page.

---

## Site Identity & Goals

- **Primary audience:** Peers, hiring managers, IBM stakeholders, LinkedIn network
- **Positioning:** Expert practitioner writing about Agentic AI, knowledge graphs, and enterprise data systems
- **Key differentiator:** Interactive knowledge graph components embedded mid-essay — drag, zoom, clickable nodes — built with D3 force simulation
- **LinkedIn strategy:** Each essay gets a canonical URL (`/writing/slug`) shareable directly on LinkedIn

---

## Site Map

| Route | Page | Description |
|---|---|---|
| `/` | Home | Identity block + featured essay + recent writing list |
| `/writing` | Writing list | Full essay index with tag filtering |
| `/writing/:slug` | Post | Single MDX essay with embedded components |
| `/about` | About | Bio + absorbed skills grid |
| `/portfolio` | Portfolio | Existing projects section as a page |
| `/contact` | Contact | Existing contact section as a page |

---

## Architecture

### Routing

- **React Router v6** — browser history mode (`createBrowserRouter`) for clean URLs
- **GitHub Pages fix:** `public/404.html` stores the current path in `sessionStorage` and redirects to `/`. A script in `index.html` reads `sessionStorage` on load and calls `history.replaceState` to restore the path before React mounts. This lets GitHub Pages serve any deep link without a 404.
- Navbar switches from `react-scroll` links to React Router `<Link>` components. Active route highlighted with cyan underline.

### MDX Pipeline

- **`@mdx-js/rollup`** Vite plugin — compiles `.mdx` files to React components at build time
- **`remark-frontmatter`** + **`remark-mdx-frontmatter`** — parses YAML frontmatter and exports it as a named `frontmatter` export from each MDX module
- Posts live at `src/posts/*.mdx`
- A Vite glob import (`import.meta.glob('./posts/*.mdx')`) auto-discovers all posts — no manual index to maintain

### Post Frontmatter Schema

```yaml
---
title: "The future of AI agents at enterprise scale"
date: 2026-06-04
description: "How agentic pipelines are shifting from demos to production"
tags: [agentic-ai, enterprise, ibm]
featured: true        # surfaces on homepage as featured essay
readTime: 8           # minutes, set manually
---
```

### File Structure

```
src/
  posts/                        # .mdx essays
    2026-06-04-agentic-ai-future.mdx
  components/
    visualizations/
      KnowledgeGraph.jsx        # reusable D3 force graph component
  pages/                        # one component per route
    Home.jsx
    Writing.jsx
    Post.jsx
    About.jsx
    Portfolio.jsx
    Contact.jsx
  data/                         # unchanged content files
    personalInfo.js
    projects.js
    skills.js
    socialLinks.js
  sections/                     # existing section components (reused in pages)
  components/                   # existing reusable components
public/
  404.html                      # GitHub Pages SPA redirect
docs/
  superpowers/specs/            # design specs
```

---

## Page Designs

### Home (`/`)

Three vertical sections, single column, max-width 720px, centered:

1. **Identity block** — Name (large, white, glow), tagline line in cyan (`Data Engineer @ IBM · Agentic AI · Knowledge Graphs`), 2-sentence positioning bio in muted text, LinkedIn + GitHub pill links. Particle background preserved from current hero.
2. **Cyan gradient divider**
3. **Featured essay card** — cyan-bordered card, `FEATURED ESSAY` purple label, title, description excerpt, tags, date, read time, `Read →` link
4. **Recent writing list** — `RECENT WRITING` label + `All essays →` link, then 3 most recent posts as compact rows (title, tags, date, read time)

### Writing List (`/writing`)

- Page header: "Writing" + subtitle
- Tag filter pills (All, then each unique tag) — clicking filters the list client-side
- Featured post rendered with cyan border treatment
- All other posts as compact rows: tags, title, description excerpt, date, read time
- Hover: border brightens to `#00f0ff33`

### Post (`/writing/:slug`)

- `← All writing` back link
- Tags, title (26px, 800 weight), author · date · read time
- Cyan gradient divider
- Prose column: 680px max-width, 15px font, 1.8 line-height, `#ccc` text color
- Embedded MDX components (e.g., `<KnowledgeGraph />`) sit inline in the prose with a `border: 1px solid #00f0ff22` container and a header bar showing "Interactive · Drag nodes to explore"
- Post footer: LinkedIn share button + prev/next essay navigation

### About (`/about`)

- Existing `About` section content at top, updated bio to foreground Agentic AI expertise
- Existing `Skills` grid below — same icons, categories, and layout, no visual redesign

### Portfolio (`/portfolio`)

- Page header + one-line intro
- Existing `Projects` card grid, unchanged

### Contact (`/contact`)

- Existing `Contact` section, unchanged

---

## KnowledgeGraph Component

**Library:** `react-force-graph-2d` (wraps D3 force simulation, React-native API)

**API:**

```jsx
<KnowledgeGraph
  nodes={[
    { id: "orchestrator", label: "Orchestrator", group: "core" },
    { id: "memory",       label: "Memory",       group: "system" },
    { id: "tools",        label: "Tools",         group: "system" },
  ]}
  links={[
    { source: "orchestrator", target: "memory" },
    { source: "orchestrator", target: "tools" },
  ]}
  height={400}   // optional, defaults to 400
/>
```

**Behavior:** Drag nodes, scroll to zoom, click node to highlight its connections. Node color driven by `group` field — `core` gets cyan (`#00f0ff`), `system` gets purple (`#7c3aed`), default gets `#555`. Edge color `#00f0ff22`. Styled to match site theme.

**Usage in MDX:**

```mdx
import KnowledgeGraph from '../components/visualizations/KnowledgeGraph'

Here is how a typical orchestration topology is structured:

<KnowledgeGraph nodes={[...]} links={[...]} />

Notice how every path runs through the orchestrator...
```

---

## Navigation Changes

Current navbar uses `react-scroll` `<Link>` for in-page sections. New navbar:

- Logo (`Harsha Pavuluri`) links to `/`
- Nav items: `Writing`, `About`, `Portfolio`, `Contact` — all React Router `<Link>` components
- Active route detection via `useMatch` — active item gets cyan color + bottom border
- Mobile hamburger menu preserved, same animation

---

## Theme & Styling

No changes to the existing theme. All new pages and components use the established Tailwind CSS variables:
- `bg-dark` (`#0a0a0f`), `bg-card` (`#111118`)
- Primary cyan `#00f0ff`, secondary purple `#7c3aed`
- Font: Inter

Prose typography in post pages uses explicit inline styles for font-size/line-height rather than a prose plugin, keeping the existing Tailwind v4 setup intact.

---

## What Is Not Changing

- Tailwind CSS v4 setup (no config file, `@tailwindcss/vite` plugin)
- Framer Motion animations — ScrollReveal, hover effects preserved
- tsParticles background — preserved on Home hero
- `src/data/` content files — unchanged, Portfolio and About pull from these
- GitHub Actions deploy workflow — unchanged, push to `main` still triggers build + deploy
