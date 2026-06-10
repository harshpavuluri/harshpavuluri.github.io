import { useRef, useCallback } from 'react'

// Wraps any card with a cursor-following radial glow.
// Pure CSS-variable trick — no re-renders on mousemove.
export default function SpotlightCard({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null)

  const onMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
  }, [])

  return (
    <Tag ref={ref} onMouseMove={onMouseMove} className={`spotlight-card ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
