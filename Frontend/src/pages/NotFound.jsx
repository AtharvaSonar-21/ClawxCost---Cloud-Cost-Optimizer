export default function NotFound() {
  return (
    <div className="app-page flex items-center justify-center p-4">
      <div className="app-card text-center w-full max-w-lg">
        <h1 className="text-6xl font-pixel text-pixel-coral mb-4">404</h1>
        <p className="text-2xl font-pixel mb-8">Page Not Found</p>
        <a href="/" className="app-link-btn">
          Back to Home
        </a>
      </div>
    </div>
  )
}
