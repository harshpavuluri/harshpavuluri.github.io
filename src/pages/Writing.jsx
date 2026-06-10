import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllPosts, filterByTag } from '../lib/posts'
import SpotlightCard from '../components/SpotlightCard'
import TagNetwork from '../components/TagNetwork'

export default function Writing() {
  const allPosts = getAllPosts()
  const [activeTag, setActiveTag] = useState('all')
  const visible = filterByTag(allPosts, activeTag)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24">
      <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Writing</h1>
      <p className="text-text-muted text-base mb-8">
        Essays on Agentic AI, knowledge systems, and enterprise data engineering.
      </p>

      {/* Tag network filter */}
      <TagNetwork
        posts={allPosts}
        activeTag={activeTag}
        onToggle={tag => setActiveTag(prev => (prev === tag ? 'all' : tag))}
      />
      {activeTag !== 'all' && (
        <button
          onClick={() => setActiveTag('all')}
          className="font-mono text-xs text-text-muted hover:text-primary transition-colors mb-6 block cursor-pointer"
        >
          filter: {activeTag} · clear ✕
        </button>
      )}

      {/* Post list */}
      <div className="flex flex-col gap-4">
        {visible.map(post => (
          <Link key={post.slug} to={`/writing/${post.slug}`}>
            <SpotlightCard
              className={`border rounded-xl p-5 bg-bg-card cursor-pointer transition-colors duration-300 hover:border-primary/40 ${
                post.featured ? 'border-primary/30' : 'border-primary-dim/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Featured
                      </span>
                    )}
                    {post.tags?.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-base font-bold text-text-primary mb-1 leading-snug">{post.title}</h2>
                  <p className="text-text-muted text-sm leading-relaxed line-clamp-2">{post.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-text-muted whitespace-nowrap">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-text-muted">{post.readTime} min</p>
                </div>
              </div>
            </SpotlightCard>
          </Link>
        ))}

        {visible.length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">No essays with this tag yet.</p>
        )}
      </div>
    </div>
  )
}
