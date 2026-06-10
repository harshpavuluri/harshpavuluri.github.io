import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

// Reads h2/h3 out of the rendered MDX, assigns ids, and scroll-spies them.
// Shown as a fixed rail on xl screens; collapses into nothing below that.
export default function PostToc({ contentRef }) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    const els = [...root.querySelectorAll('h2, h3')]
    const seen = new Map()
    const found = els.map(el => {
      let id = el.id || slugify(el.textContent)
      const count = seen.get(id) ?? 0
      seen.set(id, count + 1)
      if (count > 0) id = `${id}-${count}`
      el.id = id
      return { id, text: el.textContent, level: el.tagName === 'H3' ? 3 : 2 }
    })
    setHeadings(found)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-100px 0px -65% 0px' },
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [contentRef])

  if (headings.length < 2) return null

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block fixed top-36 left-[calc(50%+23rem)] w-56"
    >
      <p className="text-[10px] font-semibold tracking-widest uppercase text-text-muted/70 mb-3">
        On this page
      </p>
      <ul className="border-l border-border">
        {headings.map(h => {
          const active = h.id === activeId
          return (
            <li key={h.id} className="relative">
              {active && (
                <motion.span
                  layoutId="toc-indicator"
                  className="absolute -left-px top-0 bottom-0 w-px bg-primary"
                  transition={{ duration: 0.25 }}
                />
              )}
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  history.replaceState(null, '', `#${h.id}`)
                }}
                className={`block py-1.5 text-xs leading-snug transition-colors duration-200 ${
                  h.level === 3 ? 'pl-7' : 'pl-4'
                } ${active ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
