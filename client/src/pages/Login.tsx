import { useState, type FormEvent } from 'react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoRegister: () => void;
  error: string | null;
  isLoading: boolean;
}

export default function Login({ onLogin, onGoRegister, error, isLoading }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError('');

    if (!email.trim()) { setFieldError('Email is required'); return; }
    if (!password) { setFieldError('Password is required'); return; }

    try {
      await onLogin(email.trim(), password);
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
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to Jhesster Chess</p>
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
              autoComplete="current-password"
              required
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/60 transition-colors placeholder-gray-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="ai-spinner" /> Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{' '}
          <button
            onClick={onGoRegister}
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Create one
          </button>
        </p>

        <p className="text-center text-xs text-gray-600 mt-6">
          <button
            onClick={onGoRegister}
            className="underline hover:text-gray-400 transition-colors"
          >
            Play without account
          </button>
        </p>
      </div>
    </div>
  );
}
