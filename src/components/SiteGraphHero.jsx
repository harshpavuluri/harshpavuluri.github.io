import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ForceGraph2D from 'react-force-graph-2d'
import { useTheme } from '../hooks/useTheme'
import { getAllPosts } from '../lib/posts'
import { projects } from '../data/projects'
import { skillCategories } from '../data/skills'

// Build the site itself as a knowledge graph: pages are hubs,
// essays / projects / skills are leaves, tags bridge essays together.
export function buildSiteGraph() {
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
  getAllPosts().forEach(post => {
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

export default function SiteGraphHero() {
  const containerRef = useRef(null)
  const graphRef = useRef(null)
  const [size, setSize] = useState({ width: 800, height: 420 })
  const [hoverNode, setHoverNode] = useState(null)
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const data = useMemo(() => buildSiteGraph(), [])
  const didFitRef = useRef(false)

  // Precompute neighbor lookups for hover highlighting
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
    const update = () => {
      const w = el.offsetWidth
      setSize({ width: w, height: w < 640 ? 340 : 440 })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Loosen the layout a bit so labels have room to breathe
  useEffect(() => {
    const fg = graphRef.current
    if (!fg) return
    fg.d3Force('charge')?.strength(-160)
    fg.d3Force('link')?.distance(l => {
      const g = typeof l.source === 'object' ? l.source.group : 'hub'
      return g === 'core' || g === 'hub' ? 90 : 55
    })
  }, [])

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

    // Labels: always for core/hubs; leaves only when zoomed in or highlighted
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
        width={size.width}
        height={size.height}
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
        enableZoomInteraction={false}
        enablePanInteraction={false}
        cooldownTicks={140}
        onEngineStop={() => {
          if (!didFitRef.current) {
            didFitRef.current = true
            graphRef.current?.zoomToFit(600, 48)
          }
        }}
      />
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-text-muted/70 pointer-events-none whitespace-nowrap">
        drag to rearrange · click a node to navigate
      </p>
    </div>
  )
}
