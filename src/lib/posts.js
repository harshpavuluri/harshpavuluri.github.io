// Pure utility functions — testable without Vite context
export function sortByDate(posts) {
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function filterByTag(posts, tag) {
  if (!tag || tag === 'all') return posts
  return posts.filter(p => Array.isArray(p.tags) && p.tags.includes(tag))
}

export function extractTags(posts) {
  return [...new Set(posts.flatMap(p => p.tags ?? []))]
}

export function getFeatured(posts) {
  return posts.find(p => p.featured) ?? posts[0] ?? null
}

export function getRecent(posts, excludeSlug, n = 3) {
  return posts.filter(p => p.slug !== excludeSlug).slice(0, n)
}

export function getRelatedPosts(posts, slug, n = 3) {
  const current = posts.find(p => p.slug === slug)
  if (!current?.tags?.length) return []
  return posts
    .filter(p => p.slug !== slug)
    .map(p => ({ post: p, overlap: (p.tags ?? []).filter(t => current.tags.includes(t)).length }))
    .filter(x => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || new Date(b.post.date) - new Date(a.post.date))
    .slice(0, n)
    .map(x => x.post)
}

// Pairs of tags that appear together on a post, with co-occurrence counts.
// Pair keys are sorted alphabetically: { a: 'agents', b: 'ai', count: 2 }
export function tagCooccurrence(posts) {
  const counts = new Map()
  posts.forEach(p => {
    const tags = [...new Set(p.tags ?? [])].sort()
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const key = `${tags[i]}|${tags[j]}`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  })
  return [...counts.entries()].map(([key, count]) => {
    const [a, b] = key.split('|')
    return { a, b, count }
  })
}

// Vite glob — discovers all .mdx files at build time
const modules = import.meta.glob('../posts/*.mdx', { eager: true })

export function getAllPosts() {
  return sortByDate(
    Object.entries(modules).map(([path, mod]) => ({
      slug: path.replace('../posts/', '').replace('.mdx', ''),
      Component: mod.default,
      ...mod.frontmatter,
    }))
  )
}

export function getPostBySlug(slug) {
  return getAllPosts().find(p => p.slug === slug) ?? null
}
