import { extractTags, tagCooccurrence } from '../lib/posts'

// Clickable tag-node strip: nodes are tags, edges join tags that co-occur
// on an essay. Click toggles the filter (parent owns the state).
export default function TagNetwork({ posts, activeTag, onToggle }) {
  const tags = extractTags(posts)
  const pairs = tagCooccurrence(posts)
  if (tags.length === 0) return null

  const pos = new Map(tags.map((t, i) => [
    t,
    { x: ((i + 1) / (tags.length + 1)) * 100, y: i % 2 === 0 ? 34 : 78 },
  ]))

  return (
    <div className="relative h-[112px] mb-8 select-none" role="group" aria-label="Filter essays by tag">
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        {pairs.map(({ a, b, count }) => {
          const pa = pos.get(a)
          const pb = pos.get(b)
          if (!pa || !pb) return null
          const hot = activeTag === a || activeTag === b
          return (
            <line
              key={`${a}|${b}`}
              x1={`${pa.x}%`} y1={pa.y}
              x2={`${pb.x}%`} y2={pb.y}
              stroke="var(--color-primary)"
              strokeOpacity={hot ? 0.7 : 0.15 + Math.min(count, 3) * 0.08}
              strokeWidth={hot ? 2 : 1}
            />
          )
        })}
      </svg>
      {tags.map(tag => {
        const p = pos.get(tag)
        const active = activeTag === tag
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            aria-pressed={active}
            style={{ left: `${p.x}%`, top: p.y }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 text-xs px-3 py-1.5 rounded-full border
                        font-mono transition-colors duration-200 cursor-pointer ${
              active
                ? 'border-primary text-primary bg-primary/10'
                : 'border-primary-dim/30 text-text-muted bg-bg-card hover:border-primary/40 hover:text-primary'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
