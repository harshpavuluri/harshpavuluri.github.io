import { describe, it, expect } from 'vitest'
import { buildSiteGraph, buildConstellation } from './siteGraph'

const posts = [
  { slug: 'a', title: 'Essay A', date: '2026-01-01', tags: ['ai', 'agents'] },
  { slug: 'b', title: 'Essay B', date: '2026-06-01', tags: ['ai'] },
  { slug: 'c', title: 'Essay C', date: '2026-03-01', tags: ['other'] },
]
const projects = [{ title: 'Proj One', link: 'https://github.com/x' }]
const skillCategories = [{ category: 'Languages', skills: [] }]

describe('buildSiteGraph', () => {
  const graph = buildSiteGraph(posts, projects, skillCategories)

  it('creates the core and hub nodes', () => {
    const ids = graph.nodes.map(n => n.id)
    expect(ids).toContain('me')
    expect(ids).toContain('hub:writing')
    expect(ids).toContain('hub:portfolio')
    expect(ids).toContain('hub:about')
  })

  it('links every post to the writing hub', () => {
    posts.forEach(p => {
      expect(graph.links).toContainEqual({ source: 'hub:writing', target: `post:${p.slug}` })
    })
  })

  it('creates exactly one node per unique tag', () => {
    const tagNodes = graph.nodes.filter(n => n.group === 'tag')
    expect(tagNodes.map(n => n.id).sort()).toEqual(['tag:agents', 'tag:ai', 'tag:other'])
  })

  it('has no dangling link endpoints', () => {
    const ids = new Set(graph.nodes.map(n => n.id))
    graph.links.forEach(l => {
      expect(ids.has(l.source)).toBe(true)
      expect(ids.has(l.target)).toBe(true)
    })
  })
})

describe('buildConstellation', () => {
  it('returns null for a post with no tags', () => {
    expect(buildConstellation([{ slug: 'x', title: 'X', date: '2026-01-01' }], 'x')).toBeNull()
  })

  it('returns null for an unknown slug', () => {
    expect(buildConstellation(posts, 'nope')).toBeNull()
  })

  it('includes the current essay as the core node', () => {
    const c = buildConstellation(posts, 'a')
    const core = c.nodes.find(n => n.group === 'core')
    expect(core.id).toBe('post:a')
    expect(core.route).toBeUndefined()
  })

  it('includes tag nodes linked to the current essay', () => {
    const c = buildConstellation(posts, 'a')
    expect(c.nodes.map(n => n.id)).toEqual(expect.arrayContaining(['tag:ai', 'tag:agents']))
    expect(c.links).toContainEqual({ source: 'post:a', target: 'tag:ai' })
  })

  it('includes related essays but not unrelated ones, linked via shared tags', () => {
    const c = buildConstellation(posts, 'a')
    const ids = c.nodes.map(n => n.id)
    expect(ids).toContain('post:b')
    expect(ids).not.toContain('post:c')
    expect(c.links).toContainEqual({ source: 'post:b', target: 'tag:ai' })
  })

  it('gives related essays a navigable route', () => {
    const c = buildConstellation(posts, 'a')
    expect(c.nodes.find(n => n.id === 'post:b').route).toBe('/writing/b')
  })
})
