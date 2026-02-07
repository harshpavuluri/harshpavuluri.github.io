import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { label: 'About', to: 'about' },
  { label: 'Skills', to: 'skills' },
  { label: 'Projects', to: 'projects' },
  { label: 'Contact', to: 'contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-card/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="hero"
            smooth={true}
            duration={500}
            className="text-lg font-bold text-primary cursor-pointer glow-text"
          >
            Harsha Pavuluri
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                smooth={true}
                duration={500}
                offset={-64}
                spy={true}
                activeClass="!text-primary"
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors cursor-pointer"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-primary"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-primary"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-primary"
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-card/95 backdrop-blur-md border-t border-primary-dim/20 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  smooth={true}
                  duration={500}
                  offset={-64}
                  spy={true}
                  activeClass="!text-primary"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
