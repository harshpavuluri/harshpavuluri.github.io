import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Counts SPA route changes in GoatCounter. window.goatcounter.count is
// optional-chained: absent in dev, with ad-blockers, or before the script loads.
export default function PageviewTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.goatcounter?.count?.({ path: pathname })
  }, [pathname])

  return null
}
