import { Link } from 'react-router-dom'
import { Sun, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-6">
          <div className="text-8xl font-display font-bold text-brand-500 opacity-20">404</div>
          <Sun className="h-12 w-12 text-sun-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">Page not found</h1>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-2 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home className="h-4 w-4" /> Go Home
          </Link>
          <Link to="/projects" className="btn-secondary flex items-center gap-2">
            <Search className="h-4 w-4" /> Browse Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
