import ScrollReveal from '../components/ScrollReveal'
import NodeDivider from '../components/NodeDivider'
import { personalInfo } from '../data/personalInfo'

export default function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-bg-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <p className="font-mono text-[10px] tracking-widest uppercase text-text-muted mb-3">
            node: me
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-text-primary">
            {personalInfo.motto}
          </h2>
          <NodeDivider className="max-w-xs mx-auto mb-8" />
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
