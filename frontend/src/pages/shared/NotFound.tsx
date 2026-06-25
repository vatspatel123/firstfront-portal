import { Link } from 'react-router-dom'
import { Sun, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-6">
          <div className="text-8xl font-bold text-blue-600 opacity-20">404</div>
          <Sun className="h-12 w-12 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Page not found</h1>
        <p className="text-sm text-slate-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-2 justify-center">
          <Link to="/" className="bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2">
            <Home className="h-4 w-4" /> Go Home
          </Link>
          <Link to="/projects" className="border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Search className="h-4 w-4" /> Browse Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
