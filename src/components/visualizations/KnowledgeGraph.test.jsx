import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import KnowledgeGraph from './KnowledgeGraph'

vi.mock('react-force-graph-2d', () => ({
  default: () => <canvas data-testid="force-graph" />,
}))

const nodes = [
  { id: 'a', label: 'Agent', group: 'core' },
  { id: 'b', label: 'Memory', group: 'system' },
]
const links = [{ source: 'a', target: 'b' }]

describe('KnowledgeGraph', () => {
  it('renders the interactive header', () => {
    render(<KnowledgeGraph nodes={nodes} links={links} />)
    expect(screen.getByText(/Interactive · Drag nodes to explore/i)).toBeInTheDocument()
  })

  it('renders the graph canvas', () => {
    render(<KnowledgeGraph nodes={nodes} links={links} />)
    expect(screen.getByTestId('force-graph')).toBeInTheDocument()
  })
})
