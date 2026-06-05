export default function SectionDivider({ flip = false }) {
  return (
    <div className="relative h-16 md:h-24 bg-transparent -mt-1">
      <svg
        className={`absolute w-full h-full ${flip ? 'rotate-180' : ''}`}
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,0 L1440,60 L1440,100 L0,100 Z"
          style={{ fill: 'var(--color-bg-dark)' }}
          fillOpacity="0.6"
        />
        <path
          d="M0,20 L1440,80 L1440,100 L0,100 Z"
          style={{ fill: 'var(--color-bg-dark)' }}
        />
      </svg>
    </div>
  )
}
