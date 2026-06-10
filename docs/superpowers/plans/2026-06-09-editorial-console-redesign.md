# Editorial Console Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the site into an "editorial console" — clean writing-first layout with real, build-time knowledge-graph stats, a live graph panel, post constellations, a tag-network filter, and GoatCounter analytics.

**Architecture:** Pure data helpers live in `src/lib/` (graph building, stats, relatedness, view counts) and are unit-tested with Vitest. UI components in `src/components/` consume them. The existing `SiteGraphHero` is split into a reusable `SiteGraph` renderer (lib data → ForceGraph2D) plus a `GraphPanel` wrapper with a fullscreen overlay. All visuals are theme-aware via CSS variables and respect `prefers-reduced-motion`.

**Tech Stack:** React 19, Vite 7, Tailwind v4 (`@theme` CSS variables), framer-motion, react-force-graph-2d, Vitest + jsdom, GoatCounter (privacy-friendly analytics).

**Spec:** `docs/superpowers/specs/2026-06-09-editorial-console-redesign-design.md`

**Branch:** create `feature/editorial-console` off `draft/working-memory-agents` (the interactive-frontend commit 2d22950 lives there and is the base for this work).

**Commands:**
- Tests: `npm test` (all) or `npx vitest run src/lib/siteStats.test.js` (one file)
- Build: `npm run build`
- Dev server: `npm run dev`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/lib/posts.js` | Modify | + `getRelatedPosts`, `tagCooccurrence` (pure) |
| `src/lib/posts.test.js` | Modify | tests for the above |
| `src/lib/siteGraph.js` | Create | `buildSiteGraph` (moved from SiteGraphHero, parameterized), `getSiteGraph`, `buildConstellation` |
| `src/lib/siteGraph.test.js` | Create | graph/constellation tests |
| `src/lib/siteStats.js` | Create | `computeSiteStats` (pure), `getSiteStats` |
| `src/lib/siteStats.test.js` | Create | stats tests |
| `src/lib/views.js` | Create | GoatCounter `parseCount`, `fetchViewCount` |
| `src/lib/views.test.js` | Create | mocked-fetch tests |
| `src/components/SiteGraph.jsx` | Create | generic force-graph renderer (`panel`/`fullscreen` modes) |
| `src/components/SiteGraphHero.jsx` | Delete | replaced by SiteGraph + GraphPanel |
| `src/components/GraphPanel.jsx` | Create | console card: header, compact graph, expand → fullscreen overlay |
| `src/components/StatusBar.jsx` | Create | `hero` and `footer` status variants |
| `src/components/NodeDivider.jsx` | Create | node-edge section divider |
| `src/components/AmbientGraph.jsx` | Create | decorative drifting hero background |
| `src/components/ViewCount.jsx` | Create | per-path view count (renders nothing on failure) |
| `src/components/PageviewTracker.jsx` | Create | GoatCounter SPA route-change counting |
| `src/components/TagNetwork.jsx` | Create | clickable tag-node filter strip |
| `src/index.css` | Modify | blink/pulse/float keyframes, status-dot, prose hr node-edge style |
| `src/pages/Home.jsx` | Modify | full rewrite: status bar, prompt hero, console row, recent |
| `src/pages/Post.jsx` | Modify | + constellation, + view count |
| `src/pages/Writing.jsx` | Modify | pill filters → TagNetwork |
| `src/sections/Footer.jsx` | Modify | + footer status line, + social links |
| `src/sections/About.jsx` | Modify | console label restyle |
| `src/sections/Skills.jsx` | Modify | icon grid → radial skill clusters |
| `src/sections/Projects.jsx` | Modify | edge connectors between cards |
| `src/pages/Portfolio.jsx` | Modify | console label |
| `src/App.jsx` | Modify | mount PageviewTracker |
| `index.html` | Modify | GoatCounter script (SPA mode) |

---

### Task 0: Branch setup

- [ ] **Step 1: Create the feature branch**

```bash
git checkout draft/working-memory-agents
git checkout -b feature/editorial-console
```

- [ ] **Step 2: Verify baseline is green**

Run: `npm test`
Expected: all existing tests pass (28 tests at time of writing).

Run: `npm run build`
Expected: build succeeds.

---

### Task 1: Post relatedness + tag co-occurrence helpers

**Files:**
- Modify: `src/lib/posts.js`
- Test: `src/lib/posts.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/posts.test.js` (and add `getRelatedPosts, tagCooccurrence` to the import from `./posts`):

```js
describe('getRelatedPosts', () => {
  it('returns posts sharing at least one tag', () => {
    const related = getRelatedPosts(posts, 'a')
    expect(related.map(p => p.slug)).toContain('b')
  })

  it('excludes the current post and unrelated posts', () => {
    const slugs = getRelatedPosts(posts, 'a').map(p => p.slug)
    expect(slugs).not.toContain('a')
    expect(slugs).not.toContain('c')
  })

  it('ranks higher tag overlap first', () => {
    const many = [
      { slug: 'x', date: '2026-01-01', tags: ['ai', 'agents', 'graphs'] },
      { slug: 'y', date: '2026-02-01', tags: ['ai'] },
      { slug: 'z', date: '2026-03-01', tags: ['ai', 'agents'] },
    ]
    expect(getRelatedPosts(many, 'x').map(p => p.slug)).toEqual(['z', 'y'])
  })

  it('respects the limit n', () => {
    expect(getRelatedPosts(posts, 'a', 0)).toHaveLength(0)
  })

  it('returns empty array when the post has no tags or does not exist', () => {
    expect(getRelatedPosts([{ slug: 'solo', date: '2026-01-01' }], 'solo')).toEqual([])
    expect(getRelatedPosts(posts, 'nope')).toEqual([])
  })
})

describe('tagCooccurrence', () => {
  it('counts tag pairs that appear on the same post', () => {
    const pairs = tagCooccurrence([
      { tags: ['ai', 'agents'] },
      { tags: ['agents', 'ai'] },
      { tags: ['ai', 'graphs'] },
    ])
    expect(pairs).toContainEqual({ a: 'agents', b: 'ai', count: 2 })
    expect(pairs).toContainEqual({ a: 'ai', b: 'graphs', count: 1 })
  })

  it('ignores posts with fewer than two tags', () => {
    expect(tagCooccurrence([{ tags: ['ai'] }, { tags: [] }, {}])).toEqual([])
  })

  it('orders pair keys alphabetically so pairs are stable', () => {
    const pairs = tagCooccurrence([{ tags: ['zebra', 'alpha'] }])
    expect(pairs).toEqual([{ a: 'alpha', b: 'zebra', count: 1 }])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/posts.test.js`
Expected: FAIL — `getRelatedPosts is not a function` (or import error).

- [ ] **Step 3: Implement in `src/lib/posts.js`**

Append above the `// Vite glob` comment:

```js
export function getRelatedPosts(posts, slug, n = 3) {
  const current = posts.find(p => p.slug === slug)
  if (!current?.tags?.length) return []
  return posts
    .filter(p => p.slug !== slug)
    .map(p => ({ post: p, overlap: (p.tags ?? []).filter(t => current.tags.includes(t)).length }))
    .filter(x => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || new Date(b.post.date) - new Date(a.post.date))
    .slice(0, n)
    .map(x => x.post)
}

// Pairs of tags that appear together on a post, with co-occurrence counts.
// Pair keys are sorted alphabetically: { a: 'agents', b: 'ai', count: 2 }
export function tagCooccurrence(posts) {
  const counts = new Map()
  posts.forEach(p => {
    const tags = [...new Set(p.tags ?? [])].sort()
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const key = `${tags[i]}|${tags[j]}`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  })
  return [...counts.entries()].map(([key, count]) => {
    const [a, b] = key.split('|')
    return { a, b, count }
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/posts.test.js`
Expected: PASS, all tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/posts.js src/lib/posts.test.js
git commit -m "feat: add getRelatedPosts and tagCooccurrence helpers"
```

---

### Task 2: Extract `buildSiteGraph` into `src/lib/siteGraph.js` + add `buildConstellation`

**Files:**
- Create: `src/lib/siteGraph.js`
- Test: `src/lib/siteGraph.test.js`
- Modify: `src/components/SiteGraphHero.jsx` (import from lib, delete local copy)

The current `buildSiteGraph` lives in `src/components/SiteGraphHero.jsx:11-54` and imports its data directly. Parameterize it (testable), keep a `getSiteGraph()` convenience wrapper that injects real site data.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/siteGraph.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { buildSiteGraph, buildConstellation } from './siteGraph'

const posts = [
  { slug: 'a', title: 'Essay A', date: '2026-01-01', tags: ['ai', 'agents'] },
  { slug: 'b', title: 'Essay B', date: '2026-06-01', tags: ['ai'] },
  { slug: 'c', title: 'Essay C', date: '2026-03-01', tags: ['other'] },
]
const projects = [{ title: 'Proj One', link: 'https://github.com/x' }]
const skillCategories = [{ category: 'Languages', skills: [] }]

describe('buildSiteGraph', () => {
  const graph = buildSiteGraph(posts, projects, skillCategories)

  it('creates the core and hub nodes', () => {
    const ids = graph.nodes.map(n => n.id)
    expect(ids).toContain('me')
    expect(ids).toContain('hub:writing')
    expect(ids).toContain('hub:portfolio')
    expect(ids).toContain('hub:about')
  })

  it('links every post to the writing hub', () => {
    posts.forEach(p => {
      expect(graph.links).toContainEqual({ source: 'hub:writing', target: `post:${p.slug}` })
    })
  })

  it('creates exactly one node per unique tag', () => {
    const tagNodes = graph.nodes.filter(n => n.group === 'tag')
    expect(tagNodes.map(n => n.id).sort()).toEqual(['tag:agents', 'tag:ai', 'tag:other'])
  })

  it('has no dangling link endpoints', () => {
    const ids = new Set(graph.nodes.map(n => n.id))
    graph.links.forEach(l => {
      expect(ids.has(l.source)).toBe(true)
      expect(ids.has(l.target)).toBe(true)
    })
  })
})

describe('buildConstellation', () => {
  it('returns null for a post with no tags', () => {
    expect(buildConstellation([{ slug: 'x', title: 'X', date: '2026-01-01' }], 'x')).toBeNull()
  })

  it('returns null for an unknown slug', () => {
    expect(buildConstellation(posts, 'nope')).toBeNull()
  })

  it('includes the current essay as the core node', () => {
    const c = buildConstellation(posts, 'a')
    const core = c.nodes.find(n => n.group === 'core')
    expect(core.id).toBe('post:a')
    expect(core.route).toBeUndefined()
  })

  it('includes tag nodes linked to the current essay', () => {
    const c = buildConstellation(posts, 'a')
    expect(c.nodes.map(n => n.id)).toEqual(expect.arrayContaining(['tag:ai', 'tag:agents']))
    expect(c.links).toContainEqual({ source: 'post:a', target: 'tag:ai' })
  })

  it('includes related essays but not unrelated ones, linked via shared tags', () => {
    const c = buildConstellation(posts, 'a')
    const ids = c.nodes.map(n => n.id)
    expect(ids).toContain('post:b')
    expect(ids).not.toContain('post:c')
    expect(c.links).toContainEqual({ source: 'post:b', target: 'tag:ai' })
  })

  it('gives related essays a navigable route', () => {
    const c = buildConstellation(posts, 'a')
    expect(c.nodes.find(n => n.id === 'post:b').route).toBe('/writing/b')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/siteGraph.test.js`
Expected: FAIL — cannot resolve `./siteGraph`.

- [ ] **Step 3: Create `src/lib/siteGraph.js`**

```js
import { getAllPosts, getRelatedPosts } from './posts'
import { projects as siteProjects } from '../data/projects'
import { skillCategories as siteSkillCategories } from '../data/skills'

// Build the site itself as a knowledge graph: pages are hubs,
// essays / projects / skills are leaves, tags bridge essays together.
export function buildSiteGraph(posts, projects, skillCategories) {
  const nodes = []
  const links = []
  const add = (node) => { nodes.push(node); return node }

  add({ id: 'me', label: 'Harsha', group: 'core', val: 14 })
  add({ id: 'hub:writing', label: 'Writing', group: 'hub', val: 8, route: '/writing' })
  add({ id: 'hub:portfolio', label: 'Portfolio', group: 'hub', val: 8, route: '/portfolio' })
  add({ id: 'hub:about', label: 'About', group: 'hub', val: 8, route: '/about' })
  links.push(
    { source: 'me', target: 'hub:writing' },
    { source: 'me', target: 'hub:portfolio' },
    { source: 'me', target: 'hub:about' },
  )

  const tagIds = new Set()
  posts.forEach(post => {
    const id = `post:${post.slug}`
    add({ id, label: post.title, group: 'post', val: 6, route: `/writing/${post.slug}` })
    links.push({ source: 'hub:writing', target: id })
    post.tags?.forEach(tag => {
      const tagId = `tag:${tag}`
      if (!tagIds.has(tagId)) {
        tagIds.add(tagId)
        add({ id: tagId, label: tag, group: 'tag', val: 3, route: '/writing' })
      }
      links.push({ source: id, target: tagId })
    })
  })

  projects.forEach(project => {
    const id = `project:${project.title}`
    add({ id, label: project.title, group: 'project', val: 5, href: project.link, route: project.link ? null : '/portfolio' })
    links.push({ source: 'hub:portfolio', target: id })
  })

  skillCategories.forEach(cat => {
    const id = `skills:${cat.category}`
    add({ id, label: cat.category, group: 'skill', val: 4, route: '/about' })
    links.push({ source: 'hub:about', target: id })
  })

  return { nodes, links }
}

// Convenience wrapper that injects real site data. Returns fresh node/link
// objects each call (force-graph mutates node positions in place).
export function getSiteGraph() {
  return buildSiteGraph(getAllPosts(), siteProjects, siteSkillCategories)
}

// The neighborhood of one essay: the essay (core), its tags, and essays
// sharing >=1 tag, linked through the shared tags. Null if no tags.
export function buildConstellation(posts, slug) {
  const current = posts.find(p => p.slug === slug)
  if (!current?.tags?.length) return null

  const nodes = [{ id: `post:${current.slug}`, label: current.title, group: 'core', val: 10 }]
  const links = []

  current.tags.forEach(tag => {
    nodes.push({ id: `tag:${tag}`, label: tag, group: 'tag', val: 4, route: '/writing' })
    links.push({ source: `post:${current.slug}`, target: `tag:${tag}` })
  })

  getRelatedPosts(posts, slug, 6).forEach(p => {
    nodes.push({ id: `post:${p.slug}`, label: p.title, group: 'post', val: 6, route: `/writing/${p.slug}` })
    p.tags
      .filter(t => current.tags.includes(t))
      .forEach(t => links.push({ source: `post:${p.slug}`, target: `tag:${t}` }))
  })

  return { nodes, links }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/siteGraph.test.js`
Expected: PASS.

- [ ] **Step 5: Point `SiteGraphHero.jsx` at the lib (keep the site working until Task 6 replaces it)**

In `src/components/SiteGraphHero.jsx`:
- Delete the local `buildSiteGraph` function (lines 9–54) and its now-unused imports (`getAllPosts`, `projects`, `skillCategories`).
- Add `import { getSiteGraph } from '../lib/siteGraph'`.
- Change `const data = useMemo(() => buildSiteGraph(), [])` to `const data = useMemo(() => getSiteGraph(), [])`.
- Remove the `export` of `buildSiteGraph` if anything imported it — check with: `grep -rn "from './SiteGraphHero'" src/` and update any importer to use `../lib/siteGraph`.

- [ ] **Step 6: Run full suite + build**

Run: `npm test` → PASS. Run: `npm run build` → succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/lib/siteGraph.js src/lib/siteGraph.test.js src/components/SiteGraphHero.jsx
git commit -m "refactor: extract buildSiteGraph to lib, add buildConstellation"
```

---

### Task 3: Site stats

**Files:**
- Create: `src/lib/siteStats.js`
- Test: `src/lib/siteStats.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/siteStats.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { computeSiteStats } from './siteStats'

const graph = {
  nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
  links: [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }],
}
const posts = [
  { slug: 'old', date: '2026-01-15' },
  { slug: 'new', date: '2026-06-06' },
]

describe('computeSiteStats', () => {
  const stats = computeSiteStats(graph, posts)

  it('counts nodes and edges from the graph', () => {
    expect(stats.nodeCount).toBe(3)
    expect(stats.edgeCount).toBe(2)
  })

  it('counts essays', () => {
    expect(stats.essayCount).toBe(2)
  })

  it('formats lastUpdated from the newest post date', () => {
    expect(stats.lastUpdated).toBe('Jun 6')
  })

  it('returns null lastUpdated for no posts', () => {
    expect(computeSiteStats(graph, []).lastUpdated).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/siteStats.test.js`
Expected: FAIL — cannot resolve `./siteStats`.

- [ ] **Step 3: Create `src/lib/siteStats.js`**

```js
import { getSiteGraph } from './siteGraph'
import { getAllPosts } from './posts'

export function computeSiteStats(graph, posts) {
  const newest = posts.reduce(
    (max, p) => (!max || new Date(p.date) > new Date(max) ? p.date : max),
    null,
  )
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.links.length,
    essayCount: posts.length,
    lastUpdated: newest
      ? new Date(newest).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : null,
  }
}

export function getSiteStats() {
  return computeSiteStats(getSiteGraph(), getAllPosts())
}
```

Note: post dates are date-only strings like `'2026-06-06'`; `toLocaleDateString` parses them as UTC. If the expected test value is off by one day in your timezone, format with `timeZone: 'UTC'` added to the options object — and keep that in the implementation.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/siteStats.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/siteStats.js src/lib/siteStats.test.js
git commit -m "feat: add siteStats computed from graph and posts"
```

---

### Task 4: GoatCounter view-count helper

**Files:**
- Create: `src/lib/views.js`
- Test: `src/lib/views.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/views.test.js`:

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseCount, fetchViewCount } from './views'

afterEach(() => vi.unstubAllGlobals())

describe('parseCount', () => {
  it('parses plain counts', () => {
    expect(parseCount({ count: '42' })).toBe(42)
  })

  it('parses formatted counts with separators', () => {
    expect(parseCount({ count: '1 234' })).toBe(1234)
  })

  it('returns null for missing or non-numeric count', () => {
    expect(parseCount({})).toBeNull()
    expect(parseCount(null)).toBeNull()
    expect(parseCount({ count: '—' })).toBeNull()
  })
})

describe('fetchViewCount', () => {
  it('returns the parsed count on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: '42' }) }))
    expect(await fetchViewCount('/writing/foo')).toBe(42)
  })

  it('returns null on a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await fetchViewCount('/')).toBeNull()
  })

  it('returns null when fetch rejects (offline / ad-blocked)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('blocked')))
    expect(await fetchViewCount('/')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/views.test.js`
Expected: FAIL — cannot resolve `./views`.

- [ ] **Step 3: Create `src/lib/views.js`**

```js
// GoatCounter integration. The site code must exist as an account at
// https://<code>.goatcounter.com (Settings: allow the counter.json endpoint).
// Every consumer treats null as "omit the views UI" — never show 0 or a placeholder.
export const GOATCOUNTER_CODE = 'harshpavuluri'

export function parseCount(data) {
  if (!data || typeof data.count !== 'string') return null
  const digits = data.count.replace(/\D/g, '')
  return digits ? Number(digits) : null
}

// Resolves to a number, or null on any failure. Pass 'TOTAL' for site-wide views.
export async function fetchViewCount(path) {
  try {
    const res = await fetch(
      `https://${GOATCOUNTER_CODE}.goatcounter.com/counter/${encodeURIComponent(path)}.json`,
    )
    if (!res.ok) return null
    return parseCount(await res.json())
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/views.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/views.js src/lib/views.test.js
git commit -m "feat: add GoatCounter view-count helper with graceful fallback"
```

---

### Task 5: CSS foundations + small visual components

**Files:**
- Modify: `src/index.css`
- Create: `src/components/NodeDivider.jsx`
- Create: `src/components/AmbientGraph.jsx`

No unit tests (pure presentation); verified by build + Task 13 manual check.

- [ ] **Step 1: Add CSS to `src/index.css`**

Append after the `.glow-border` block (before `[data-theme="light"]`):

```css
/* Editorial-console: status dot, prompt cursor, ambient drift */
.status-dot {
  display: inline-block;
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.7);
  animation: pulse-dot 2.4s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

.cursor-blink {
  animation: blink 1.1s step-end infinite;
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.ambient-float {
  animation: ambient-float 14s ease-in-out infinite;
}

.ambient-float-slow {
  animation: ambient-float 20s ease-in-out infinite reverse;
}

@keyframes ambient-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@media (prefers-reduced-motion: reduce) {
  .status-dot,
  .cursor-blink,
  .ambient-float,
  .ambient-float-slow {
    animation: none;
  }
}
```

Then replace the existing `.prose-post hr` rule (currently `border-color: var(--color-border); margin: 2rem 0;`) with the node-edge style:

```css
.prose-post hr {
  border: none;
  height: 1px;
  margin: 2.5rem 0;
  position: relative;
  overflow: visible;
  background: linear-gradient(
    to right,
    transparent,
    color-mix(in srgb, var(--color-primary) 30%, transparent) 35%,
    color-mix(in srgb, var(--color-primary) 30%, transparent) 65%,
    transparent
  );
}

.prose-post hr::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  opacity: 0.6;
}
```

- [ ] **Step 2: Create `src/components/NodeDivider.jsx`**

```jsx
// Section divider drawn as an edge with a node on it.
export default function NodeDivider({ className = '' }) {
  return (
    <div className={`flex items-center ${className}`} aria-hidden="true">
      <div className="h-px flex-[2] bg-gradient-to-r from-transparent to-primary/30" />
      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mx-1.5 flex-shrink-0" />
      <div className="h-px flex-[3] bg-gradient-to-r from-primary/30 to-transparent" />
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/AmbientGraph.jsx`**

```jsx
// Decorative drifting graph behind the hero. aria-hidden; animation is
// disabled by the prefers-reduced-motion block in index.css.
export default function AmbientGraph() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.13]" aria-hidden="true">
      <svg viewBox="0 0 900 320" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <g className="ambient-float" stroke="var(--color-primary)" fill="var(--color-primary)">
          <line x1="80" y1="120" x2="240" y2="60" strokeOpacity="0.6" />
          <line x1="240" y1="60" x2="430" y2="140" strokeOpacity="0.6" />
          <line x1="430" y1="140" x2="600" y2="70" strokeOpacity="0.6" />
          <circle cx="80" cy="120" r="5" />
          <circle cx="240" cy="60" r="7" />
          <circle cx="430" cy="140" r="5" />
          <circle cx="600" cy="70" r="7" />
        </g>
        <g className="ambient-float-slow" stroke="var(--color-secondary)" fill="var(--color-secondary)">
          <line x1="600" y1="70" x2="760" y2="180" strokeOpacity="0.5" />
          <line x1="430" y1="140" x2="320" y2="250" strokeOpacity="0.5" />
          <line x1="760" y1="180" x2="850" y2="90" strokeOpacity="0.5" />
          <circle cx="760" cy="180" r="5" />
          <circle cx="320" cy="250" r="4" />
          <circle cx="850" cy="90" r="4" />
        </g>
      </svg>
    </div>
  )
}
```

- [ ] **Step 4: Verify build + tests**

Run: `npm run build` → succeeds. Run: `npm test` → all pass.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/components/NodeDivider.jsx src/components/AmbientGraph.jsx
git commit -m "feat: console CSS primitives, NodeDivider, AmbientGraph"
```

---

### Task 6: `SiteGraph` renderer + `GraphPanel` with fullscreen overlay

**Files:**
- Create: `src/components/SiteGraph.jsx`
- Create: `src/components/GraphPanel.jsx`
- Delete: `src/components/SiteGraphHero.jsx`
- Modify: `src/pages/Home.jsx` (import swap only — full rewrite is Task 8)

No unit tests (canvas rendering); verified by build + manual check in Task 13.

- [ ] **Step 1: Create `src/components/SiteGraph.jsx`**

This is `SiteGraphHero` generalized: graph data comes in as a prop, height is a prop, and `mode` gates zoom/pan. Hover-highlighting, palettes, and node drawing carry over unchanged.

```jsx
import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ForceGraph2D from 'react-force-graph-2d'
import { useTheme } from '../hooks/useTheme'

// Generic force-graph renderer for any {nodes, links} built by lib/siteGraph.
// mode 'panel': compact, drag+hover+click only. mode 'fullscreen': zoom/pan too.
export default function SiteGraph({ data, height = 260, mode = 'panel' }) {
  const containerRef = useRef(null)
  const graphRef = useRef(null)
  const [width, setWidth] = useState(800)
  const [hoverNode, setHoverNode] = useState(null)
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const didFitRef = useRef(false)

  const { neighbors, nodeLinks } = useMemo(() => {
    const neighbors = new Map()
    const nodeLinks = new Map()
    data.nodes.forEach(n => { neighbors.set(n.id, new Set()); nodeLinks.set(n.id, new Set()) })
    data.links.forEach(l => {
      const a = typeof l.source === 'object' ? l.source.id : l.source
      const b = typeof l.target === 'object' ? l.target.id : l.target
      neighbors.get(a)?.add(b)
      neighbors.get(b)?.add(a)
      nodeLinks.get(a)?.add(l)
      nodeLinks.get(b)?.add(l)
    })
    return { neighbors, nodeLinks }
  }, [data])

  const palette = useMemo(() => isDark
    ? {
        core: '#00f0ff', hub: '#00f0ff', post: '#7c3aed',
        tag: '#475569', project: '#22d3ee', skill: '#a78bfa',
        label: '#e2e8f0', labelDim: 'rgba(148,163,184,0.85)',
        link: 'rgba(0,240,255,0.10)', linkHot: 'rgba(0,240,255,0.55)',
      }
    : {
        core: '#b45309', hub: '#b45309', post: '#6d28d9',
        tag: '#a8a29e', project: '#d97706', skill: '#8b5cf6',
        label: '#1c1917', labelDim: 'rgba(120,113,108,0.9)',
        link: 'rgba(180,83,9,0.14)', linkHot: 'rgba(180,83,9,0.6)',
      }, [isDark])

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const update = () => setWidth(el.offsetWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fg = graphRef.current
    if (!fg) return
    const compact = mode === 'panel'
    fg.d3Force('charge')?.strength(compact ? -110 : -160)
    fg.d3Force('link')?.distance(l => {
      const g = typeof l.source === 'object' ? l.source.group : 'hub'
      const hubby = g === 'core' || g === 'hub'
      if (compact) return hubby ? 55 : 36
      return hubby ? 90 : 55
    })
  }, [mode])

  const isConnected = useCallback(
    (node) => hoverNode && (node.id === hoverNode.id || neighbors.get(hoverNode.id)?.has(node.id)),
    [hoverNode, neighbors],
  )

  const handleClick = useCallback((node) => {
    if (node.href) window.open(node.href, '_blank', 'noopener')
    else if (node.route) navigate(node.route)
  }, [navigate])

  const drawNode = useCallback((node, ctx, globalScale) => {
    const r = Math.sqrt(node.val) * 2.2
    const hot = !hoverNode || isConnected(node)

    ctx.globalAlpha = hot ? 1 : 0.18
    if (hot && (node.group === 'core' || node.group === 'hub' || hoverNode)) {
      ctx.shadowColor = palette[node.group]
      ctx.shadowBlur = node.group === 'core' ? 18 : 10
    }
    ctx.beginPath()
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
    ctx.fillStyle = palette[node.group] ?? '#888'
    ctx.fill()
    ctx.shadowBlur = 0

    const showLabel = node.group === 'core' || node.group === 'hub'
      || globalScale > 1.4 || (hoverNode && isConnected(node))
    if (showLabel) {
      const fontSize = Math.max(11, 13 / globalScale)
      const weight = node.group === 'core' || node.group === 'hub' ? 700 : 500
      ctx.font = `${weight} ${fontSize}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = node.group === 'core' || node.group === 'hub' ? palette.label : palette.labelDim
      const text = node.label.length > 32 ? node.label.slice(0, 30) + '…' : node.label
      ctx.fillText(text, node.x, node.y + r + 3)
    }
    ctx.globalAlpha = 1
  }, [hoverNode, isConnected, palette])

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        width={width}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        nodeRelSize={1}
        nodeVal={n => n.val}
        nodeLabel={() => ''}
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.beginPath()
          ctx.arc(node.x, node.y, Math.sqrt(node.val) * 2.2 + 6, 0, 2 * Math.PI)
          ctx.fillStyle = color
          ctx.fill()
        }}
        linkColor={l => (hoverNode && nodeLinks.get(hoverNode.id)?.has(l)) ? palette.linkHot : palette.link}
        linkWidth={l => (hoverNode && nodeLinks.get(hoverNode.id)?.has(l)) ? 2 : 1.2}
        onNodeHover={node => {
          setHoverNode(node ?? null)
          if (containerRef.current) {
            containerRef.current.style.cursor = node && (node.route || node.href) ? 'pointer' : 'grab'
          }
        }}
        onNodeClick={handleClick}
        enableZoomInteraction={mode === 'fullscreen'}
        enablePanInteraction={mode === 'fullscreen'}
        cooldownTicks={140}
        onEngineStop={() => {
          if (!didFitRef.current) {
            didFitRef.current = true
            graphRef.current?.zoomToFit(600, mode === 'panel' ? 24 : 60)
          }
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/GraphPanel.jsx`**

```jsx
import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import SiteGraph from './SiteGraph'
import { getSiteGraph } from '../lib/siteGraph'

// Console card holding the live site graph; expands to a fullscreen overlay.
export default function GraphPanel() {
  const [expanded, setExpanded] = useState(false)
  const data = useMemo(() => getSiteGraph(), [])
  // Fresh objects for the overlay: force-graph mutates node positions in
  // place, so the two instances must not share node objects.
  const overlayData = useMemo(() => (expanded ? getSiteGraph() : null), [expanded])

  useEffect(() => {
    if (!expanded) return
    const onKey = (e) => { if (e.key === 'Escape') setExpanded(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [expanded])

  return (
    <div className="border border-primary-dim/20 rounded-xl bg-bg-card h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="font-mono text-[10px] tracking-widest uppercase text-text-muted">
          site graph <span className="text-primary">· live</span>
        </span>
        <button
          onClick={() => setExpanded(true)}
          aria-label="Expand site graph to fullscreen"
          className="font-mono text-[11px] text-text-muted hover:text-primary transition-colors cursor-pointer"
        >
          expand ↗
        </button>
      </div>
      <SiteGraph data={data} height={230} mode="panel" />
      <p className="font-mono text-[10px] text-text-muted/60 text-center pb-2">
        drag · click to navigate
      </p>

      {expanded && createPortal(
        <div
          className="fixed inset-0 z-50 bg-bg-dark/90 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Site graph explorer"
        >
          <button
            onClick={() => setExpanded(false)}
            aria-label="Close fullscreen graph"
            className="absolute top-5 right-6 font-mono text-sm text-text-muted hover:text-primary transition-colors cursor-pointer"
          >
            esc · close ✕
          </button>
          <div className="w-full max-w-5xl px-4">
            <SiteGraph data={overlayData} height={Math.min(640, window.innerHeight - 120)} mode="fullscreen" />
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
```

- [ ] **Step 3: Delete `SiteGraphHero` and swap the Home import**

Delete `src/components/SiteGraphHero.jsx`. In `src/pages/Home.jsx`, replace the import `import SiteGraphHero from '../components/SiteGraphHero'` with `import GraphPanel from '../components/GraphPanel'` and replace the `<SiteGraphHero />` element with `<GraphPanel />` (layout still old; Task 8 rewrites it). Confirm nothing else imports SiteGraphHero: `grep -rn "SiteGraphHero" src/` → no hits.

- [ ] **Step 4: Verify build + tests**

Run: `npm test` → PASS. Run: `npm run build` → succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A src/components src/pages/Home.jsx
git commit -m "feat: SiteGraph renderer + GraphPanel with fullscreen overlay"
```

---

### Task 7: `StatusBar` + `ViewCount` components

**Files:**
- Create: `src/components/StatusBar.jsx`
- Create: `src/components/ViewCount.jsx`

- [ ] **Step 1: Create `src/components/StatusBar.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { getSiteStats } from '../lib/siteStats'
import { fetchViewCount } from '../lib/views'

// Real build-time content stats; total views fetched live (hero only) and
// silently omitted when unavailable.
export default function StatusBar({ variant = 'hero' }) {
  const [stats] = useState(() => getSiteStats())
  const [views, setViews] = useState(null)

  useEffect(() => {
    if (variant !== 'hero') return
    let active = true
    fetchViewCount('TOTAL').then(v => { if (active) setViews(v) })
    return () => { active = false }
  }, [variant])

  const segments = [
    'online',
    `${stats.nodeCount} nodes`,
    variant === 'hero' ? `${stats.edgeCount} edges` : null,
    `${stats.essayCount} ${stats.essayCount === 1 ? 'essay' : 'essays'}`,
    stats.lastUpdated ? `updated ${stats.lastUpdated}` : null,
    views != null ? `${views.toLocaleString()} views` : null,
  ].filter(Boolean).join(' · ')

  if (variant === 'footer') {
    return (
      <p className="font-mono text-[11px] text-text-muted flex items-center gap-2">
        <span className="status-dot" aria-hidden="true" />
        <span>{segments}</span>
      </p>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-bg-card/80 font-mono text-[11px] text-text-muted">
      <span className="status-dot" aria-hidden="true" />
      <span>{segments}</span>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/ViewCount.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { fetchViewCount } from '../lib/views'

// Renders "· N views" once the count arrives; renders nothing on failure.
export default function ViewCount({ path, className = '' }) {
  const [views, setViews] = useState(null)

  useEffect(() => {
    let active = true
    fetchViewCount(path).then(v => { if (active) setViews(v) })
    return () => { active = false }
  }, [path])

  if (views == null) return null
  return <span className={className}>· {views.toLocaleString()} views</span>
}
```

- [ ] **Step 3: Verify build + tests**

Run: `npm test` → PASS. Run: `npm run build` → succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/StatusBar.jsx src/components/ViewCount.jsx
git commit -m "feat: StatusBar and ViewCount components"
```

---### Task 8: Homepage rewrite

**Files:**
- Modify: `src/pages/Home.jsx` (full replacement)

- [ ] **Step 1: Replace `src/pages/Home.jsx` entirely**

```jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AmbientGraph from '../components/AmbientGraph'
import StatusBar from '../components/StatusBar'
import NodeDivider from '../components/NodeDivider'
import GraphPanel from '../components/GraphPanel'
import SpotlightCard from '../components/SpotlightCard'
import { getAllPosts, getFeatured, getRecent } from '../lib/posts'
import { personalInfo } from '../data/personalInfo'

export default function Home() {
  const posts = getAllPosts()
  const featured = getFeatured(posts)
  const recent = getRecent(posts, featured?.slug, 3)

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        <AmbientGraph />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6"
        >
          <StatusBar variant="hero" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-5 mb-3 text-text-primary">
            {personalInfo.name}
          </h1>
          <p className="font-mono text-primary text-sm md:text-base">
            &gt; building agentic systems that remember<span className="cursor-blink">▌</span>
          </p>
        </motion.div>
      </section>

      {/* Console row + content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
          {featured && (
            <Link to={`/writing/${featured.slug}`} className="md:col-span-3">
              <SpotlightCard
                className="border border-primary/20 rounded-xl p-6 bg-bg-card cursor-pointer
                           transition-colors duration-300 hover:border-primary/40 h-full flex flex-col"
              >
                <p className="font-mono text-[10px] tracking-widest uppercase text-secondary mb-3">
                  featured essay
                </p>
                <h2 className="text-xl font-bold text-text-primary mb-2 leading-snug">{featured.title}</h2>
                <p className="text-text-muted text-sm leading-relaxed mb-4 flex-1">{featured.description}</p>
                <div className="flex flex-wrap gap-2 items-center">
                  {featured.tags?.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-text-muted ml-auto">{featured.readTime} min · read →</span>
                </div>
              </SpotlightCard>
            </Link>
          )}
          <div className="md:col-span-2 min-h-[300px]">
            <GraphPanel />
          </div>
        </div>

        <NodeDivider className="my-10" />

        {/* Recent writing */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] tracking-widest uppercase text-secondary">
                recent writing
              </p>
              <Link to="/writing" className="text-primary text-xs hover:underline">
                All essays →
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recent.map(post => (
                <Link key={post.slug} to={`/writing/${post.slug}`}>
                  <SpotlightCard
                    className="border border-primary-dim/20 rounded-lg px-5 py-4 bg-bg-card
                               flex items-center gap-4 cursor-pointer transition-colors duration-300 hover:border-primary/20"
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
                  </SpotlightCard>
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

Note: the social-link pills are intentionally removed from the hero — they reappear in the Footer (Task 11). `Magnetic` is no longer imported here.

- [ ] **Step 2: Verify**

Run: `npm test` → PASS. Run: `npm run build` → succeeds.
Quick manual check: `npm run dev`, open the homepage — status bar renders with real numbers, hero cursor blinks, console row shows featured card beside the graph panel, expand overlay opens/closes with ESC.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: editorial-console homepage with status bar and graph panel"
```

---

### Task 9: GoatCounter wiring (script + SPA pageview tracking)

**Files:**
- Modify: `index.html`
- Create: `src/components/PageviewTracker.jsx`
- Modify: `src/App.jsx`

**User prerequisite (not blocking):** register the code `harshpavuluri` at https://www.goatcounter.com (free), then in GoatCounter Settings enable "Allow adding pageviews from the counter.json endpoint" / public counter access. Until then, tracking 404s harmlessly and all view-count UI stays hidden by design.

- [ ] **Step 1: Add the script to `index.html`**

In the `<head>`, after the existing SPA-redirect `<script>` block, add:

```html
    <script>
      window.goatcounter = { no_onload: true }
    </script>
    <script data-goatcounter="https://harshpavuluri.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
```

`no_onload` stops the automatic page-load count; the tracker component below counts every route change instead (including the first).

- [ ] **Step 2: Create `src/components/PageviewTracker.jsx`**

```jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Counts SPA route changes in GoatCounter. window.goatcounter.count is
// optional-chained: absent in dev, with ad-blockers, or before the script loads.
export default function PageviewTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.goatcounter?.count?.({ path: pathname })
  }, [pathname])

  return null
}
```

- [ ] **Step 3: Mount it in `src/App.jsx`**

Add the import and place it inside `Layout` (it needs router context):

```jsx
import PageviewTracker from './components/PageviewTracker'
```

```jsx
function Layout() {
  return (
    <div className="bg-bg-dark text-text-primary font-body min-h-screen flex flex-col">
      <PageviewTracker />
      <Navbar />
      <CommandPalette />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 4: Verify**

Run: `npm test` → PASS. Run: `npm run build` → succeeds.

- [ ] **Step 5: Commit**

```bash
git add index.html src/components/PageviewTracker.jsx src/App.jsx
git commit -m "feat: GoatCounter pageview tracking in SPA mode"
```

---

### Task 10: Post page — constellation + view count

**Files:**
- Modify: `src/pages/Post.jsx`

- [ ] **Step 1: Add imports and constellation data**

In `src/pages/Post.jsx` add imports:

```jsx
import SiteGraph from '../components/SiteGraph'
import ViewCount from '../components/ViewCount'
import { buildConstellation } from '../lib/siteGraph'
```

After the existing `const next = allPosts[idx - 1] ?? null` line (which is after the `if (!post) return null` guard), add:

```jsx
  const constellation = buildConstellation(allPosts, slug)
```

- [ ] **Step 2: Add the view count to the meta line**

In the post-header meta row (the `div` with `Harsha Pavuluri · date · N min read`), append after the `{readTime} min read` span:

```jsx
          <ViewCount path={`/writing/${slug}`} />
```

(`ViewCount` renders `· N views` with its own separator, or nothing.)

- [ ] **Step 3: Add the Connected constellation before the share/prev-next footer**

Directly above the `{/* Footer */}` block, insert:

```jsx
      {/* Connected — this essay's neighborhood in the site graph */}
      {constellation && (
        <div className="mt-12">
          <p className="font-mono text-[10px] tracking-widest uppercase text-text-muted mb-3">
            connected
          </p>
          <div className="border border-primary-dim/20 rounded-xl bg-bg-card overflow-hidden">
            <SiteGraph data={constellation} height={230} mode="panel" />
          </div>
        </div>
      )}
```

- [ ] **Step 4: Verify**

Run: `npm test` → PASS. Run: `npm run build` → succeeds.
Manual: `npm run dev`, open an essay — constellation renders at the bottom with the essay as glowing core, tags around it, the related essay clickable (navigates). The in-article `---` rules now render as node-edge dividers (CSS from Task 5).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Post.jsx
git commit -m "feat: post constellation and view count"
```

---

### Task 11: Writing page — tag network filter

**Files:**
- Create: `src/components/TagNetwork.jsx`
- Modify: `src/pages/Writing.jsx`

- [ ] **Step 1: Create `src/components/TagNetwork.jsx`**

Deterministic layout: tags spread evenly across the band on two staggered rows; SVG lines (percentage coords) connect co-occurring tags behind the buttons.

```jsx
import { extractTags, tagCooccurrence } from '../lib/posts'

// Clickable tag-node strip: nodes are tags, edges join tags that co-occur
// on an essay. Click toggles the filter (parent owns the state).
export default function TagNetwork({ posts, activeTag, onToggle }) {
  const tags = extractTags(posts)
  const pairs = tagCooccurrence(posts)
  if (tags.length === 0) return null

  const pos = new Map(tags.map((t, i) => [
    t,
    { x: ((i + 1) / (tags.length + 1)) * 100, y: i % 2 === 0 ? 34 : 78 },
  ]))

  return (
    <div className="relative h-[112px] mb-8 select-none" role="group" aria-label="Filter essays by tag">
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        {pairs.map(({ a, b, count }) => {
          const pa = pos.get(a)
          const pb = pos.get(b)
          if (!pa || !pb) return null
          const hot = activeTag === a || activeTag === b
          return (
            <line
              key={`${a}|${b}`}
              x1={`${pa.x}%`} y1={pa.y}
              x2={`${pb.x}%`} y2={pb.y}
              stroke="var(--color-primary)"
              strokeOpacity={hot ? 0.7 : 0.15 + Math.min(count, 3) * 0.08}
              strokeWidth={hot ? 2 : 1}
            />
          )
        })}
      </svg>
      {tags.map(tag => {
        const p = pos.get(tag)
        const active = activeTag === tag
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            aria-pressed={active}
            style={{ left: `${p.x}%`, top: p.y }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 text-xs px-3 py-1.5 rounded-full border
                        font-mono transition-colors duration-200 cursor-pointer ${
              active
                ? 'border-primary text-primary bg-primary/10'
                : 'border-primary-dim/30 text-text-muted bg-bg-card hover:border-primary/40 hover:text-primary'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Use it in `src/pages/Writing.jsx`**

Replace the import line `import SpotlightCard from '../components/SpotlightCard'` block's surroundings as follows — add:

```jsx
import TagNetwork from '../components/TagNetwork'
```

Then replace the entire `{/* Tag filters */}` block (the `<div className="flex flex-wrap gap-2 mb-8">…</div>` with the `['all', ...tags].map` buttons) with:

```jsx
      {/* Tag network filter */}
      <TagNetwork
        posts={allPosts}
        activeTag={activeTag}
        onToggle={tag => setActiveTag(prev => (prev === tag ? 'all' : tag))}
      />
      {activeTag !== 'all' && (
        <button
          onClick={() => setActiveTag('all')}
          className="font-mono text-xs text-text-muted hover:text-primary transition-colors mb-6 block cursor-pointer"
        >
          filter: {activeTag} · clear ✕
        </button>
      )}
```

The now-unused `extractTags` import and `tags` variable in Writing.jsx must be removed (TagNetwork derives tags itself).

- [ ] **Step 3: Verify**

Run: `npm test` → PASS. Run: `npm run build` → succeeds. Run `npm run lint` → no unused-variable errors in Writing.jsx.
Manual: `/writing` shows the tag band with edges; clicking a tag filters the list and highlights its edges; clicking it again (or "clear") restores all.

- [ ] **Step 4: Commit**

```bash
git add src/components/TagNetwork.jsx src/pages/Writing.jsx
git commit -m "feat: tag network filter on writing index"
```

---

### Task 12: Footer — sitewide console framing + socials

**Files:**
- Modify: `src/sections/Footer.jsx`

- [ ] **Step 1: Replace `src/sections/Footer.jsx` entirely**

```jsx
import StatusBar from '../components/StatusBar'
import { socialLinks } from '../data/socialLinks'

export default function Footer() {
  return (
    <footer className="py-6 bg-bg-card/50 border-t border-primary-dim/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <StatusBar variant="footer" />
        <div className="flex items-center gap-4">
          {socialLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted text-xs hover:text-primary transition-colors"
            >
              {link.name} ↗
            </a>
          ))}
        </div>
      </div>
      <p className="text-center text-text-muted/60 text-[11px] mt-3">
        © Harsha Pavuluri {new Date().getFullYear()}
      </p>
    </footer>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm test` → PASS. Run: `npm run build` → succeeds.
Manual: every page shows the footer status line with the pulsing dot + socials.

- [ ] **Step 3: Commit**

```bash
git add src/sections/Footer.jsx
git commit -m "feat: footer status line and social links (sitewide console framing)"
```

---

### Task 13: About restyle — console labels + skill clusters

**Files:**
- Modify: `src/sections/About.jsx`
- Modify: `src/sections/Skills.jsx`

- [ ] **Step 1: Restyle `src/sections/About.jsx`**

Replace the component with:

```jsx
import ScrollReveal from '../components/ScrollReveal'
import NodeDivider from '../components/NodeDivider'
import { personalInfo } from '../data/personalInfo'

export default function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-bg-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <p className="font-mono text-[10px] tracking-widest uppercase text-text-muted mb-3">
            node: me
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-text-primary">
            {personalInfo.motto}
          </h2>
          <NodeDivider className="max-w-xs mx-auto mb-8" />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            {personalInfo.bio}
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Rewrite `src/sections/Skills.jsx` as radial clusters**

Replace the whole file. The icon imports and `iconMap` stay exactly as they are today (lines 1–38); only the layout below them changes:

```jsx
import { motion } from 'framer-motion'
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiRuby,
  SiPostgresql,
  SiReact,
  SiFlask,
  SiRubyonrails,
  SiPytorch,
  SiTensorflow,
  SiDocker,
  SiGooglecloud,
  SiAmazonwebservices,
  SiGit,
  SiLinux,
} from 'react-icons/si'
import ScrollReveal from '../components/ScrollReveal'
import { skillCategories } from '../data/skills'

const iconMap = {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiRuby,
  SiPostgresql,
  SiReact,
  SiFlask,
  SiRubyonrails,
  SiPytorch,
  SiTensorflow,
  SiDocker,
  SiGooglecloud,
  SiAmazonwebservices,
  SiGit,
  SiLinux,
}

// One category rendered as a radial cluster: category hub in the middle,
// skills on a circle around it, SVG spokes underneath.
function SkillCluster({ category, index }) {
  const n = category.skills.length
  const R = 105
  const positions = category.skills.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    return { x: Math.round(Math.cos(angle) * R), y: Math.round(Math.sin(angle) * R) }
  })

  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="relative w-[320px] h-[320px] mx-auto">
        <svg viewBox="-160 -160 320 320" className="absolute inset-0 w-full h-full" aria-hidden="true">
          {positions.map((p, i) => (
            <line key={i} x1="0" y1="0" x2={p.x} y2={p.y} stroke="var(--color-primary)" strokeOpacity="0.22" />
          ))}
        </svg>

        {/* category hub */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-3 py-1.5
                     rounded-full border border-primary/40 bg-bg-card font-mono text-[11px] text-primary whitespace-nowrap"
        >
          {category.category}
        </div>

        {category.skills.map((skill, i) => {
          const Icon = iconMap[skill.icon]
          const p = positions[i]
          return (
            <div
              key={skill.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)` }}
            >
              <motion.div
                whileHover={{ scale: 1.12 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-11 h-11 rounded-full bg-bg-card border border-primary-dim/30
                             flex items-center justify-center hover:border-primary/50 transition-colors"
                >
                  {Icon && <Icon className="text-lg text-primary" />}
                </div>
                <span className="text-[10px] text-text-muted whitespace-nowrap">{skill.name}</span>
              </motion.div>
            </div>
          )
        })}
      </div>
    </ScrollReveal>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="py-16 md:py-24 bg-bg-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="font-mono text-[10px] tracking-widest uppercase text-text-muted text-center mb-2">
            skill graph
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-text-primary">
            Tech Stack
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {skillCategories.map((category, i) => (
            <SkillCluster key={category.category} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

(Positioning note: the outer plain `div` owns the translate; the inner `motion.div` owns the hover scale — framer-motion overwrites `transform`, so they must not share an element.)

- [ ] **Step 3: Verify**

Run: `npm test` → PASS. Run: `npm run build` → succeeds.
Manual: `/about` — motto with console label and node divider, three radial skill clusters with hover pop, no overlap at md and mobile widths (clusters stack vertically on small screens).

- [ ] **Step 4: Commit**

```bash
git add src/sections/About.jsx src/sections/Skills.jsx
git commit -m "feat: about console restyle and radial skill clusters"
```

---

### Task 14: Portfolio — connected project cards

**Files:**
- Modify: `src/sections/Projects.jsx`
- Modify: `src/pages/Portfolio.jsx`

- [ ] **Step 1: Add edge connectors between cards in `src/sections/Projects.jsx`**

Add `Fragment` to the React import at the top:

```jsx
import { Fragment } from 'react'
```

Replace the list container in the default export (currently `<div className="flex flex-col gap-8">…</div>`) with:

```jsx
        <div className="flex flex-col">
          {projects.map((project, index) => (
            <Fragment key={project.title}>
              {index > 0 && (
                <div className="flex justify-center py-1" aria-hidden="true">
                  <svg width="8" height="44">
                    <line x1="4" y1="0" x2="4" y2="44" stroke="var(--color-primary)" strokeOpacity="0.3" />
                    <circle cx="4" cy="22" r="3" fill="var(--color-primary)" fillOpacity="0.55" />
                  </svg>
                </div>
              )}
              <ProjectCard project={project} index={index} />
            </Fragment>
          ))}
        </div>
```

Also replace the section heading block with a console-labeled version:

```jsx
        <ScrollReveal>
          <p className="font-mono text-[10px] tracking-widest uppercase text-text-muted text-center mb-2">
            hub: portfolio
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-text-primary">
            Projects
          </h2>
        </ScrollReveal>
```

(The `w-16 h-1 bg-primary … glow-cyan` underline div is removed.)

Because the Projects section now renders its own `hub: portfolio` label and `Projects` heading, remove the duplicate page header from `src/pages/Portfolio.jsx` — replace the file with:

```jsx
import Projects from '../sections/Projects'

export default function Portfolio() {
  return (
    <div className="pt-16">
      <Projects />
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm test` → PASS. Run: `npm run build` → succeeds.
Manual: `/portfolio` — single console-labeled heading; cards joined by short vertical edges with node dots; spacing feels continuous, not cramped.

- [ ] **Step 3: Commit**

```bash
git add src/sections/Projects.jsx src/pages/Portfolio.jsx
git commit -m "feat: edge-connected project cards"
```

---

### Task 15: Final verification

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all tests pass (original 28 + new lib tests).

- [ ] **Step 2: Lint + production build**

Run: `npm run lint` → no errors. Run: `npm run build` → succeeds.

- [ ] **Step 3: Manual walkthrough (`npm run dev`)**

Check each item in **both themes** (toggle via navbar / Cmd+K):
1. Home: status bar values match content (count posts, check date); cursor blinks; ambient graph drifts; graph panel drags/clicks/expands; ESC closes overlay; featured + recent cards navigate.
2. /writing: tag network filters and clears; essay cards unaffected.
3. An essay: progress bar, TOC, node-edge `---` dividers, constellation at bottom navigates to related essay; meta line shows views only if GoatCounter is configured.
4. /about and /portfolio: clusters and connectors render; hover states work.
5. Footer on every page: pulsing dot + stats + socials.
6. DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: no blink, no drift, no pulse.
7. Narrow the window to ~375px: console row stacks, tag network stays usable, clusters stack.

- [ ] **Step 4: Commit any fixes, then wrap up**

Use the superpowers:finishing-a-development-branch skill to decide merge/PR (target: merge `feature/editorial-console` back to `draft/working-memory-agents`, or directly to `main` if the draft branch ships first — ask the user).
