import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import { useAuthStore, AuthUser } from '../stores/useAuthStore'

interface AuthResponse {
  token: string
  user: AuthUser
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { token, user } = await apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      })
      setAuth(user, token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Jhesster</h1>
        <p className="text-[#8892b0] text-center mb-8">Create your account</p>

        <form onSubmit={handleSubmit} className="bg-[#16213e] rounded-xl p-8 space-y-5">
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
          )}

          <div>
            <label className="block text-sm text-[#8892b0] mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9]+"
              title="3–32 alphanumeric characters"
              className="w-full bg-[#0f0f23] text-white rounded-lg px-4 py-2.5 border border-[#2d3561] focus:border-[#6c63ff] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8892b0] mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0f0f23] text-white rounded-lg px-4 py-2.5 border border-[#2d3561] focus:border-[#6c63ff] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8892b0] mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-[#0f0f23] text-white rounded-lg px-4 py-2.5 border border-[#2d3561] focus:border-[#6c63ff] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8892b0] mb-1" htmlFor="confirm">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full bg-[#0f0f23] text-white rounded-lg px-4 py-2.5 border border-[#2d3561] focus:border-[#6c63ff] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6c63ff] hover:bg-[#5a52d5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 transition-colors"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-[#8892b0]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6c63ff] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
