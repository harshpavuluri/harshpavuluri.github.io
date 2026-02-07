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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

export default function Skills() {
  return (
    <section id="skills" className="py-20 md:py-32 bg-bg-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-white">
            Tech Stack
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 mb-16 rounded-full glow-cyan" />
        </ScrollReveal>

        {skillCategories.map((category, catIdx) => (
          <div key={category.category} className="mb-12 last:mb-0">
            <ScrollReveal delay={catIdx * 0.1}>
              <h3 className="text-lg font-semibold text-primary mb-6 text-center md:text-left">
                {category.category}
              </h3>
            </ScrollReveal>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={containerVariants}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {category.skills.map((skill) => {
                const Icon = iconMap[skill.icon]
                return (
                  <motion.div
                    key={skill.name}
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.08,
                      boxShadow: '0 0 20px rgba(0,240,255,0.4)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center justify-center p-5 rounded-xl
                               bg-bg-card border border-primary-dim/20
                               hover:border-primary/40 transition-colors duration-300"
                  >
                    {Icon && <Icon className="text-3xl text-primary mb-3" />}
                    <span className="text-sm text-text-muted font-medium">
                      {skill.name}
                    </span>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}
