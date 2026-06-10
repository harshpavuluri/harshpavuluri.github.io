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
