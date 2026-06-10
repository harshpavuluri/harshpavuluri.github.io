import StatusBar from '../components/StatusBar'
import { socialLinks } from '../data/socialLinks'

export default function Footer() {
  return (
    <footer className="py-6 bg-bg-card/50 border-t border-primary-dim/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <StatusBar variant="footer" />
        <div className="flex items-center gap-4">
          {socialLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted text-xs hover:text-primary transition-colors"
            >
              {link.name} ↗
            </a>
          ))}
        </div>
      </div>
      <p className="text-center text-text-muted/60 text-[11px] mt-3">
        © Harsha Pavuluri {new Date().getFullYear()}
      </p>
    </footer>
  )
}
