import { useState, type FormEvent } from 'react';

interface RegisterProps {
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  onGoLogin: () => void;
  error: string | null;
  isLoading: boolean;
}

export default function Register({ onRegister, onGoLogin, error, isLoading }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError('');

    if (!username.trim()) { setFieldError('Username is required'); return; }
    if (username.trim().length < 3) { setFieldError('Username must be at least 3 characters'); return; }
    if (!email.trim()) { setFieldError('Email is required'); return; }
    if (password.length < 8) { setFieldError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setFieldError('Passwords do not match'); return; }

    try {
      await onRegister(username.trim(), email.trim(), password);
    } catch {
      // error surfaced through prop
    }
  };

  const displayError = fieldError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] p-4">
      <div className="w-full max-w-sm animate-fade-in-scale">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 select-none">♟</div>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-gray-400 text-sm mt-1">Join Jhesster Chess</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/4 border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
        >
          {displayError && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-300">
              {displayError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              maxLength={20}
              required
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors placeholder-gray-600"
              placeholder="chess_master_99"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors placeholder-gray-600"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors placeholder-gray-600"
              placeholder="At least 8 characters"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className={`bg-white/5 border rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors placeholder-gray-600 ${
                confirm && confirm !== password
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-emerald-500/60'
              }`}
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="ai-spinner" /> Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <button
            onClick={onGoLogin}
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
