import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="card p-8 text-center max-w-md w-full">
            <div className="w-14 h-14 rounded-full bg-error-bg flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-error" />
            </div>
            <h2 className="font-display text-xl font-semibold text-ink mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => this.setState({ hasError: false })} className="btn-primary flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Try Again
              </button>
              <Link to="/" className="btn-secondary">Go Home</Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
