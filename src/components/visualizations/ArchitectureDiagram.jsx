import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTheme } from '../../hooks/useTheme'

const BASE_NODE_STYLE = {
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  padding: '10px 18px',
  minWidth: 140,
  textAlign: 'center',
}

function getGroupStyles(isDark) {
  return {
    core: {
      background: isDark ? 'rgba(0,240,255,0.08)' : 'rgba(180,83,9,0.08)',
      border: isDark ? '1px solid #00f0ff' : '1px solid #b45309',
      color: isDark ? '#00f0ff' : '#b45309',
    },
    system: {
      background: 'rgba(124,58,237,0.08)',
      border: '1px solid rgba(124,58,237,0.6)',
      color: isDark ? '#c4b5fd' : '#6d28d9',
    },
    leaf: {
      background: isDark ? '#111118' : '#f5f2eb',
      border: isDark ? '1px solid #1e1e2e' : '1px solid #d6cfc4',
      color: isDark ? '#94a3b8' : '#78716c',
    },
  }
}

export default function ArchitectureDiagram({ nodes, edges, height = 480 }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const bgColor = isDark ? '#0d0d14' : '#fafaf8'
  const gridColor = isDark ? '#1e1e2e' : '#e8e5df'
  const labelTextColor = isDark ? '#94a3b8' : '#78716c'
  const labelBgColor = isDark ? '#0d0d14' : '#fafaf8'
  const edgeColor = isDark ? 'rgba(0,240,255,0.35)' : 'rgba(180,83,9,0.35)'
  const arrowColor = isDark ? 'rgba(0,240,255,0.5)' : 'rgba(180,83,9,0.5)'
  const controlsBg = isDark ? '#111118' : '#f5f2eb'
  const controlsBorder = isDark ? '#1e1e2e' : '#d6cfc4'

  const groupStyles = getGroupStyles(isDark)

  const rfNodes = useMemo(() =>
    nodes.map(n => ({
      id: n.id,
      position: n.position,
      data: { label: n.label },
      style: { ...BASE_NODE_STYLE, ...(groupStyles[n.group] ?? groupStyles.leaf) },
    })),
  [nodes, groupStyles])

  const rfEdges = useMemo(() =>
    edges.map(e => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      label: e.label ?? '',
      labelStyle: { fill: labelTextColor, fontSize: 10, fontFamily: 'Inter, sans-serif' },
      labelBgStyle: { fill: labelBgColor, fillOpacity: 0.9 },
      style: { stroke: edgeColor, strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: arrowColor, width: 14, height: 14 },
      type: 'smoothstep',
    })),
  [edges, labelTextColor, labelBgColor, edgeColor, arrowColor])

  return (
    <div className="my-8 border border-primary/10 rounded-xl overflow-hidden">
      <div className="bg-bg-card px-4 py-2 border-b border-primary-dim/20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary glow-cyan" />
        <span className="text-text-muted text-xs">Interactive · Pan and zoom to explore</span>
      </div>
      <div style={{ height, background: bgColor }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          style={{ background: bgColor }}
        >
          <Background color={gridColor} gap={24} size={1} />
          <Controls
            style={{
              background: controlsBg,
              border: `1px solid ${controlsBorder}`,
              borderRadius: 8,
            }}
          />
        </ReactFlow>
      </div>
    </div>
  )
}
