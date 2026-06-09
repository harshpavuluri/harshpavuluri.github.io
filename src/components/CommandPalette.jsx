import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllPosts } from '../lib/posts'
import { socialLinks } from '../data/socialLinks'
import { personalInfo } from '../data/personalInfo'
import { useTheme } from '../hooks/useTheme'

export const OPEN_PALETTE_EVENT = 'open-command-palette'
export const openCommandPalette = () =>
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT))

// Lightweight scorer: exact > prefix > substring > word-initial subsequence
export function scoreItem(query, text) {
  const q = query.trim().toLowerCase()
  const t = text.toLowerCase()
  if (!q) return 1
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  const idx = t.indexOf(q)
  if (idx >= 0) return 60 - Math.min(idx, 20)
  // subsequence across word boundaries ("dag" -> "Documents Are a Graph")
  let qi = 0
  for (const word of t.split(/[\s-_/]+/)) {
    if (qi < q.length && word.startsWith(q[qi])) qi++
  }
  if (qi === q.length && q.length > 1) return 30
  return 0
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActive(0)
    setCopied(false)
  }, [])

  const items = useMemo(() => {
    const pages = [
      { id: 'home', section: 'Pages', title: 'Home', hint: '/', icon: '◆', run: () => navigate('/') },
      { id: 'writing', section: 'Pages', title: 'Writing', hint: '/writing', icon: '◆', run: () => navigate('/writing') },
      { id: 'about', section: 'Pages', title: 'About', hint: '/about', icon: '◆', run: () => navigate('/about') },
      { id: 'portfolio', section: 'Pages', title: 'Portfolio', hint: '/portfolio', icon: '◆', run: () => navigate('/portfolio') },
      { id: 'contact', section: 'Pages', title: 'Contact', hint: '/contact', icon: '◆', run: () => navigate('/contact') },
    ]
    const posts = getAllPosts().map(p => ({
      id: `post:${p.slug}`,
      section: 'Essays',
      title: p.title,
      hint: `${p.readTime} min · ${(p.tags ?? []).join(', ')}`,
      keywords: `${p.description ?? ''} ${(p.tags ?? []).join(' ')}`,
      icon: '✎',
      run: () => navigate(`/writing/${p.slug}`),
    }))
    const actions = [
      {
        id: 'theme', section: 'Actions',
        title: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
        hint: 'theme', icon: theme === 'dark' ? '☀' : '☾',
        keepOpen: true, run: () => toggleTheme(),
      },
      {
        id: 'email', section: 'Actions', title: 'Copy email address',
        hint: personalInfo.email, icon: '⧉', keepOpen: true,
        run: () => { navigator.clipboard?.writeText(personalInfo.email); setCopied(true); setTimeout(() => setCopied(false), 1500) },
      },
    ]
    const socials = socialLinks.map(s => ({
      id: `social:${s.name}`, section: 'Elsewhere', title: s.name,
      hint: 'opens in new tab', icon: '↗',
      run: () => window.open(s.url, '_blank', 'noopener'),
    }))
    return [...pages, ...posts, ...actions, ...socials]
  }, [navigate, theme, toggleTheme])

  const results = useMemo(() => {
    const scored = items
      .map(item => ({ item, score: Math.max(scoreItem(query, item.title), item.keywords ? scoreItem(query, item.keywords) * 0.7 : 0) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.item)
    return query.trim() ? scored : items
  }, [items, query])

  // Global shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      } else if (e.key === 'Escape' && open) {
        close()
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen)
    }
  }, [open, close])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  useEffect(() => { setActive(0) }, [query])

  // Keep active row in view
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); select(results[active]) }
  }

  const select = (item) => {
    item.run()
    if (!item.keepOpen) close()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center px-4 pt-[14vh]"
          onMouseDown={close}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-lg rounded-xl border border-primary/20 bg-bg-card shadow-2xl shadow-black/40 overflow-hidden"
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <span className="text-primary text-sm">⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search pages, essays, actions…"
                className="flex-1 bg-transparent py-3.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none"
                aria-label="Search"
              />
              {copied && <span className="text-xs text-primary">copied ✓</span>}
              <kbd className="text-[10px] text-text-muted border border-border rounded px-1.5 py-0.5">esc</kbd>
            </div>

            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2" role="listbox">
              {results.length === 0 && (
                <p className="px-4 py-6 text-sm text-text-muted text-center">
                  Nothing matches “{query}”. Try an essay title or page name.
                </p>
              )}
              {results.map((item, i) => {
                const showHeader = i === 0 || item.section !== results[i - 1].section
                return (
                  <div key={item.id}>
                    {showHeader && (
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase text-text-muted/70">
                        {item.section}
                      </p>
                    )}
                    <button
                      data-index={i}
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => select(item)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                        i === active ? 'bg-primary/10' : 'bg-transparent'
                      }`}
                    >
                      <span className={`text-xs w-4 text-center ${i === active ? 'text-primary' : 'text-text-muted'}`}>
                        {item.icon}
                      </span>
                      <span className={`flex-1 text-sm truncate ${i === active ? 'text-text-primary' : 'text-text-muted'}`}>
                        {item.title}
                      </span>
                      <span className="text-[11px] text-text-muted/60 truncate max-w-[40%]">{item.hint}</span>
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-text-muted/70">
              <span><kbd className="border border-border rounded px-1">↑↓</kbd> navigate</span>
              <span><kbd className="border border-border rounded px-1">↵</kbd> select</span>
              <span className="ml-auto">⌘K to toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
