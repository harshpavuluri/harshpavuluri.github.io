import { useCallback, useMemo } from 'react'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useTheme } from '../hooks/useTheme'

export default function ParticleBackground() {
  const { theme } = useTheme()

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine)
  }, [])

  const particleColor = theme === 'light' ? '#d97706' : '#00f0ff'
  const linkOpacity = theme === 'light' ? 0.1 : 0.15
  const maxOpacity = theme === 'light' ? 0.25 : 0.4

  const options = useMemo(
    () => ({
      fullScreen: false,
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      particles: {
        color: { value: particleColor },
        links: {
          color: particleColor,
          distance: 150,
          enable: true,
          opacity: linkOpacity,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: 'none',
          outModes: { default: 'bounce' },
        },
        number: {
          density: { enable: true, area: 800 },
          value: window.innerWidth < 768 ? 25 : 60,
        },
        opacity: { value: { min: 0.1, max: maxOpacity } },
        size: { value: { min: 1, max: 3 } },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'grab' },
          onClick: { enable: true, mode: 'push' },
        },
        modes: {
          grab: { distance: 200, links: { opacity: 0.4 } },
          push: { quantity: 4 },
        },
      },
      detectRetina: true,
    }),
    [particleColor, linkOpacity, maxOpacity]
  )

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={options}
      className="absolute inset-0 z-0"
    />
  )
}
