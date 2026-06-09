import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SiteGraphHero from '../components/SiteGraphHero'
import SpotlightCard from '../components/SpotlightCard'
import Magnetic from '../components/Magnetic'
import { getAllPosts, getFeatured, getRecent } from '../lib/posts'
import { socialLinks } from '../data/socialLinks'
import { personalInfo } from '../data/personalInfo'

export default function Home() {
  const posts = getAllPosts()
  const featured = getFeatured(posts)
  const recent = getRecent(posts, featured?.slug, 3)

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-28 pb-8 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 glow-text text-text-primary">
            {personalInfo.name}
          </h1>
          <p className="text-primary font-medium mb-4 text-sm md:text-base">
            Data Engineer @ IBM · Agentic AI · Knowledge Graphs · Enterprise Data Systems
          </p>
          <p className="text-text-muted text-base leading-relaxed mb-6 max-w-xl">
            I write about autonomous AI systems, the infrastructure that makes them work,
            and what they mean for enterprise. Currently building at IBM Data &amp; AI.
          </p>
          <div className="flex gap-3 flex-wrap">
            {socialLinks.map(link => (
              <Magnetic key={link.name}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-4 py-2 rounded-full border border-primary-dim/30 text-text-muted
                             hover:text-primary hover:border-primary/60 transition-colors duration-300 inline-block"
                >
                  {link.name} ↗
                </a>
              </Magnetic>
            ))}
          </div>
        </motion.div>

        {/* The site, as a graph — drag it, click into it */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-0 max-w-4xl mx-auto px-4 sm:px-6 mt-4"
        >
          <SiteGraphHero />
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 h-24 z-1 bg-gradient-to-b from-transparent to-bg-dark pointer-events-none" />
      </section>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24">
        <div className="h-px bg-gradient-to-r from-primary/20 to-transparent mb-12" />

        {/* Featured post */}
        {featured && (
          <div className="mb-12">
            <p className="text-xs text-secondary font-semibold tracking-widest uppercase mb-4">
              Featured Essay
            </p>
            <Link to={`/writing/${featured.slug}`}>
              <SpotlightCard
                className="border border-primary/20 rounded-xl p-6 bg-bg-card cursor-pointer
                           transition-colors duration-300 hover:border-primary/40"
              >
                <div className="flex flex-wrap gap-2 mb-3 items-center">
                  {featured.tags?.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-text-muted ml-auto">{featured.readTime} min read</span>
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2 leading-snug">{featured.title}</h2>
                <p className="text-text-muted text-sm leading-relaxed mb-4">{featured.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">
                    {new Date(featured.date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                  <span className="text-primary text-sm">Read →</span>
                </div>
              </SpotlightCard>
            </Link>
          </div>
        )}

        {/* Recent writing */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-secondary font-semibold tracking-widest uppercase">
                Recent Writing
              </p>
              <Link to="/writing" className="text-primary text-xs hover:underline">
                All essays →
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recent.map(post => (
                <Link key={post.slug} to={`/writing/${post.slug}`}>
                  <SpotlightCard
                    className="border border-primary-dim/20 rounded-lg px-5 py-4 bg-bg-card
                               flex items-center gap-4 cursor-pointer transition-colors duration-300 hover:border-primary/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{post.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' · '}{post.readTime} min
                        {post.tags?.[0] && (
                          <> · <span className="text-secondary/70">{post.tags[0]}</span></>
                        )}
                      </p>
                    </div>
                    <span className="text-text-muted text-sm flex-shrink-0">→</span>
                  </SpotlightCard>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
