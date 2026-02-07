import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-scroll'
import ParticleBackground from '../components/ParticleBackground'
import { personalInfo } from '../data/personalInfo'

export default function Hero() {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 600], [0, 200])
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const contentY = useTransform(scrollY, [0, 400], [0, -50])

  return (
    <section
      id="hero"
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Particle background with parallax */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <ParticleBackground />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-transparent to-bg-dark" />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 text-center px-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-4 glow-text text-white"
        >
          {personalInfo.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl text-text-muted max-w-xl mx-auto mb-8"
        >
          {personalInfo.title}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link
            to="about"
            smooth={true}
            duration={500}
            offset={-64}
            className="inline-block px-8 py-3 rounded-full border border-primary text-primary font-medium
                       hover:bg-primary hover:text-bg-dark transition-all duration-300 cursor-pointer
                       glow-cyan hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]"
          >
            About Me
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
