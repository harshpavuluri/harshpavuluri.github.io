// Section divider drawn as an edge with a node on it.
export default function NodeDivider({ className = '' }) {
  return (
    <div className={`flex items-center ${className}`} aria-hidden="true">
      <div className="h-px flex-[2] bg-gradient-to-r from-transparent to-primary/30" />
      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mx-1.5 flex-shrink-0" />
      <div className="h-px flex-[3] bg-gradient-to-r from-primary/30 to-transparent" />
    </div>
  )
}
