import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseCount, fetchViewCount } from './views'

afterEach(() => vi.unstubAllGlobals())

describe('parseCount', () => {
  it('parses plain counts', () => {
    expect(parseCount({ count: '42' })).toBe(42)
  })

  it('parses formatted counts with separators', () => {
    expect(parseCount({ count: '1 234' })).toBe(1234)
  })

  it('returns null for missing or non-numeric count', () => {
    expect(parseCount({})).toBeNull()
    expect(parseCount(null)).toBeNull()
    expect(parseCount({ count: '—' })).toBeNull()
  })

  it('returns null for abbreviated counts rather than mis-parsing', () => {
    expect(parseCount({ count: '1.2k' })).toBeNull()
    expect(parseCount({ count: '3M' })).toBeNull()
  })
})

describe('fetchViewCount', () => {
  it('returns the parsed count on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: '42' }) }))
    expect(await fetchViewCount('/writing/foo')).toBe(42)
  })

  it('returns null on a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await fetchViewCount('/')).toBeNull()
  })

  it('returns null when fetch rejects (offline / ad-blocked)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('blocked')))
    expect(await fetchViewCount('/')).toBeNull()
  })
})
