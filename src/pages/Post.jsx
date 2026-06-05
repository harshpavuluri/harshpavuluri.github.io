import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { getAllPosts, getPostBySlug } from '../lib/posts'

export default function Post() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = getPostBySlug(slug)

  useEffect(() => {
    if (!post) navigate('/writing', { replace: true })
  }, [post, navigate])

  if (!post) return null

  const allPosts = getAllPosts()
  const idx = allPosts.findIndex(p => p.slug === slug)
  const prev = allPosts[idx + 1] ?? null
  const next = allPosts[idx - 1] ?? null

  const { Component, title, date, tags, readTime } = post
  const shareUrl = `https://harshpavuluri.github.io/writing/${slug}`
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24">
      {/* Back */}
      <Link
        to="/writing"
        className="text-text-muted text-sm hover:text-primary transition-colors mb-8 block"
      >
        ← All writing
      </Link>

      {/* Post header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags?.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary leading-tight mb-3">{title}</h1>
        <div className="flex items-center gap-3 text-text-muted text-xs">
          <span>Harsha Pavuluri</span>
          <span>·</span>
          <span>
            {new Date(date).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </span>
          <span>·</span>
          <span>{readTime} min read</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-primary/20 to-transparent mb-8" />

      {/* MDX content */}
      <div className="prose-post">
        <Component />
      </div>

      {/* Footer */}
      <div className="border-t border-primary-dim/20 mt-12 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-text-muted text-xs mb-2">Share this essay</p>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-full border border-[#0077b5]/40 text-[#0077b5]
                       bg-[#0077b5]/10 hover:bg-[#0077b5]/20 transition-colors"
          >
            Share on LinkedIn ↗
          </a>
        </div>
        <div className="flex gap-6 text-sm flex-wrap">
          {prev && (
            <Link
              to={`/writing/${prev.slug}`}
              className="text-text-muted hover:text-primary transition-colors"
            >
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link
              to={`/writing/${next.slug}`}
              className="text-text-muted hover:text-primary transition-colors"
            >
              {next.title} →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
