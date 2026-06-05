import { useRef, useEffect, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

const GROUP_COLORS = {
  core: '#00f0ff',
  system: '#7c3aed',
}

function nodeColor(node) {
  return GROUP_COLORS[node.group] ?? '#555555'
}

export default function KnowledgeGraph({ nodes, links, height = 400 }) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    if (!containerRef.current) return
    setWidth(containerRef.current.offsetWidth)
    const observer = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="my-8 border border-primary/10 rounded-xl overflow-hidden">
      <div className="bg-bg-card px-4 py-2 border-b border-primary-dim/20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary glow-cyan" />
        <span className="text-text-muted text-xs">Interactive · Drag nodes to explore</span>
      </div>
      <div ref={containerRef} className="w-full">
        <ForceGraph2D
          graphData={{ nodes, links }}
          width={width}
          height={height}
          nodeLabel="label"
          nodeColor={nodeColor}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const fontSize = Math.max(10, 12 / globalScale)
            ctx.font = `500 ${fontSize}px Inter, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#ffffff'
            ctx.fillText(node.label, node.x, node.y)
          }}
          linkColor={() => 'rgba(0,240,255,0.15)'}
          linkWidth={1.5}
          backgroundColor="#0d0d14"
        />
      </div>
    </div>
  )
}
