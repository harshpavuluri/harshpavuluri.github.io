// Decorative drifting graph behind the hero. aria-hidden; animation is
// disabled by the prefers-reduced-motion block in index.css.
export default function AmbientGraph() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.13]" aria-hidden="true">
      <svg viewBox="0 0 900 320" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <g className="ambient-float" stroke="var(--color-primary)" fill="var(--color-primary)">
          <line x1="80" y1="120" x2="240" y2="60" strokeOpacity="0.6" />
          <line x1="240" y1="60" x2="430" y2="140" strokeOpacity="0.6" />
          <line x1="430" y1="140" x2="600" y2="70" strokeOpacity="0.6" />
          <circle cx="80" cy="120" r="5" />
          <circle cx="240" cy="60" r="7" />
          <circle cx="430" cy="140" r="5" />
          <circle cx="600" cy="70" r="7" />
        </g>
        <g className="ambient-float-slow" stroke="var(--color-secondary)" fill="var(--color-secondary)">
          <line x1="600" y1="70" x2="760" y2="180" strokeOpacity="0.5" />
          <line x1="430" y1="140" x2="320" y2="250" strokeOpacity="0.5" />
          <line x1="760" y1="180" x2="850" y2="90" strokeOpacity="0.5" />
          <circle cx="760" cy="180" r="5" />
          <circle cx="320" cy="250" r="4" />
          <circle cx="850" cy="90" r="4" />
        </g>
      </svg>
    </div>
  )
}
