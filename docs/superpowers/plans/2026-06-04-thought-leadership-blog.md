# Thought Leadership Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform harshpavuluri.github.io from a scroll-based portfolio SPA into a thought leadership site with MDX essays, interactive knowledge graph components, and React Router–based navigation.

**Architecture:** React Router v6 (browser history mode) replaces react-scroll for navigation. MDX posts live in `src/posts/*.mdx` and are auto-discovered via `import.meta.glob`. A reusable `KnowledgeGraph` component backed by `react-force-graph-2d` can be embedded in any essay. Existing section components (About, Skills, Projects, Contact) are lifted into page components — no visual redesign needed.

**Tech Stack:** react-router-dom v6, @mdx-js/rollup, remark-frontmatter, remark-mdx-frontmatter, react-force-graph-2d, vitest, @testing-library/react, @testing-library/jest-dom, jsdom

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json` (scripts + deps)

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install react-router-dom @mdx-js/rollup remark-frontmatter remark-mdx-frontmatter react-force-graph-2d
```

Expected: packages added to `node_modules`, `package.json` updated.

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Add test scripts to package.json**

Open `package.json`. Find the `"scripts"` block and add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

So the scripts block looks like:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install blog and test dependencies"
```

---

### Task 2: Configure Vite for MDX + Vitest

**Files:**
- Modify: `vite.config.js`
- Create: `src/test-setup.js`

- [ ] **Step 1: Rewrite vite.config.js**

Replace the entire file with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }) },
    react(),
    tailwindcss(),
  ],
  base: '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
```

Note: `enforce: 'pre'` on the MDX plugin is required — it must transform `.mdx` before Vite's own transform pipeline runs, and before the React plugin. Order matters.

- [ ] **Step 2: Create test setup file**

Create `src/test-setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Verify dev server still starts**

```bash
npm run dev
```

Expected: dev server starts on `http://localhost:5173`. Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add vite.config.js src/test-setup.js
git commit -m "feat: configure MDX pipeline and vitest"
```

---

### Task 3: GitHub Pages routing fix

**Files:**
- Create: `public/404.html`
- Modify: `index.html`

- [ ] **Step 1: Create public/404.html**

Create `public/404.html` with this content exactly:

```html
<!DOCTYPE html>
<html>
  <head>
    <script>
      sessionStorage.setItem('spa-redirect', location.pathname + location.search + location.hash)
    </script>
    <meta http-equiv="refresh" content="0;URL='/'" />
  </head>
  <body></body>
</html>
```

When GitHub Pages receives a request for `/writing/my-essay`, it serves this file instead of 404. The script stores the intended path in `sessionStorage`, then immediately redirects to `/` (which GitHub Pages can serve). The script in `index.html` (next step) reads it back and restores the path before React mounts.

- [ ] **Step 2: Add restore script to index.html**

In `index.html`, add this script block immediately before the closing `</head>` tag:

```html
    <script>
      (function () {
        var redirect = sessionStorage.getItem('spa-redirect')
        if (redirect) {
          sessionStorage.removeItem('spa-redirect')
          history.replaceState(null, null, redirect)
        }
      })()
    </script>
  </head>
```

Also update the `<title>` and meta tags to reflect the new positioning:

```html
    <meta name="description" content="Harsha Pavuluri — Writing on Agentic AI, knowledge graphs, and enterprise data systems." />
    <meta property="og:title" content="Harsha Pavuluri" />
    <meta property="og:description" content="Writing on Agentic AI, knowledge graphs, and enterprise data systems." />
    <title>Harsha Pavuluri</title>
```

- [ ] **Step 3: Commit**

```bash
git add public/404.html index.html
git commit -m "feat: GitHub Pages SPA routing fix and update meta tags"
```

---

### Task 4: Post utility + tests

**Files:**
- Create: `src/lib/posts.js`
- Create: `src/lib/posts.test.js`

- [ ] **Step 1: Write the failing tests first**

Create `src/lib/posts.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { sortByDate, filterByTag, extractTags, getFeatured, getRecent } from './posts'

const posts = [
  { slug: 'a', title: 'A', date: '2026-01-01', tags: ['ai', 'agents'], featured: false },
  { slug: 'b', title: 'B', date: '2026-06-01', tags: ['ai', 'graphs'], featured: true },
  { slug: 'c', title: 'C', date: '2026-03-01', tags: ['engineering'], featured: false },
]

describe('sortByDate', () => {
  it('sorts newest first', () => {
    const result = sortByDate(posts)
    expect(result.map(p => p.slug)).toEqual(['b', 'c', 'a'])
  })

  it('does not mutate the original array', () => {
    const copy = [...posts]
    sortByDate(posts)
    expect(posts).toEqual(copy)
  })
})

describe('filterByTag', () => {
  it('returns all posts when tag is "all"', () => {
    expect(filterByTag(posts, 'all')).toHaveLength(3)
  })

  it('returns all posts when tag is empty string', () => {
    expect(filterByTag(posts, '')).toHaveLength(3)
  })

  it('filters by specific tag', () => {
    expect(filterByTag(posts, 'ai').map(p => p.slug)).toEqual(['a', 'b'])
  })

  it('returns empty array when no posts match', () => {
    expect(filterByTag(posts, 'nonexistent')).toHaveLength(0)
  })
})

describe('extractTags', () => {
  it('returns all unique tags', () => {
    const tags = extractTags(posts)
    expect(tags).toContain('ai')
    expect(tags).toContain('agents')
    expect(tags).toContain('graphs')
    expect(tags).toContain('engineering')
  })

  it('returns no duplicates', () => {
    const tags = extractTags(posts)
    expect(new Set(tags).size).toBe(tags.length)
  })
})

describe('getFeatured', () => {
  it('returns the post marked featured', () => {
    expect(getFeatured(posts)?.slug).toBe('b')
  })

  it('falls back to first post when none is featured', () => {
    const none = posts.map(p => ({ ...p, featured: false }))
    expect(getFeatured(none)?.slug).toBe('a')
  })

  it('returns null for empty array', () => {
    expect(getFeatured([])).toBeNull()
  })
})

describe('getRecent', () => {
  it('excludes the given slug', () => {
    const result = getRecent(posts, 'b', 3)
    expect(result.map(p => p.slug)).not.toContain('b')
  })

  it('returns at most n posts', () => {
    expect(getRecent(posts, 'b', 1)).toHaveLength(1)
  })

  it('returns all non-excluded when fewer than n exist', () => {
    expect(getRecent(posts, 'b', 10)).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './posts'`

- [ ] **Step 3: Create src/lib/posts.js**

Create `src/lib/posts.js`:

```js
// Pure utility functions — testable without Vite context
export function sortByDate(posts) {
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function filterByTag(posts, tag) {
  if (!tag || tag === 'all') return posts
  return posts.filter(p => Array.isArray(p.tags) && p.tags.includes(tag))
}

export function extractTags(posts) {
  return [...new Set(posts.flatMap(p => p.tags ?? []))]
}

export function getFeatured(posts) {
  return posts.find(p => p.featured) ?? posts[0] ?? null
}

export function getRecent(posts, excludeSlug, n = 3) {
  return posts.filter(p => p.slug !== excludeSlug).slice(0, n)
}

// Vite glob — discovers all .mdx files at build time
const modules = import.meta.glob('../posts/*.mdx', { eager: true })

export function getAllPosts() {
  return sortByDate(
    Object.entries(modules).map(([path, mod]) => ({
      slug: path.replace('../posts/', '').replace('.mdx', ''),
      Component: mod.default,
      ...mod.frontmatter,
    }))
  )
}

export function getPostBySlug(slug) {
  return getAllPosts().find(p => p.slug === slug) ?? null
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm test
```

Expected: All 11 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/posts.js src/lib/posts.test.js
git commit -m "feat: post utility functions with tests"
```

---

### Task 5: Convert App.jsx to React Router

**Files:**
- Modify: `src/App.jsx`
- Create: `src/pages/Home.jsx` (stub)
- Create: `src/pages/Writing.jsx` (stub)
- Create: `src/pages/Post.jsx` (stub)
- Create: `src/pages/About.jsx` (stub)
- Create: `src/pages/Portfolio.jsx` (stub)
- Create: `src/pages/Contact.jsx` (stub)

- [ ] **Step 1: Create stub page components**

Create each of these with a minimal placeholder so the router doesn't crash:

`src/pages/Home.jsx`:
```jsx
export default function Home() {
  return <div className="pt-24 text-center text-text-muted">Home — coming soon</div>
}
```

`src/pages/Writing.jsx`:
```jsx
export default function Writing() {
  return <div className="pt-24 text-center text-text-muted">Writing — coming soon</div>
}
```

`src/pages/Post.jsx`:
```jsx
export default function Post() {
  return <div className="pt-24 text-center text-text-muted">Post — coming soon</div>
}
```

`src/pages/About.jsx`:
```jsx
export default function About() {
  return <div className="pt-24 text-center text-text-muted">About — coming soon</div>
}
```

`src/pages/Portfolio.jsx`:
```jsx
export default function Portfolio() {
  return <div className="pt-24 text-center text-text-muted">Portfolio — coming soon</div>
}
```

`src/pages/Contact.jsx`:
```jsx
export default function Contact() {
  return <div className="pt-24 text-center text-text-muted">Contact — coming soon</div>
}
```

- [ ] **Step 2: Rewrite App.jsx**

Replace the entire file:

```jsx
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './sections/Footer'
import Home from './pages/Home'
import Writing from './pages/Writing'
import Post from './pages/Post'
import About from './pages/About'
import Portfolio from './pages/Portfolio'
import Contact from './pages/Contact'

function Layout() {
  return (
    <div className="bg-bg-dark text-text-primary font-body min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/writing', element: <Writing /> },
      { path: '/writing/:slug', element: <Post /> },
      { path: '/about', element: <About /> },
      { path: '/portfolio', element: <Portfolio /> },
      { path: '/contact', element: <Contact /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 3: Verify the router works**

```bash
npm run dev
```

Navigate to `http://localhost:5173`. You should see the Navbar + "Home — coming soon" + Footer. Visit `/writing`, `/about`, `/portfolio`, `/contact` — each should show its stub text. Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/pages/
git commit -m "feat: React Router layout with stub pages"
```

---

### Task 6: Convert Navbar to React Router

**Files:**
- Modify: `src/components/Navbar.jsx`

- [ ] **Step 1: Rewrite Navbar.jsx**

Replace the entire file:

```jsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { label: 'Writing', to: '/writing' },
  { label: 'About', to: '/about' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (to) =>
    to === '/writing'
      ? location.pathname.startsWith('/writing')
      : location.pathname === to

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-card/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-lg font-bold text-primary cursor-pointer glow-text"
          >
            Harsha Pavuluri
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  isActive(item.to)
                    ? 'text-primary border-b border-primary pb-0.5'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-primary"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-primary"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-primary"
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-card/95 backdrop-blur-md border-t border-primary-dim/20 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    isActive(item.to)
                      ? 'text-primary'
                      : 'text-text-muted hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
```

- [ ] **Step 2: Verify nav links work**

```bash
npm run dev
```

Click each nav link. Active route should show in cyan with an underline. Mobile hamburger should still animate. Ctrl+C to stop.

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.jsx
git commit -m "feat: convert Navbar to React Router links with active state"
```

---

### Task 7: Add prose styles to index.css

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Append prose styles**

Add the following to the end of `src/index.css`:

```css
/* MDX post prose styles */
.prose-post p {
  color: #cccccc;
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 1.25rem;
}

.prose-post h2 {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  letter-spacing: -0.3px;
}

.prose-post h3 {
  color: #e2e8f0;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.prose-post a {
  color: #00f0ff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose-post strong {
  color: #ffffff;
  font-weight: 600;
}

.prose-post em {
  color: #aaaaaa;
}

.prose-post code {
  background: #111118;
  border: 1px solid #1e1e2e;
  border-radius: 4px;
  padding: 0.1em 0.4em;
  font-size: 0.875em;
  color: #00f0ff;
}

.prose-post pre {
  background: #111118;
  border: 1px solid #1e1e2e;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1.25rem;
}

.prose-post pre code {
  background: none;
  border: none;
  padding: 0;
  color: #e2e8f0;
  font-size: 14px;
}

.prose-post blockquote {
  border-left: 3px solid #00f0ff;
  padding-left: 1rem;
  color: #94a3b8;
  font-style: italic;
  margin-bottom: 1.25rem;
}

.prose-post ul,
.prose-post ol {
  color: #cccccc;
  font-size: 15px;
  line-height: 1.8;
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
}

.prose-post li {
  margin-bottom: 0.25rem;
}

.prose-post hr {
  border-color: #1e1e2e;
  margin: 2rem 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: add prose styles for MDX post content"
```

---

### Task 8: KnowledgeGraph component + test

**Files:**
- Create: `src/components/visualizations/KnowledgeGraph.jsx`
- Create: `src/components/visualizations/KnowledgeGraph.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/visualizations/KnowledgeGraph.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import KnowledgeGraph from './KnowledgeGraph'

vi.mock('react-force-graph-2d', () => ({
  default: () => <canvas data-testid="force-graph" />,
}))

const nodes = [
  { id: 'a', label: 'Agent', group: 'core' },
  { id: 'b', label: 'Memory', group: 'system' },
]
const links = [{ source: 'a', target: 'b' }]

describe('KnowledgeGraph', () => {
  it('renders the interactive header', () => {
    render(<KnowledgeGraph nodes={nodes} links={links} />)
    expect(screen.getByText(/Interactive · Drag nodes to explore/i)).toBeInTheDocument()
  })

  it('renders the graph canvas', () => {
    render(<KnowledgeGraph nodes={nodes} links={links} />)
    expect(screen.getByTestId('force-graph')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module './KnowledgeGraph'`

- [ ] **Step 3: Create KnowledgeGraph.jsx**

Create `src/components/visualizations/KnowledgeGraph.jsx`:

```jsx
import { useRef, useEffect, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

const GROUP_COLORS = {
  core: '#00f0ff',
  system: '#7c3aed',
}

function nodeColor(node) {
  return GROUP_COLORS[node.group] ?? '#555555'
}

export default function KnowledgeGraph({ nodes, links, height = 400 }) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    if (!containerRef.current) return
    setWidth(containerRef.current.offsetWidth)
    const observer = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="my-8 border border-primary/10 rounded-xl overflow-hidden">
      <div className="bg-bg-card px-4 py-2 border-b border-primary-dim/20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary glow-cyan" />
        <span className="text-text-muted text-xs">Interactive · Drag nodes to explore</span>
      </div>
      <div ref={containerRef} className="w-full">
        <ForceGraph2D
          graphData={{ nodes, links }}
          width={width}
          height={height}
          nodeLabel="label"
          nodeColor={nodeColor}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const fontSize = Math.max(10, 12 / globalScale)
            ctx.font = `500 ${fontSize}px Inter, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#ffffff'
            ctx.fillText(node.label, node.x, node.y)
          }}
          linkColor={() => 'rgba(0,240,255,0.15)'}
          linkWidth={1.5}
          backgroundColor="#0d0d14"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run all tests — confirm they pass**

```bash
npm test
```

Expected: All 13 tests PASS (11 from posts.test.js + 2 from KnowledgeGraph.test.jsx).

- [ ] **Step 5: Commit**

```bash
git add src/components/visualizations/
git commit -m "feat: KnowledgeGraph component with D3 force graph"
```

---

### Task 9: Seed MDX post

**Files:**
- Create: `src/posts/2026-06-04-agentic-ai-future.mdx`

This post both seeds the blog and verifies the MDX pipeline end-to-end.

- [ ] **Step 1: Create the seed post**

Create `src/posts/2026-06-04-agentic-ai-future.mdx`:

```mdx
---
title: "The future of AI agents at enterprise scale"
date: 2026-06-04
description: "How agentic pipelines are shifting from demos to production — and what that means for the teams building them."
tags: [agentic-ai, enterprise, ibm]
featured: true
readTime: 8
---

import KnowledgeGraph from '../components/visualizations/KnowledgeGraph'

Agentic AI is no longer a research curiosity. Over the past eighteen months, the tooling has matured to a point where teams are shipping production pipelines — not demos. The question has shifted from *"can this work?"* to *"how do we make it reliable?"*

The gap between what an agent can theoretically do and what it can reliably do in a production environment is still wide. But it's closing. And the organizations that understand that gap — and build accordingly — are the ones that will have a structural advantage.

## The architecture of reliable agents

Most agentic failures aren't model failures — they're orchestration failures. The model knows what to do. The system around it doesn't know how to handle what happens when it does it wrong.

Here's a typical production orchestration topology:

<KnowledgeGraph
  nodes={[
    { id: "orchestrator", label: "Orchestrator", group: "core" },
    { id: "planner", label: "Planner", group: "system" },
    { id: "memory", label: "Memory", group: "system" },
    { id: "executor", label: "Executor", group: "system" },
    { id: "tools", label: "Tools", group: "system" },
    { id: "goals", label: "Goals", group: "leaf" },
    { id: "vectordb", label: "Vector DB", group: "leaf" },
    { id: "retry", label: "Retry", group: "leaf" },
    { id: "apis", label: "APIs", group: "leaf" },
  ]}
  links={[
    { source: "orchestrator", target: "planner" },
    { source: "orchestrator", target: "memory" },
    { source: "orchestrator", target: "executor" },
    { source: "orchestrator", target: "tools" },
    { source: "planner", target: "goals" },
    { source: "memory", target: "vectordb" },
    { source: "executor", target: "retry" },
    { source: "tools", target: "apis" },
  ]}
  height={380}
/>

Notice how every path runs through the orchestrator — that's both the strength and the fragility of this pattern. A single bad tool call can cascade.

## What enterprise teams get wrong

The most common mistake I see is treating agents like APIs. You don't call an agent with a request and expect a response. You deploy an agent with a contract and monitor its behavior.

This distinction matters enormously for how you instrument, test, and operate these systems.

---

*More coming soon. This is a work in progress.*
```

- [ ] **Step 2: Verify the MDX pipeline compiles**

```bash
npm run dev
```

Dev server should start without errors. If you see a Vite transform error, the MDX plugin config is wrong — re-check `vite.config.js` step 1. Ctrl+C to stop.

- [ ] **Step 3: Commit**

```bash
git add src/posts/
git commit -m "feat: add seed MDX essay with embedded KnowledgeGraph"
```

---

### Task 10: Home page

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Implement Home.jsx**

Replace the stub with:

```jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ParticleBackground from '../components/ParticleBackground'
import { getAllPosts, getFeatured, getRecent } from '../lib/posts'
import { socialLinks } from '../data/socialLinks'
import { personalInfo } from '../data/personalInfo'

export default function Home() {
  const posts = getAllPosts()
  const featured = getFeatured(posts)
  const recent = getRecent(posts, featured?.slug, 3)

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-start justify-center pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ParticleBackground />
        </div>
        <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-transparent to-bg-dark" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 glow-text text-white">
            {personalInfo.name}
          </h1>
          <p className="text-primary font-medium mb-4 text-sm md:text-base">
            Data Engineer @ IBM · Agentic AI · Knowledge Graphs · Enterprise Data Systems
          </p>
          <p className="text-text-muted text-base leading-relaxed mb-6 max-w-xl">
            I write about autonomous AI systems, the infrastructure that makes them work,
            and what they mean for enterprise. Currently building at IBM Data &amp; AI.
          </p>
          <div className="flex gap-3 flex-wrap">
            {socialLinks.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-4 py-2 rounded-full border border-primary-dim/30 text-text-muted
                           hover:text-primary hover:border-primary/60 transition-colors duration-300"
              >
                {link.name} ↗
              </a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24">
        <div className="h-px bg-gradient-to-r from-primary/20 to-transparent mb-12" />

        {/* Featured post */}
        {featured && (
          <div className="mb-12">
            <p className="text-xs text-secondary font-semibold tracking-widest uppercase mb-4">
              Featured Essay
            </p>
            <Link to={`/writing/${featured.slug}`}>
              <motion.div
                whileHover={{ borderColor: 'rgba(0,240,255,0.4)' }}
                className="border border-primary/20 rounded-xl p-6 bg-bg-card cursor-pointer transition-colors duration-300"
              >
                <div className="flex flex-wrap gap-2 mb-3 items-center">
                  {featured.tags?.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-text-muted ml-auto">{featured.readTime} min read</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 leading-snug">{featured.title}</h2>
                <p className="text-text-muted text-sm leading-relaxed mb-4">{featured.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">
                    {new Date(featured.date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                  <span className="text-primary text-sm">Read →</span>
                </div>
              </motion.div>
            </Link>
          </div>
        )}

        {/* Recent writing */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-secondary font-semibold tracking-widest uppercase">
                Recent Writing
              </p>
              <Link to="/writing" className="text-primary text-xs hover:underline">
                All essays →
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recent.map(post => (
                <Link key={post.slug} to={`/writing/${post.slug}`}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(0,240,255,0.2)' }}
                    className="border border-primary-dim/20 rounded-lg px-5 py-4 bg-bg-card
                               flex items-center gap-4 cursor-pointer transition-colors duration-300"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{post.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' · '}{post.readTime} min
                        {post.tags?.[0] && (
                          <> · <span className="text-secondary/70">{post.tags[0]}</span></>
                        )}
                      </p>
                    </div>
                    <span className="text-text-muted text-sm flex-shrink-0">→</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Visit `http://localhost:5173`. You should see: name with glow + particle background, cyan tagline, bio, social links, then the featured essay card and recent writing list below. Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: Home page with identity block, featured post, and recent writing"
```

---

### Task 11: Writing list page

**Files:**
- Modify: `src/pages/Writing.jsx`

- [ ] **Step 1: Implement Writing.jsx**

Replace the stub with:

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllPosts, filterByTag, extractTags } from '../lib/posts'

export default function Writing() {
  const allPosts = getAllPosts()
  const tags = extractTags(allPosts)
  const [activeTag, setActiveTag] = useState('all')
  const visible = filterByTag(allPosts, activeTag)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Writing</h1>
      <p className="text-text-muted text-base mb-8">
        Essays on Agentic AI, knowledge systems, and enterprise data engineering.
      </p>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', ...tags].map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${
              activeTag === tag
                ? 'border-primary text-primary bg-primary/10'
                : 'border-primary-dim/30 text-text-muted hover:border-primary/40 hover:text-primary'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="flex flex-col gap-4">
        {visible.map(post => (
          <Link key={post.slug} to={`/writing/${post.slug}`}>
            <motion.div
              whileHover={{ borderColor: 'rgba(0,240,255,0.3)' }}
              className={`border rounded-xl p-5 bg-bg-card cursor-pointer transition-colors duration-300 ${
                post.featured ? 'border-primary/30' : 'border-primary-dim/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Featured
                      </span>
                    )}
                    {post.tags?.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-base font-bold text-white mb-1 leading-snug">{post.title}</h2>
                  <p className="text-text-muted text-sm leading-relaxed line-clamp-2">{post.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-text-muted whitespace-nowrap">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-text-muted">{post.readTime} min</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}

        {visible.length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">No essays with this tag yet.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Navigate to `/writing`. You should see the "Writing" heading, tag filter pills, and the seed essay card. Clicking a tag filter should update the list. Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Writing.jsx
git commit -m "feat: Writing list page with tag filtering"
```

---

### Task 12: Post page (MDX renderer)

**Files:**
- Modify: `src/pages/Post.jsx`

- [ ] **Step 1: Implement Post.jsx**

Replace the stub with:

```jsx
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { getAllPosts, getPostBySlug } from '../lib/posts'

export default function Post() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = getPostBySlug(slug)

  useEffect(() => {
    if (!post) navigate('/writing', { replace: true })
  }, [post, navigate])

  if (!post) return null

  const allPosts = getAllPosts()
  const idx = allPosts.findIndex(p => p.slug === slug)
  const prev = allPosts[idx + 1] ?? null
  const next = allPosts[idx - 1] ?? null

  const { Component, title, date, tags, readTime } = post
  const shareUrl = `https://harshpavuluri.github.io/writing/${slug}`
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24">
      {/* Back */}
      <Link
        to="/writing"
        className="text-text-muted text-sm hover:text-primary transition-colors mb-8 block"
      >
        ← All writing
      </Link>

      {/* Post header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags?.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">{title}</h1>
        <div className="flex items-center gap-3 text-text-muted text-xs">
          <span>Harsha Pavuluri</span>
          <span>·</span>
          <span>
            {new Date(date).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </span>
          <span>·</span>
          <span>{readTime} min read</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-primary/20 to-transparent mb-8" />

      {/* MDX content */}
      <div className="prose-post">
        <Component />
      </div>

      {/* Footer */}
      <div className="border-t border-primary-dim/20 mt-12 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-text-muted text-xs mb-2">Share this essay</p>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-full border border-[#0077b5]/40 text-[#0077b5]
                       bg-[#0077b5]/10 hover:bg-[#0077b5]/20 transition-colors"
          >
            Share on LinkedIn ↗
          </a>
        </div>
        <div className="flex gap-6 text-sm flex-wrap">
          {prev && (
            <Link
              to={`/writing/${prev.slug}`}
              className="text-text-muted hover:text-primary transition-colors"
            >
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link
              to={`/writing/${next.slug}`}
              className="text-text-muted hover:text-primary transition-colors"
            >
              {next.title} →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Click the seed essay from the home page or `/writing`. You should see the post header, the MDX prose, and the embedded `KnowledgeGraph` force graph rendering with draggable nodes. The LinkedIn share button should appear in the footer. Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Post.jsx
git commit -m "feat: Post page rendering MDX with LinkedIn share and prev/next nav"
```

---

### Task 13: About, Portfolio, Contact pages

**Files:**
- Modify: `src/pages/About.jsx`
- Modify: `src/pages/Portfolio.jsx`
- Modify: `src/pages/Contact.jsx`

These lift existing section components into page wrappers with minimal additions.

- [ ] **Step 1: Implement About.jsx**

Replace the stub:

```jsx
import AboutSection from '../sections/About'
import Skills from '../sections/Skills'

export default function About() {
  return (
    <div className="pt-16">
      <AboutSection />
      <Skills />
    </div>
  )
}
```

- [ ] **Step 2: Implement Portfolio.jsx**

Replace the stub:

```jsx
import Projects from '../sections/Projects'

export default function Portfolio() {
  return (
    <div className="pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-text-muted text-base">A selection of projects I've built and shipped.</p>
      </div>
      <Projects />
    </div>
  )
}
```

- [ ] **Step 3: Implement Contact.jsx**

Replace the stub:

```jsx
import ContactSection from '../sections/Contact'

export default function Contact() {
  return (
    <div className="pt-16">
      <ContactSection />
    </div>
  )
}
```

- [ ] **Step 4: Verify all three pages in browser**

```bash
npm run dev
```

Visit `/about` — bio text + skills grid. Visit `/portfolio` — project cards. Visit `/contact` — contact cards + social icons. All should look identical to the original scroll sections. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add src/pages/About.jsx src/pages/Portfolio.jsx src/pages/Contact.jsx
git commit -m "feat: About, Portfolio, and Contact pages lifting existing sections"
```

---

### Task 14: Remove unused scroll dependencies + final verification

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Uninstall react-scroll**

`react-scroll` is no longer used anywhere now that Navbar has been converted.

```bash
npm uninstall react-scroll
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: All 13 tests PASS.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: Build completes in `dist/` with no errors or warnings about missing modules.

- [ ] **Step 4: Preview the production build**

```bash
npm run preview
```

Visit `http://localhost:4173`. Walk through the full site:
- `/` — Home: particle background, identity block, featured essay card, recent writing list
- `/writing` — Writing list with tag filters
- `/writing/2026-06-04-agentic-ai-future` — Post with MDX prose + draggable KnowledgeGraph
- `/about` — Bio + skills grid
- `/portfolio` — Project cards
- `/contact` — Contact info + social links

Ctrl+C.

- [ ] **Step 5: Add .superpowers to .gitignore**

Check if `.gitignore` already has `.superpowers/`. If not, add it:

```bash
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 6: Final commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "feat: remove react-scroll, add .superpowers to gitignore"
```

- [ ] **Step 7: Push to deploy**

```bash
git push origin main
```

GitHub Actions will build and deploy. Visit `https://harshpavuluri.github.io` after ~2 minutes to verify the live site.
