import ScrollReveal from '../components/ScrollReveal'
import { personalInfo } from '../data/personalInfo'

export default function About() {
  return (
    <section id="about" className="py-20 md:py-32 bg-bg-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-text-primary">
            {personalInfo.motto}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 mb-8 rounded-full glow-cyan" />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            {personalInfo.bio}
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
