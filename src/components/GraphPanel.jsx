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
