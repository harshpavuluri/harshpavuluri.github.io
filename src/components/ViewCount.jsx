import { useEffect, useState } from 'react'
import { fetchViewCount } from '../lib/views'

// Renders "· N views" once the count arrives; renders nothing on failure.
export default function ViewCount({ path, className = '' }) {
  const [views, setViews] = useState(null)

  useEffect(() => {
    let active = true
    fetchViewCount(path).then(v => { if (active) setViews(v) })
    return () => { active = false }
  }, [path])

  if (views == null) return null
  return <span className={className}>· {views.toLocaleString()} views</span>
}
