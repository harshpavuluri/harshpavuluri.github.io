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
