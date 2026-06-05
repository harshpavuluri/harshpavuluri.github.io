import Projects from '../sections/Projects'

export default function Portfolio() {
  return (
    <div className="pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-text-muted text-base">A selection of projects I've built and shipped.</p>
      </div>
      <Projects />
    </div>
  )
}
