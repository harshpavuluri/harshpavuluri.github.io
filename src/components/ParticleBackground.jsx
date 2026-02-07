import { useCallback, useMemo } from 'react'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine)
  }, [])

  const options = useMemo(
    () => ({
      fullScreen: false,
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      particles: {
        color: { value: '#00f0ff' },
        links: {
          color: '#00f0ff',
          distance: 150,
          enable: true,
          opacity: 0.15,
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
        opacity: { value: { min: 0.1, max: 0.4 } },
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
    []
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
