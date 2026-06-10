import { motion } from 'framer-motion'
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiRuby,
  SiPostgresql,
  SiReact,
  SiFlask,
  SiRubyonrails,
  SiPytorch,
  SiTensorflow,
  SiDocker,
  SiGooglecloud,
  SiAmazonwebservices,
  SiGit,
  SiLinux,
} from 'react-icons/si'
import ScrollReveal from '../components/ScrollReveal'
import { skillCategories } from '../data/skills'

const iconMap = {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiRuby,
  SiPostgresql,
  SiReact,
  SiFlask,
  SiRubyonrails,
  SiPytorch,
  SiTensorflow,
  SiDocker,
  SiGooglecloud,
  SiAmazonwebservices,
  SiGit,
  SiLinux,
}

// One category rendered as a radial cluster: category hub in the middle,
// skills on a circle around it, SVG spokes underneath.
function SkillCluster({ category, index }) {
  const n = category.skills.length
  const R = 105
  const positions = category.skills.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    return { x: Math.round(Math.cos(angle) * R), y: Math.round(Math.sin(angle) * R) }
  })

  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="relative w-[320px] h-[320px] mx-auto">
        <svg viewBox="-160 -160 320 320" className="absolute inset-0 w-full h-full" aria-hidden="true">
          {positions.map((p, i) => (
            <line key={i} x1="0" y1="0" x2={p.x} y2={p.y} stroke="var(--color-primary)" strokeOpacity="0.22" />
          ))}
        </svg>

        {/* category hub */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-3 py-1.5
                     rounded-full border border-primary/40 bg-bg-card font-mono text-[11px] text-primary whitespace-nowrap"
        >
          {category.category}
        </div>

        {category.skills.map((skill, i) => {
          const Icon = iconMap[skill.icon]
          const p = positions[i]
          return (
            <div
              key={skill.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)` }}
            >
              <motion.div
                whileHover={{ scale: 1.12 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-11 h-11 rounded-full bg-bg-card border border-primary-dim/30
                             flex items-center justify-center hover:border-primary/50 transition-colors"
                >
                  {Icon && <Icon className="text-lg text-primary" />}
                </div>
                <span className="text-[10px] text-text-muted whitespace-nowrap">{skill.name}</span>
              </motion.div>
            </div>
          )
        })}
      </div>
    </ScrollReveal>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="py-16 md:py-24 bg-bg-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="font-mono text-[10px] tracking-widest uppercase text-text-muted text-center mb-2">
            skill graph
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-text-primary">
            Tech Stack
          </h2>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center gap-8">
          {skillCategories.map((category, i) => (
            <SkillCluster key={category.category} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
