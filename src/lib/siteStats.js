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
      ? new Date(newest).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
      : null,
  }
}

export function getSiteStats() {
  return computeSiteStats(getSiteGraph(), getAllPosts())
}
