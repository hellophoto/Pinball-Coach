import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email for a confirmation link!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="app-title text-2xl sm:text-3xl md:text-4xl font-bold font-mono tracking-widest">
            🎯 PINBALL COACH
          </h1>
          <p className="mt-2 font-mono text-xs sm:text-sm tracking-wider" style={{ color: 'var(--neon-purple)' }}>
            {isSignUp ? 'CREATE YOUR ACCOUNT' : 'PLAYER LOGIN'}
          </p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-mono text-xs sm:text-sm mb-2 tracking-wider"style={{ color: 'var(--neon-cyan)' }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field w-full px-4 py-3 font-mono"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block font-mono text-sm mb-2 tracking-wider" style={{ color: 'var(--neon-cyan)' }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field w-full px-4 py-3 font-mono"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="font-mono text-sm px-4 py-3 rounded" style={{ 
                color: '#f87171',
                border: '1px solid #7f1d1d',
                background: 'rgba(127, 29, 29, 0.2)'
              }}>
                {error}
              </div>
            )}

            {message && (
              <div className="font-mono text-sm px-4 py-3 rounded" style={{ 
                color: '#4ade80',
                border: '1px solid #14532d',
                background: 'rgba(20, 83, 45, 0.2)'
              }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full font-mono font-bold py-2 sm:py-3 text-sm sm:text-base tracking-widest rounded-lg"
              style={{ 
                background: 'rgba(0, 255, 255, 0.15)',
                border: '2px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                boxShadow: '0 0 10px var(--neon-cyan)'
              }}
            >
              {loading ? 'LOADING...' : isSignUp ? 'CREATE ACCOUNT' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null) }} className="font-mono text-xs sm:text-sm tracking-wider transition-colors"
              style={{ color: 'var(--neon-purple)' }}
            >
              {isSignUp ? 'ALREADY HAVE AN ACCOUNT? LOGIN' : "DON'T HAVE AN ACCOUNT? SIGN UP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}