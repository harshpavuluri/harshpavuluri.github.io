import { describe, it, expect } from 'vitest'
import { sortByDate, filterByTag, extractTags, getFeatured, getRecent } from './posts'

const posts = [
  { slug: 'a', title: 'A', date: '2026-01-01', tags: ['ai', 'agents'], featured: false },
  { slug: 'b', title: 'B', date: '2026-06-01', tags: ['ai', 'graphs'], featured: true },
  { slug: 'c', title: 'C', date: '2026-03-01', tags: ['engineering'], featured: false },
]

describe('sortByDate', () => {
  it('sorts newest first', () => {
    const result = sortByDate(posts)
    expect(result.map(p => p.slug)).toEqual(['b', 'c', 'a'])
  })

  it('does not mutate the original array', () => {
    const copy = [...posts]
    sortByDate(posts)
    expect(posts).toEqual(copy)
  })
})

describe('filterByTag', () => {
  it('returns all posts when tag is "all"', () => {
    expect(filterByTag(posts, 'all')).toHaveLength(3)
  })

  it('returns all posts when tag is empty string', () => {
    expect(filterByTag(posts, '')).toHaveLength(3)
  })

  it('filters by specific tag', () => {
    expect(filterByTag(posts, 'ai').map(p => p.slug)).toEqual(['a', 'b'])
  })

  it('returns empty array when no posts match', () => {
    expect(filterByTag(posts, 'nonexistent')).toHaveLength(0)
  })
})

describe('extractTags', () => {
  it('returns all unique tags', () => {
    const tags = extractTags(posts)
    expect(tags).toContain('ai')
    expect(tags).toContain('agents')
    expect(tags).toContain('graphs')
    expect(tags).toContain('engineering')
  })

  it('returns no duplicates', () => {
    const tags = extractTags(posts)
    expect(new Set(tags).size).toBe(tags.length)
  })
})

describe('getFeatured', () => {
  it('returns the post marked featured', () => {
    expect(getFeatured(posts)?.slug).toBe('b')
  })

  it('falls back to first post when none is featured', () => {
    const none = posts.map(p => ({ ...p, featured: false }))
    expect(getFeatured(none)?.slug).toBe('a')
  })

  it('returns null for empty array', () => {
    expect(getFeatured([])).toBeNull()
  })
})

describe('getRecent', () => {
  it('excludes the given slug', () => {
    const result = getRecent(posts, 'b', 3)
    expect(result.map(p => p.slug)).not.toContain('b')
  })

  it('returns at most n posts', () => {
    expect(getRecent(posts, 'b', 1)).toHaveLength(1)
  })

  it('returns all non-excluded when fewer than n exist', () => {
    expect(getRecent(posts, 'b', 10)).toHaveLength(2)
  })
})
