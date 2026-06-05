# Light / Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a warm editorial light mode with a pill-style ☀️/🌙 navbar toggle, defaulting to the OS system preference and persisting manual overrides in `localStorage`.

**Architecture:** CSS custom properties + `data-theme` attribute on `<html>`. The existing `@theme {}` block stays as dark defaults; a `[data-theme="light"]` block overrides variables with warm editorial values. A `useTheme` hook manages state and DOM mutation; all Tailwind utilities pick up the new values automatically via CSS cascade.

**Tech Stack:** React 19, Vite 7, Tailwind CSS v4 (`@theme` variables), Framer Motion, Vitest + @testing-library/react

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/index.css` | Modify | Add `--color-border` token, fix `body` bg, add `[data-theme="light"]` overrides, suppress glows, convert `.prose-post` hardcodes to variables |
| `src/hooks/useTheme.js` | Create | Theme state hook — reads localStorage/matchMedia, sets `data-theme`, exposes `{ theme, toggleTheme }` |
| `src/hooks/useTheme.test.js` | Create | Unit tests for all hook behaviour |
| `src/App.jsx` | Modify | Call `useTheme()` in `Layout` to initialize the DOM attribute on every page |
| `src/components/Navbar.jsx` | Modify | Add pill toggle (desktop + mobile), wired to `toggleTheme` |
| `src/components/ParticleBackground.jsx` | Modify | Call `useTheme()` directly; switch particle color to amber in light mode |
| `src/pages/Home.jsx` | Modify | Replace `text-white` on `<h1>` and remove Framer Motion hardcoded `rgba(0,240,255,...)` hover styles |

---

## Task 1: CSS Theme Variables

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add `--color-border` to the `@theme` block and fix `body` background**

  Open `src/index.css`. Make these two changes:

  In the `@theme { }` block, add the new border variable after `--color-text-muted`:
  ```css
  --color-border: #1e1e2e;
  ```

  Change the `body` rule so its background responds to the CSS variable (currently hardcoded):
  ```css
  body {
    margin: 0;
    background-color: var(--color-bg-dark);
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
  }
  ```

- [ ] **Step 2: Add the `[data-theme="light"]` override block**

  After the closing `}` of `@theme { }`, add:
  ```css
  [data-theme="light"] {
    --color-primary:       #b45309;
    --color-primary-dim:   #92400e;
    --color-secondary:     #6d28d9;
    --color-bg-dark:       #fafaf8;
    --color-bg-card:       #f5f2eb;
    --color-bg-card-hover: #ede9df;
    --color-text-primary:  #1c1917;
    --color-text-muted:    #78716c;
    --color-border:        #d6cfc4;
  }
  ```

- [ ] **Step 3: Suppress glow effects in light mode**

  After the `[data-theme="light"]` block, add:
  ```css
  [data-theme="light"] .glow-cyan {
    box-shadow: none;
  }

  [data-theme="light"] .glow-text {
    text-shadow: none;
  }

  [data-theme="light"] .glow-border {
    border-color: var(--color-border);
    box-shadow: none;
  }
  ```

- [ ] **Step 4: Verify the build has no CSS errors**

  Run: `npm run build`
  Expected: Build completes with no errors. Ignore any asset size warnings.

- [ ] **Step 5: Commit**

  ```bash
  git add src/index.css
  git commit -m "feat: add light theme CSS variables and glow suppression"
  ```

---

## Task 2: Convert `.prose-post` to CSS Variables

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace all hardcoded hex values in `.prose-post` rules**

  Apply these replacements in the `.prose-post` section of `src/index.css` (the full updated block — paste this in place of the existing `.prose-post` section):

  ```css
  .prose-post p {
    color: var(--color-text-muted);
    font-size: 15px;
    line-height: 1.8;
    margin-bottom: 1.25rem;
  }

  .prose-post h2 {
    color: var(--color-text-primary);
    font-size: 1.25rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    letter-spacing: -0.3px;
  }

  .prose-post h3 {
    color: var(--color-text-primary);
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .prose-post a {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .prose-post strong {
    color: var(--color-text-primary);
    font-weight: 600;
  }

  .prose-post em {
    color: var(--color-text-muted);
  }

  .prose-post code {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.1em 0.4em;
    font-size: 0.875em;
    color: var(--color-primary);
  }

  .prose-post pre {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
    margin-bottom: 1.25rem;
  }

  .prose-post pre code {
    background: none;
    border: none;
    padding: 0;
    color: var(--color-text-primary);
    font-size: 14px;
  }

  .prose-post blockquote {
    border-left: 3px solid var(--color-primary);
    padding-left: 1rem;
    color: var(--color-text-muted);
    font-style: italic;
    margin-bottom: 1.25rem;
  }

  .prose-post ul,
  .prose-post ol {
    color: var(--color-text-muted);
    font-size: 15px;
    line-height: 1.8;
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .prose-post li {
    margin-bottom: 0.25rem;
  }

  .prose-post hr {
    border-color: var(--color-border);
    margin: 2rem 0;
  }
  ```

- [ ] **Step 2: Run the build to verify no CSS errors**

  Run: `npm run build`
  Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/index.css
  git commit -m "feat: convert prose-post styles to CSS variables for theme support"
  ```

---

## Task 3: `useTheme` Hook (TDD)

**Files:**
- Create: `src/hooks/useTheme.js`
- Create: `src/hooks/useTheme.test.js`

- [ ] **Step 1: Write the failing tests**

  Create `src/hooks/useTheme.test.js`:

  ```js
  import { renderHook, act } from '@testing-library/react'
  import { describe, it, expect, beforeEach, vi } from 'vitest'
  import { useTheme } from './useTheme'

  function mockMatchMedia(prefersDark) {
    const listeners = []
    const mq = {
      matches: prefersDark,
      addEventListener: (_event, fn) => listeners.push(fn),
      removeEventListener: (_event, fn) => {
        const i = listeners.indexOf(fn)
        if (i > -1) listeners.splice(i, 1)
      },
      _trigger: (matches) => listeners.forEach((fn) => fn({ matches })),
    }
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => mq),
    })
    return mq
  }

  describe('useTheme', () => {
    beforeEach(() => {
      localStorage.clear()
      document.documentElement.removeAttribute('data-theme')
    })

    it('defaults to dark when system prefers dark and no stored preference', () => {
      mockMatchMedia(true)
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('dark')
    })

    it('defaults to light when system prefers light and no stored preference', () => {
      mockMatchMedia(false)
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('light')
    })

    it('reads stored preference from localStorage over system preference', () => {
      localStorage.setItem('theme', 'light')
      mockMatchMedia(true)
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('light')
    })

    it('sets data-theme attribute on documentElement', () => {
      mockMatchMedia(true)
      renderHook(() => useTheme())
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('toggleTheme flips theme and persists to localStorage', () => {
      mockMatchMedia(true)
      const { result } = renderHook(() => useTheme())
      act(() => result.current.toggleTheme())
      expect(result.current.theme).toBe('light')
      expect(localStorage.getItem('theme')).toBe('light')
    })

    it('system preference change updates theme when no localStorage override', () => {
      const mq = mockMatchMedia(true)
      const { result } = renderHook(() => useTheme())
      act(() => mq._trigger(false))
      expect(result.current.theme).toBe('light')
    })

    it('system preference change does not update when localStorage override exists', () => {
      localStorage.setItem('theme', 'light')
      const mq = mockMatchMedia(false)
      const { result } = renderHook(() => useTheme())
      act(() => mq._trigger(true))
      expect(result.current.theme).toBe('light')
    })
  })
  ```

- [ ] **Step 2: Run tests to verify they all fail**

  Run: `npm test`
  Expected: 7 failures — `useTheme` does not exist yet.

- [ ] **Step 3: Create the hook**

  Create `src/hooks/useTheme.js`:

  ```js
  import { useState, useEffect } from 'react'

  function getInitialTheme() {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  export function useTheme() {
    const [theme, setTheme] = useState(() => getInitialTheme())

    useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    useEffect(() => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e) => {
        if (!localStorage.getItem('theme')) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }, [])

    function toggleTheme() {
      const next = theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      setTheme(next)
    }

    return { theme, toggleTheme }
  }
  ```

- [ ] **Step 4: Run tests to verify they all pass**

  Run: `npm test`
  Expected: All 7 tests in `useTheme.test.js` pass. Existing tests also pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/hooks/useTheme.js src/hooks/useTheme.test.js
  git commit -m "feat: add useTheme hook with localStorage and system preference support"
  ```

---

## Task 4: App.jsx Integration

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Call `useTheme()` in `Layout`**

  Open `src/App.jsx`. Add the import and call `useTheme()` at the top of `Layout`:

  ```jsx
  import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
  import { useTheme } from './hooks/useTheme'
  import Navbar from './components/Navbar'
  import Footer from './sections/Footer'
  import Home from './pages/Home'
  import Writing from './pages/Writing'
  import Post from './pages/Post'
  import About from './pages/About'
  import Portfolio from './pages/Portfolio'
  import Contact from './pages/Contact'

  function Layout() {
    useTheme()
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

- [ ] **Step 2: Verify the attribute is applied on load**

  Run: `npm run dev`
  Open browser DevTools → Elements → inspect `<html>`. Confirm `data-theme` attribute is present matching your OS setting (`dark` or `light`).

- [ ] **Step 3: Commit**

  ```bash
  git add src/App.jsx
  git commit -m "feat: initialize data-theme attribute via useTheme in Layout"
  ```

---

## Task 5: Navbar Pill Toggle

**Files:**
- Modify: `src/components/Navbar.jsx`

- [ ] **Step 1: Add the pill toggle to the Navbar**

  Replace the entire content of `src/components/Navbar.jsx` with:

  ```jsx
  import { useState, useEffect } from 'react'
  import { Link, useLocation } from 'react-router-dom'
  import { motion, AnimatePresence } from 'framer-motion'
  import { useTheme } from '../hooks/useTheme'

  const navItems = [
    { label: 'Writing', to: '/writing' },
    { label: 'About', to: '/about' },
    { label: 'Portfolio', to: '/portfolio' },
    { label: 'Contact', to: '/contact' },
  ]

  function ThemeToggle({ theme, toggleTheme }) {
    return (
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        className="flex items-center bg-bg-card border border-primary-dim/20 rounded-full p-0.5 cursor-pointer"
      >
        {[
          { value: 'light', icon: '☀️' },
          { value: 'dark', icon: '🌙' },
        ].map(({ value, icon }) => (
          <motion.span
            key={value}
            animate={{ opacity: theme === value ? 1 : 0.4 }}
            transition={{ duration: 0.2 }}
            className={`text-xs px-2.5 py-1 rounded-full select-none transition-colors ${
              theme === value ? 'bg-primary/15 text-primary' : 'text-text-muted'
            }`}
          >
            {icon}
          </motion.span>
        ))}
      </button>
    )
  }

  export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()

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
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
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
                <div className="pt-2 border-t border-primary-dim/10">
                  <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    )
  }
  ```

- [ ] **Step 2: Verify the toggle works in the browser**

  Run: `npm run dev`
  - Open the site. Confirm the pill toggle appears in the top-right of the navbar.
  - Click the toggle — page should switch between dark (near-black) and light (warm cream).
  - Open mobile view (DevTools responsive mode) — confirm the toggle appears at the bottom of the mobile menu.
  - Refresh the page — confirm the chosen theme persists.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/Navbar.jsx
  git commit -m "feat: add pill theme toggle to navbar (desktop + mobile)"
  ```

---

## Task 6: ParticleBackground Theme Adaptation

**Files:**
- Modify: `src/components/ParticleBackground.jsx`

- [ ] **Step 1: Update `ParticleBackground` to use `useTheme` and switch colors**

  Replace the entire content of `src/components/ParticleBackground.jsx` with:

  ```jsx
  import { useCallback, useMemo } from 'react'
  import Particles from '@tsparticles/react'
  import { loadSlim } from '@tsparticles/slim'
  import { useTheme } from '../hooks/useTheme'

  export default function ParticleBackground() {
    const { theme } = useTheme()

    const particlesInit = useCallback(async (engine) => {
      await loadSlim(engine)
    }, [])

    const particleColor = theme === 'light' ? '#d97706' : '#00f0ff'
    const linkOpacity = theme === 'light' ? 0.1 : 0.15
    const maxOpacity = theme === 'light' ? 0.25 : 0.4

    const options = useMemo(
      () => ({
        fullScreen: false,
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          color: { value: particleColor },
          links: {
            color: particleColor,
            distance: 150,
            enable: true,
            opacity: linkOpacity,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1.2,
            direction: 'none',
            outModes: { default: 'bounce' },
          },
          number: {
            density: { enable: true, area: 800 },
            value: window.innerWidth < 768 ? 25 : 60,
          },
          opacity: { value: { min: 0.1, max: maxOpacity } },
          size: { value: { min: 1, max: 3 } },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'grab' },
            onClick: { enable: true, mode: 'push' },
          },
          modes: {
            grab: { distance: 200, links: { opacity: 0.4 } },
            push: { quantity: 4 },
          },
        },
        detectRetina: true,
      }),
      [particleColor, linkOpacity, maxOpacity]
    )

    return (
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={options}
        className="absolute inset-0 z-0"
      />
    )
  }
  ```

- [ ] **Step 2: Verify particle color changes with theme**

  Run: `npm run dev`
  - Navigate to the home page. Confirm cyan particles in dark mode.
  - Click the toggle to switch to light mode. Confirm particles shift to a muted amber.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/ParticleBackground.jsx
  git commit -m "feat: adapt particle background colors to active theme"
  ```

---

## Task 7: Home.jsx Hardcoded Color Fixes

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Replace `text-white` on `<h1>` with `text-text-primary`**

  In `src/pages/Home.jsx`, find the `<h1>` element (currently line 28):
  ```jsx
  <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 glow-text text-white">
  ```
  Change `text-white` to `text-text-primary`:
  ```jsx
  <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 glow-text text-text-primary">
  ```

- [ ] **Step 2: Replace Framer Motion hardcoded hover colors with Tailwind classes**

  Find the featured post card `<motion.div>` (currently around line 67):
  ```jsx
  <motion.div
    whileHover={{ borderColor: 'rgba(0,240,255,0.4)' }}
    className="border border-primary/20 rounded-xl p-6 bg-bg-card cursor-pointer transition-colors duration-300"
  >
  ```
  Remove the `whileHover` prop and add `hover:border-primary/40` to the className:
  ```jsx
  <motion.div
    className="border border-primary/20 rounded-xl p-6 bg-bg-card cursor-pointer transition-colors duration-300 hover:border-primary/40"
  >
  ```

  Find the recent posts card `<motion.div>` (currently around line 112):
  ```jsx
  <motion.div
    whileHover={{ borderColor: 'rgba(0,240,255,0.2)' }}
    className="border border-primary-dim/20 rounded-lg px-5 py-4 bg-bg-card
               flex items-center gap-4 cursor-pointer transition-colors duration-300"
  >
  ```
  Remove `whileHover` and add `hover:border-primary/20` to the className:
  ```jsx
  <motion.div
    className="border border-primary-dim/20 rounded-lg px-5 py-4 bg-bg-card
               flex items-center gap-4 cursor-pointer transition-colors duration-300 hover:border-primary/20"
  >
  ```

- [ ] **Step 3: Verify both modes look correct on the home page**

  Run: `npm run dev`
  - In dark mode: heading is bright, card borders glow on hover.
  - In light mode: heading is `#1c1917` (near-black warm), card border hover uses amber `var(--color-primary)`.

- [ ] **Step 4: Run full test suite**

  Run: `npm test`
  Expected: All tests pass (the 7 `useTheme` tests + all pre-existing tests).

- [ ] **Step 5: Commit**

  ```bash
  git add src/pages/Home.jsx
  git commit -m "feat: fix hardcoded colors in Home.jsx for theme compatibility"
  ```

---

## Spot Check: Other Pages

After all tasks are complete, open each page in light mode and visually confirm nothing looks broken. These pages use only Tailwind utilities referencing CSS variables, so they should adapt automatically — but a quick scan catches anything missed:

- `/writing` — post list cards, tag chips
- `/writing/:slug` — a post with code blocks and blockquotes (exercises `.prose-post`)
- `/about`, `/portfolio`, `/contact` — general layout and text

No code changes expected; this is a verification pass only.
