import { getAllPosts, getRelatedPosts } from './posts'
import { projects as siteProjects } from '../data/projects'
import { skillCategories as siteSkillCategories } from '../data/skills'

// Build the site itself as a knowledge graph: pages are hubs,
// essays / projects / skills are leaves, tags bridge essays together.
export function buildSiteGraph(posts, projects, skillCategories) {
  const nodes = []
  const links = []
  const add = (node) => { nodes.push(node); return node }

  add({ id: 'me', label: 'Harsha', group: 'core', val: 14 })
  add({ id: 'hub:writing', label: 'Writing', group: 'hub', val: 8, route: '/writing' })
  add({ id: 'hub:portfolio', label: 'Portfolio', group: 'hub', val: 8, route: '/portfolio' })
  add({ id: 'hub:about', label: 'About', group: 'hub', val: 8, route: '/about' })
  links.push(
    { source: 'me', target: 'hub:writing' },
    { source: 'me', target: 'hub:portfolio' },
    { source: 'me', target: 'hub:about' },
  )

  const tagIds = new Set()
  posts.forEach(post => {
    const id = `post:${post.slug}`
    add({ id, label: post.title, group: 'post', val: 6, route: `/writing/${post.slug}` })
    links.push({ source: 'hub:writing', target: id })
    post.tags?.forEach(tag => {
      const tagId = `tag:${tag}`
      if (!tagIds.has(tagId)) {
        tagIds.add(tagId)
        add({ id: tagId, label: tag, group: 'tag', val: 3, route: '/writing' })
      }
      links.push({ source: id, target: tagId })
    })
  })

  projects.forEach(project => {
    const id = `project:${project.title}`
    add({ id, label: project.title, group: 'project', val: 5, href: project.link, route: project.link ? null : '/portfolio' })
    links.push({ source: 'hub:portfolio', target: id })
  })

  skillCategories.forEach(cat => {
    const id = `skills:${cat.category}`
    add({ id, label: cat.category, group: 'skill', val: 4, route: '/about' })
    links.push({ source: 'hub:about', target: id })
  })

  return { nodes, links }
}

// Convenience wrapper that injects real site data. Returns fresh node/link
// objects each call (force-graph mutates node positions in place).
export function getSiteGraph() {
  return buildSiteGraph(getAllPosts(), siteProjects, siteSkillCategories)
}

// The neighborhood of one essay: the essay (core), its tags, and essays
// sharing >=1 tag, linked through the shared tags. Null if no tags.
export function buildConstellation(posts, slug) {
  const current = posts.find(p => p.slug === slug)
  if (!current?.tags?.length) return null

  const nodes = [{ id: `post:${current.slug}`, label: current.title, group: 'core', val: 10 }]
  const links = []

  current.tags.forEach(tag => {
    nodes.push({ id: `tag:${tag}`, label: tag, group: 'tag', val: 4, route: '/writing' })
    links.push({ source: `post:${current.slug}`, target: `tag:${tag}` })
  })

  getRelatedPosts(posts, slug, 6).forEach(p => {
    nodes.push({ id: `post:${p.slug}`, label: p.title, group: 'post', val: 6, route: `/writing/${p.slug}` })
    p.tags
      .filter(t => current.tags.includes(t))
      .forEach(t => links.push({ source: `post:${p.slug}`, target: `tag:${t}` }))
  })

  return { nodes, links }
}
