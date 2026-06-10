import { Fragment } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from '../components/ScrollReveal'
import { projects } from '../data/projects'
import SpotlightCard from '../components/SpotlightCard'

function ProjectCard({ project, index }) {
  const isEven = index % 2 === 0

  return (
    <ScrollReveal variant={isEven ? 'fadeLeft' : 'fadeRight'} delay={0.1}>
      <SpotlightCard
        as={motion.div}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-xl overflow-hidden
                    bg-bg-card border border-primary-dim/10 hover:border-primary/30
                    transition-colors duration-300 ${project.featured ? 'lg:col-span-2' : ''}`}
      >
        {/* Image */}
        <div className={`relative overflow-hidden ${!isEven ? 'lg:order-2' : ''}`}>
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={project.image}
            alt={project.title}
            className="w-full h-48 lg:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 flex flex-col justify-center">
          <h3 className="text-xl font-bold text-text-primary mb-3">{project.title}</h3>
          <p className="text-text-muted text-sm leading-relaxed mb-4">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full
                           bg-secondary/10 text-secondary border border-secondary/20"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Link */}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-text-primary
                         transition-colors duration-300 font-medium group"
            >
              View Repository
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                &rarr;
              </span>
            </a>
          )}
        </div>
      </SpotlightCard>
    </ScrollReveal>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="py-20 md:py-32 bg-bg-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="font-mono text-[10px] tracking-widest uppercase text-text-muted text-center mb-2">
            hub: portfolio
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-text-primary">
            Projects
          </h2>
        </ScrollReveal>

        <div className="flex flex-col">
          {projects.map((project, index) => (
            <Fragment key={project.title}>
              {index > 0 && (
                <div className="flex justify-center py-1" aria-hidden="true">
                  <svg width="8" height="44">
                    <line x1="4" y1="0" x2="4" y2="44" stroke="var(--color-primary)" strokeOpacity="0.3" />
                    <circle cx="4" cy="22" r="3" fill="var(--color-primary)" fillOpacity="0.55" />
                  </svg>
                </div>
              )}
              <ProjectCard project={project} index={index} />
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
