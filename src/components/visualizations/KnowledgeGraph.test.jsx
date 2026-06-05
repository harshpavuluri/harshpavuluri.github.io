import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '../../hooks/useTheme'
import KnowledgeGraph from './KnowledgeGraph'

vi.mock('react-force-graph-2d', () => ({
  default: () => <canvas data-testid="force-graph" />,
}))

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
})

const nodes = [
  { id: 'a', label: 'Agent', group: 'core' },
  { id: 'b', label: 'Memory', group: 'system' },
]
const links = [{ source: 'a', target: 'b' }]

describe('KnowledgeGraph', () => {
  it('renders the interactive header', () => {
    render(<ThemeProvider><KnowledgeGraph nodes={nodes} links={links} /></ThemeProvider>)
    expect(screen.getByText(/Interactive · Drag nodes to explore/i)).toBeInTheDocument()
  })

  it('renders the graph canvas', () => {
    render(<ThemeProvider><KnowledgeGraph nodes={nodes} links={links} /></ThemeProvider>)
    expect(screen.getByTestId('force-graph')).toBeInTheDocument()
  })
})
