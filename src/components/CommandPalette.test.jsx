import { describe, it, expect } from 'vitest'
import { scoreItem } from './CommandPalette'

describe('scoreItem', () => {
  it('returns a positive score for empty queries (show everything)', () => {
    expect(scoreItem('', 'Writing')).toBeGreaterThan(0)
  })

  it('ranks exact match above prefix above substring', () => {
    const exact = scoreItem('writing', 'Writing')
    const prefix = scoreItem('writ', 'Writing essays')
    const substring = scoreItem('say', 'Writing essays')
    expect(exact).toBeGreaterThan(prefix)
    expect(prefix).toBeGreaterThan(substring)
  })

  it('matches word-initial subsequences', () => {
    expect(scoreItem('dag', 'Documents Are a Graph')).toBeGreaterThan(0)
  })

  it('returns 0 for non-matches', () => {
    expect(scoreItem('zzz', 'Writing')).toBe(0)
  })

  it('is case-insensitive', () => {
    expect(scoreItem('WRITING', 'writing')).toBe(100)
  })
})
