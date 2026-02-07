export default function Footer() {
  return (
    <footer className="py-6 bg-bg-card/50 border-t border-primary-dim/10">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-text-muted text-sm">
          Copyright &copy; Harsha Pavuluri {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
