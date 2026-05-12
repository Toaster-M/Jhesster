import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

const MODES = [
  { label: 'Play vs AI', sub: 'Challenge Stockfish', href: '/play/ai', ready: true },
  { label: 'Local PvP', sub: 'Two players, one device', href: '/play/local', ready: false },
  { label: 'Online PvP', sub: 'Real-time multiplayer', href: '/play/online', ready: false },
  { label: 'Puzzles', sub: 'Tactical training', href: '/puzzles', ready: false },
  { label: 'Learn', sub: 'Openings & AI tutor', href: '/learn', ready: false },
  { label: 'Analysis', sub: 'Review any game', href: '/analyze', ready: false },
]

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d3561]">
        <h1 className="text-2xl font-bold tracking-tight">Jhesster</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#8892b0]">
            {user?.username} · {user?.eloRating ?? 1200} Elo
          </span>
          <button
            onClick={clearAuth}
            className="text-sm text-[#8892b0] hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-[#8892b0] mb-8">Welcome back, {user?.username}!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODES.map(({ label, sub, href, ready }) =>
            ready ? (
              <Link
                key={label}
                to={href}
                className="bg-[#16213e] hover:bg-[#1e2d50] border border-[#2d3561] hover:border-[#6c63ff] rounded-xl p-5 transition-all group"
              >
                <p className="font-semibold text-white group-hover:text-[#6c63ff] transition-colors">{label}</p>
                <p className="text-sm text-[#8892b0] mt-1">{sub}</p>
              </Link>
            ) : (
              <div
                key={label}
                className="bg-[#16213e]/50 border border-[#2d3561]/50 rounded-xl p-5 opacity-50 cursor-not-allowed"
              >
                <p className="font-semibold text-white">{label}</p>
                <p className="text-sm text-[#8892b0] mt-1">{sub}</p>
                <p className="text-xs text-[#8892b0] mt-2">Coming soon</p>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
