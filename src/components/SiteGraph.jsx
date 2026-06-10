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
