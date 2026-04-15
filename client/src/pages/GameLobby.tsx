import type { Socket } from 'socket.io-client';
import type { GameStartPayload } from '../hooks/useWebSocket';
import { useWebSocket } from '../hooks/useWebSocket';

interface GameLobbyProps {
  socket:      Socket | null;
  myUserId:    string;
  myUsername:  string;
  onGameStart: (payload: GameStartPayload) => void;
  onBack:      () => void;
}

export default function GameLobby({ socket, myUserId, myUsername, onGameStart, onBack }: GameLobbyProps) {
  const {
    lobbyUsers,
    incomingInvite,
    pendingInviteTo,
    inviteDeclined,
    socketError,
    sendInvite,
    acceptInvite,
    declineInvite,
    cancelInvite,
  } = useWebSocket(socket, { myUserId, onGameStart });

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl select-none">♟</span>
          <span className="text-sm font-bold text-white">Jhesster Chess</span>
          <span className="text-xs text-gray-500 ml-1">· Online Lobby</span>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
        >
          ← Back
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start p-6 gap-6 animate-fade-in">
        {/* Error banner */}
        {socketError && (
          <div className="w-full max-w-md bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
            {socketError}
          </div>
        )}

        {/* Invite declined toast */}
        {inviteDeclined && (
          <div className="w-full max-w-md bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-300">
            {inviteDeclined} declined your invite.
          </div>
        )}

        {/* Incoming invite modal */}
        {incomingInvite && (
          <div className="w-full max-w-md bg-white/6 border border-white/15 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="text-center">
              <p className="text-white font-semibold text-base">Game invitation!</p>
              <p className="text-gray-400 text-sm mt-1">
                <span className="text-white">{incomingInvite.fromUsername}</span>
                {' '}({incomingInvite.fromRating}) wants to play
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={acceptInvite}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all"
              >
                Accept
              </button>
              <button
                onClick={declineInvite}
                className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white font-semibold text-sm transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Pending invite sent */}
        {pendingInviteTo && !incomingInvite && (
          <div className="w-full max-w-md bg-white/6 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 items-center">
            <div className="ai-spinner" />
            <p className="text-white text-sm">Waiting for opponent to accept…</p>
            <button
              onClick={cancelInvite}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Player list */}
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-base">Players Online</h2>
            <span className="text-xs text-gray-500">
              {lobbyUsers.length === 0 ? 'No one here yet' : `${lobbyUsers.length} player${lobbyUsers.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Self entry */}
          <div className="bg-white/4 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_var(--color-emerald-400)]" />
            <span className="text-white text-sm font-semibold flex-1">{myUsername}</span>
            <span className="text-xs text-gray-500">You</span>
          </div>

          {lobbyUsers.length === 0 ? (
            <div className="bg-white/4 border border-white/10 border-dashed rounded-xl px-4 py-8 text-center text-gray-500 text-sm">
              No other players in the lobby.<br />Invite a friend to join!
            </div>
          ) : (
            lobbyUsers.map((user) => {
              const isInvited = pendingInviteTo === user.userId;
              return (
                <div
                  key={user.userId}
                  className="bg-white/4 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_var(--color-emerald-400)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.rating} rating</p>
                  </div>
                  <button
                    onClick={() => sendInvite(user.userId)}
                    disabled={!!pendingInviteTo || !!incomingInvite}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isInvited
                        ? 'bg-amber-600/40 text-amber-300 cursor-default'
                        : 'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isInvited ? 'Invited…' : 'Invite'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <p className="text-xs text-gray-600 text-center">
          Share a link with a friend and ask them to sign in to play online.
        </p>
      </div>
    </div>
  );
}
