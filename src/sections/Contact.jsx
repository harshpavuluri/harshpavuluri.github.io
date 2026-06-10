import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaLinkedinIn, FaGithub, FaInstagram } from 'react-icons/fa'
import ScrollReveal from '../components/ScrollReveal'
import { personalInfo } from '../data/personalInfo'
import { socialLinks } from '../data/socialLinks'

const contactCards = [
  {
    icon: FaMapMarkerAlt,
    label: 'Location',
    value: personalInfo.location,
    href: null,
  },
  {
    icon: FaEnvelope,
    label: 'Email',
    value: personalInfo.email,
    href: `mailto:${personalInfo.email}`,
  },
  {
    icon: FaPhone,
    label: 'Phone',
    value: personalInfo.phone,
    href: `tel:${personalInfo.phone.replace(/\s/g, '')}`,
  },
]

const socialIconMap = {
  FaLinkedinIn,
  FaGithub,
  FaInstagram,
}

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-32 bg-bg-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-text-primary">
            Get In Touch
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 mb-16 rounded-full glow-cyan" />
        </ScrollReveal>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactCards.map((card, idx) => {
            const Icon = card.icon
            const content = (
              <motion.div
                whileHover={{
                  y: -4,
                  boxShadow: '0 0 20px rgba(0,240,255,0.2)',
                }}
                transition={{ duration: 0.3 }}
                className="spotlight-card flex flex-col items-center p-8 rounded-xl
                           bg-bg-card border border-primary-dim/20
                           hover:border-primary/40 transition-colors duration-300"
              >
                <Icon className="text-2xl text-primary mb-4" />
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-2">
                  {card.label}
                </h3>
                <span className="text-text-muted text-sm">{card.value}</span>
              </motion.div>
            )

            return (
              <ScrollReveal key={card.label} delay={idx * 0.15}>
                {card.href ? (
                  <a href={card.href} className="block no-underline">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </ScrollReveal>
            )
          })}
        </div>

        {/* Social links */}
        <ScrollReveal delay={0.3}>
          <div className="flex justify-center gap-4">
            {socialLinks.map((link) => {
              const Icon = socialIconMap[link.icon]
              return (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{
                    scale: 1.15,
                    boxShadow: '0 0 20px rgba(0,240,255,0.4)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex items-center justify-center w-12 h-12 rounded-full
                             bg-bg-card border border-primary-dim/20
                             hover:border-primary/60 text-text-muted hover:text-primary
                             transition-colors duration-300"
                  aria-label={link.name}
                >
                  {Icon && <Icon className="text-lg" />}
                </motion.a>
              )
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
