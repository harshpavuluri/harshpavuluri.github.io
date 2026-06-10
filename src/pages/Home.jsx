import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AmbientGraph from '../components/AmbientGraph'
import StatusBar from '../components/StatusBar'
import NodeDivider from '../components/NodeDivider'
import GraphPanel from '../components/GraphPanel'
import SpotlightCard from '../components/SpotlightCard'
import { getAllPosts, getFeatured, getRecent } from '../lib/posts'
import { personalInfo } from '../data/personalInfo'

export default function Home() {
  const posts = getAllPosts()
  const featured = getFeatured(posts)
  const recent = getRecent(posts, featured?.slug, 3)

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        <AmbientGraph />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6"
        >
          <StatusBar variant="hero" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-5 mb-3 text-text-primary">
            {personalInfo.name}
          </h1>
          <p className="font-mono text-primary text-sm md:text-base">
            &gt; building agentic systems that remember<span className="cursor-blink">▌</span>
          </p>
        </motion.div>
      </section>

      {/* Console row + content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
          {featured && (
            <Link to={`/writing/${featured.slug}`} className="md:col-span-3">
              <SpotlightCard
                className="border border-primary/20 rounded-xl p-6 bg-bg-card cursor-pointer
                           transition-colors duration-300 hover:border-primary/40 h-full flex flex-col"
              >
                <p className="font-mono text-[10px] tracking-widest uppercase text-secondary mb-3">
                  featured essay
                </p>
                <h2 className="text-xl font-bold text-text-primary mb-2 leading-snug">{featured.title}</h2>
                <p className="text-text-muted text-sm leading-relaxed mb-4 flex-1">{featured.description}</p>
                <div className="flex flex-wrap gap-2 items-center">
                  {featured.tags?.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-text-muted ml-auto">{featured.readTime} min · read →</span>
                </div>
              </SpotlightCard>
            </Link>
          )}
          <div className="md:col-span-2 min-h-[300px]">
            <GraphPanel />
          </div>
        </div>

        <NodeDivider className="my-10" />

        {/* Recent writing */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] tracking-widest uppercase text-secondary">
                recent writing
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
