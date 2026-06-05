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
