import { useState, useEffect, lazy, Suspense } from 'react';
import type { Socket } from 'socket.io-client';
import type { Color } from './types/chess';
import type { Move } from './types/chess';
import GameController from './components/Game/GameController';
import Slider from './components/UI/Slider';
import SettingsModal from './components/Modals/SettingsModal';
import SaveGameModal from './components/Modals/SaveGameModal';
import SaveOnLeaveModal from './components/Modals/SaveOnLeaveModal';
import SavedGamesDropdown from './components/UI/SavedGamesDropdown';
import { getSavedGames, persistSavedGame } from './utils/savedGamesStore';
import type { SavedGame } from './types/chess';
import Login from './pages/Login';
import Register from './pages/Register';
import GameLobby from './pages/GameLobby';
import { usePrefsStore } from './store/prefsStore';
import { useGameStore } from './store/gameStore';
import { useAuth } from './hooks/useAuth';
import { connectSocket, disconnectSocket } from './services/socketService';
import { getToken, BACKEND_AVAILABLE } from './services/authService';
import { EVENTS, type GameStartPayload } from './hooks/useWebSocket';
import { TIME_CONTROLS, type TimeControl } from './hooks/useTimer';

// Lazily loaded heavy pages
const PuzzlePage     = lazy(() => import('./pages/PuzzlePage'));
const LearningCenter = lazy(() => import('./pages/LearningCenter'));
const AnalysisPage   = lazy(() => import('./pages/AnalysisPage'));

type GameMode   = 'vs-ai' | 'local-multiplayer' | 'online';
type AppScreen  = 'menu' | 'game' | 'lobby' | 'puzzles' | 'learn' | 'analysis';
type AuthScreen = 'login' | 'register';

const DIFFICULTY_LABELS = ['Beginner', 'Easy', 'Medium', 'Hard', 'Master'];

function TimeControlSelector({ value, onChange }: { value: TimeControl | null; onChange: (tc: TimeControl | null) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Time control</label>
      <div className="flex flex-wrap gap-1.5">
        {TIME_CONTROLS.map((tc, i) => (
          <button
            key={i}
            onClick={() => onChange(tc)}
            className={`px-3 py-2 min-h-11 rounded-lg text-xs font-semibold transition-all ${
              value === tc
                ? 'bg-white text-gray-900'
                : 'bg-white/8 text-gray-400 hover:bg-white/15 hover:text-white'
            }`}
          >
            {tc?.label ?? '∞'}
          </button>
        ))}
      </div>
    </div>
  );
}

interface OnlineGameParams {
  gameId:           string;
  playerColor:      Color;
  opponentUsername: string;
  opponentRating:   number;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]">
      <div className="text-gray-500 text-sm animate-pulse">Loading…</div>
    </div>
  );
}

export default function App() {
  // ── Auth state ────────────────────────────────────────────────────────────
  const { user, isAuthenticated, isLoading: authLoading, error: authError, login, register, logout, clearError } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [showAuth, setShowAuth]     = useState(false);

  // ── Game setup state ──────────────────────────────────────────────────────
  const [screen, setScreen]           = useState<AppScreen>('menu');
  const [mode, setMode]               = useState<GameMode>('vs-ai');
  const [difficulty, setDifficulty]   = useState(3);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [showSettings, setShowSettings] = useState(false);
  const [p1Name, setP1Name]           = useState('White');
  const [p2Name, setP2Name]           = useState('Black');

  // Time control (shared between vs-AI and local multiplayer)
  const [timeControl, setTimeControl] = useState<TimeControl | null>(null);

  // Analysis — history from a completed game
  const [analysisHistory, setAnalysisHistory] = useState<Move[]>([]);

  // Saved games
  const [savedGames, setSavedGames]       = useState<SavedGame[]>(() => getSavedGames());
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveOnLeave, setShowSaveOnLeave] = useState(false);

  // ── Online game state ─────────────────────────────────────────────────────
  const [onlineParams, setOnlineParams] = useState<OnlineGameParams | null>(null);
  const [socket, setSocket]             = useState<Socket | null>(null);

  const { prefs, setPrefs } = usePrefsStore();

  // Read live game state for save-on-leave checks
  const gameHistory = useGameStore((s) => s.gameContext.history);
  const gameIsOver  = useGameStore((s) => s.isGameOver);

  // ── Socket lifecycle — connect on login, disconnect on logout ────────────
  // Connect / disconnect socket when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      const token = getToken();
      if (!token) return;

      const s = connectSocket(token);
      setSocket(s);

      const onGameStart = (payload: GameStartPayload) => {
        setOnlineParams({
          gameId:           payload.gameId,
          playerColor:      payload.yourColor,
          opponentUsername: payload.opponentUsername,
          opponentRating:   payload.opponentRating,
        });
        setMode('online');
        setScreen('game');
      };

      s.on(EVENTS.GAME_START, onGameStart);
      return () => { s.off(EVENTS.GAME_START, onGameStart); };
    } else {
      disconnectSocket();
      setSocket(null);
      setOnlineParams(null);
    }
  }, [isAuthenticated]);

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleDifficultyChange = (d: number) => {
    setDifficulty(d);
    usePrefsStore.getState().setPref('lastDifficulty', d);
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    setShowAuth(false);
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    await register(username, email, password);
    setShowAuth(false);
  };

  const startGame = (selectedMode: GameMode) => {
    useGameStore.getState().initializeGame();
    setMode(selectedMode);
    setScreen('game');
  };

  const handleAnalyze = (history: Move[]) => {
    setAnalysisHistory(history);
    setScreen('analysis');
  };

  // ── Saved-game helpers ────────────────────────────────────────────────────
  const refreshSavedGames = () => setSavedGames(getSavedGames());

  const defaultSaveTitle = () => {
    const moves = useGameStore.getState().gameContext.history.length;
    return mode === 'vs-ai'
      ? `vs AI · Move ${moves}`
      : `${p1Name} vs ${p2Name} · Move ${moves}`;
  };

  const doSaveGame = (title: string) => {
    const state = useGameStore.getState();
    const hist  = state.gameContext.history;
    persistSavedGame({
      title,
      mode: mode as 'vs-ai' | 'local-multiplayer',
      fen: state.gameContext.fen,
      moveList: hist.map((m) => ({
        from: m.from,
        to: m.to,
        ...(m.promotion ? { promotion: m.promotion } : {}),
      })),
      settings: { difficulty, playerColor, playerNames: { white: p1Name, black: p2Name } },
      moveCount: hist.length,
    });
    refreshSavedGames();
  };

  const handleMenuClick = () => {
    const hasProgress = gameHistory.length > 0 && !gameIsOver && mode !== 'online';
    if (hasProgress) {
      setShowSaveOnLeave(true);
    } else {
      setOnlineParams(null);
      setScreen('menu');
    }
  };

  const handleLoadGame = (game: SavedGame) => {
    useGameStore.getState().loadSavedGame(game.moveList);
    setMode(game.mode);
    setDifficulty(game.settings.difficulty);
    setPlayerColor(game.settings.playerColor);
    setP1Name(game.settings.playerNames.white);
    setP2Name(game.settings.playerNames.black);
    setScreen('game');
  };

  const headerLabel =
    mode === 'vs-ai'    ? `AI · ${DIFFICULTY_LABELS[difficulty - 1]}`
    : mode === 'online' ? `vs ${onlineParams?.opponentUsername ?? 'Opponent'} · Online`
    : `${p1Name} vs ${p2Name}`;

  // ── Auth overlay ─────────────────────────────────────────────────────────
  if (showAuth) {
    if (authScreen === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onGoRegister={() => { clearError(); setAuthScreen('register'); }}
          error={authError}
          isLoading={authLoading}
        />
      );
    }
    return (
      <Register
        onRegister={handleRegister}
        onGoLogin={() => { clearError(); setAuthScreen('login'); }}
        error={authError}
        isLoading={authLoading}
      />
    );
  }

  // ── Lobby ─────────────────────────────────────────────────────────────────
  if (screen === 'lobby') {
    return (
      <GameLobby
        socket={socket}
        myUserId={user?.id ?? ''}
        myUsername={user?.username ?? ''}
        onGameStart={(payload) => {
          setOnlineParams({
            gameId:           payload.gameId,
            playerColor:      payload.yourColor,
            opponentUsername: payload.opponentUsername,
            opponentRating:   payload.opponentRating,
          });
          setMode('online');
          setScreen('game');
        }}
        onBack={() => setScreen('menu')}
      />
    );
  }

  // ── Puzzles ───────────────────────────────────────────────────────────────
  if (screen === 'puzzles') {
    return (
      <Suspense fallback={<PageLoader />}>
        <PuzzlePage onBack={() => setScreen('menu')} />
      </Suspense>
    );
  }

  // ── Learn ─────────────────────────────────────────────────────────────────
  if (screen === 'learn') {
    return (
      <Suspense fallback={<PageLoader />}>
        <LearningCenter onBack={() => setScreen('menu')} />
      </Suspense>
    );
  }

  // ── Analysis ─────────────────────────────────────────────────────────────
  if (screen === 'analysis') {
    return (
      <Suspense fallback={<PageLoader />}>
        <AnalysisPage history={analysisHistory} onBack={() => setScreen('menu')} />
      </Suspense>
    );
  }

  // ── Game ──────────────────────────────────────────────────────────────────
  if (screen === 'game') {
    const activePlayerColor = mode === 'online' ? (onlineParams?.playerColor ?? 'w') : playerColor;
    const activePlayerNames =
      mode === 'online'
        ? {
            white: onlineParams?.playerColor === 'w'
              ? (user?.username ?? 'You')
              : (onlineParams?.opponentUsername ?? 'Opponent'),
            black: onlineParams?.playerColor === 'b'
              ? (user?.username ?? 'You')
              : (onlineParams?.opponentUsername ?? 'Opponent'),
          }
        : { white: p1Name, black: p2Name };

    return (
      <div className="min-h-screen flex flex-col bg-[#0f0f1a] screen-enter">
        <header className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none">♟</span>
            <h1 className="text-base font-bold text-white leading-tight">
              Jhesster Chess
              <span className="ml-2 text-xs font-normal text-gray-400 hidden sm:inline">{headerLabel}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && user && (
              <span className="text-xs text-gray-400 hidden sm:block">
                {user.username} <span className="text-gray-600">({user.rating})</span>
              </span>
            )}
            {/* Save game button — local games only, while in progress */}
            {mode !== 'online' && gameHistory.length > 0 && !gameIsOver && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
                aria-label="Save game"
                title="Save game"
              >
                💾
              </button>
            )}
            <button onClick={() => setShowSettings(true)} className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all" aria-label="Settings">⚙</button>
            <button
              onClick={handleMenuClick}
              className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
            >
              ← Menu
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-start lg:items-center justify-center p-4 lg:p-6 overflow-auto">
          <GameController
            difficulty={difficulty}
            mode={mode}
            playerColor={activePlayerColor}
            playerNames={activePlayerNames}
            socket={mode === 'online' ? socket : null}
            onlineGameId={mode === 'online' ? (onlineParams?.gameId ?? null) : null}
            timeControl={mode !== 'online' ? timeControl : null}
            onAnalyze={handleAnalyze}
          />
        </main>

        {showSettings && (
          <SettingsModal prefs={prefs} onPrefsChange={setPrefs} difficulty={difficulty} onDifficultyChange={handleDifficultyChange} onClose={() => setShowSettings(false)} isInGame />
        )}

        {showSaveModal && (
          <SaveGameModal
            defaultTitle={defaultSaveTitle()}
            onSave={(title) => { doSaveGame(title); setShowSaveModal(false); }}
            onCancel={() => setShowSaveModal(false)}
          />
        )}

        {showSaveOnLeave && (
          <SaveOnLeaveModal
            defaultTitle={defaultSaveTitle()}
            onSave={(title) => {
              doSaveGame(title);
              setShowSaveOnLeave(false);
              setOnlineParams(null);
              setScreen('menu');
            }}
            onDiscard={() => { setShowSaveOnLeave(false); setOnlineParams(null); setScreen('menu'); }}
            onCancel={() => setShowSaveOnLeave(false)}
          />
        )}
      </div>
    );
  }

  // ── Menu ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a] screen-enter">
      <header className="flex items-center justify-between px-5 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-lg select-none">♟</span>
          <span className="text-sm font-bold text-white tracking-tight">Jhesster</span>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <span className="text-xs text-gray-400 hidden sm:block">{user.username} · {user.rating}</span>
              <button onClick={logout} className="text-xs px-3 py-2 min-h-11 rounded-lg bg-white/8 hover:bg-white/15 text-gray-400 hover:text-white transition-all">Sign out</button>
            </>
          ) : BACKEND_AVAILABLE ? (
            <button
              onClick={() => { clearError(); setAuthScreen('login'); setShowAuth(true); }}
              className="text-xs px-4 py-2 min-h-11 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold transition-all"
            >
              Sign in
            </button>
          ) : (
            <span className="text-xs px-3 py-2 rounded-lg bg-white/5 text-gray-600 border border-white/8 cursor-default" title="Online features coming soon">
              Sign in
            </span>
          )}
          <button onClick={() => setShowSettings(true)} className="px-3 py-2 min-h-11 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all text-sm" aria-label="Settings">⚙</button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
      <div className="flex flex-col items-center justify-center gap-6 p-5 min-h-full animate-fade-in">

        {/* Hero — compact */}
        <div className="text-center">
          <div className="text-5xl mb-2 select-none">♟</div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Jhesster Chess</h1>
          <p className="text-gray-500 text-sm">Play, learn, and improve your chess</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">

          {/* ── PRIMARY: vs AI ── elevated card */}
          <div className="bg-white/5 border border-emerald-500/25 rounded-2xl p-5 flex flex-col gap-4 shadow-lg shadow-emerald-950/20">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-base">Play vs AI</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold">
                {DIFFICULTY_LABELS[difficulty - 1]}
              </span>
            </div>
            <Slider value={difficulty} min={1} max={5} onChange={handleDifficultyChange} />
            <div className="flex gap-2">
              {(['w', 'b'] as Color[]).map((c) => (
                <button key={c} onClick={() => setPlayerColor(c)}
                  className={`flex-1 py-2.5 min-h-11 rounded-xl font-semibold text-sm transition-all ${playerColor === c ? (c === 'w' ? 'bg-white text-gray-900 shadow-md' : 'bg-gray-700 text-white border border-gray-500 shadow-md') : 'bg-white/5 text-gray-400 border border-white/8 hover:bg-white/10'}`}>
                  {c === 'w' ? '♔ White' : '♚ Black'}
                </button>
              ))}
            </div>
            <TimeControlSelector value={timeControl} onChange={setTimeControl} />
            <div className="flex gap-2">
              <button onClick={() => startGame('vs-ai')} className="flex-1 py-3 min-h-11 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-md shadow-emerald-900/40">
                Start Game →
              </button>
              <SavedGamesDropdown
                games={savedGames}
                mode="vs-ai"
                onLoad={handleLoadGame}
                onDelete={refreshSavedGames}
                triggerClassName="px-3 min-h-11"
              />
            </div>
          </div>

          {/* ── SECONDARY: Local multiplayer ── */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5 flex flex-col gap-3">
            <h2 className="text-white font-semibold text-sm">Local Multiplayer</h2>
            <div className="flex gap-2">
              {[{ label: 'Player 1 (White)', val: p1Name, set: setP1Name }, { label: 'Player 2 (Black)', val: p2Name, set: setP2Name }].map(({ label, val, set }) => (
                <div key={label} className="flex-1">
                  <label className="text-xs text-gray-600 uppercase tracking-wide font-semibold block mb-1">{label.split(' ')[1]}</label>
                  <input type="text" value={val} onChange={(e) => set(e.target.value || label.split(' ')[1])} maxLength={16}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40 transition-colors" placeholder={label.split(' ')[1]} />
                </div>
              ))}
            </div>
            <TimeControlSelector value={timeControl} onChange={setTimeControl} />
            <div className="flex gap-2">
              <button onClick={() => startGame('local-multiplayer')} className="flex-1 py-2.5 min-h-11 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 active:scale-[0.98] transition-all">
                ⚔ Start Match
              </button>
              <SavedGamesDropdown
                games={savedGames}
                mode="local-multiplayer"
                onLoad={handleLoadGame}
                onDelete={refreshSavedGames}
                triggerClassName="px-3 min-h-11"
              />
            </div>
          </div>

          {/* ── SECONDARY: Online ── */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Play Online</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {!BACKEND_AVAILABLE
                  ? 'Coming soon'
                  : !isAuthenticated
                  ? 'Sign in to match with real opponents'
                  : null}
              </p>
            </div>
            {!BACKEND_AVAILABLE ? (
              <span className="shrink-0 px-4 py-2 rounded-xl bg-white/5 text-gray-600 font-bold text-sm border border-white/8 cursor-default">
                Soon
              </span>
            ) : isAuthenticated ? (
              <button
                onClick={() => setScreen('lobby')}
                className="shrink-0 px-4 py-2 min-h-11 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-500 active:scale-[0.98] transition-all"
              >
                Lobby →
              </button>
            ) : (
              <button
                onClick={() => { clearError(); setAuthScreen('login'); setShowAuth(true); }}
                className="shrink-0 px-4 py-2 min-h-11 rounded-xl bg-sky-600/80 text-white font-bold text-sm hover:bg-sky-500 active:scale-[0.98] transition-all"
              >
                Sign in →
              </button>
            )}
          </div>

          {/* ── TERTIARY: Puzzles + Learn ── 2-column quick-access */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setScreen('puzzles')}
              className="flex flex-col items-center gap-2 py-4 min-h-11 rounded-2xl bg-amber-600/12 border border-amber-500/18 hover:bg-amber-600/20 hover:border-amber-500/30 text-amber-300 font-semibold text-sm active:scale-[0.97] transition-all"
            >
              <span className="text-2xl">♞</span>
              Puzzles
            </button>
            <button
              onClick={() => setScreen('learn')}
              className="flex flex-col items-center gap-2 py-4 min-h-11 rounded-2xl bg-blue-600/12 border border-blue-500/18 hover:bg-blue-600/20 hover:border-blue-500/30 text-blue-300 font-semibold text-sm active:scale-[0.97] transition-all"
            >
              <span className="text-2xl">📖</span>
              Learn
            </button>
          </div>

        </div>
      </div>
      </div>

      {showSettings && (
        <SettingsModal prefs={prefs} onPrefsChange={setPrefs} difficulty={difficulty} onDifficultyChange={handleDifficultyChange} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
