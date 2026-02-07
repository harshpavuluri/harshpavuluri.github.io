import { motion } from 'framer-motion'

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
}

export default function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  className = '',
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      variants={variants[variant]}
      className={className}
    >
      {children}
    </motion.div>
  )
}
