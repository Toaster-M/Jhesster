import { useState, useEffect, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';

// Mirror the server event constants on the client
export const EVENTS = {
  JOIN_LOBBY:            'join_lobby',
  LEAVE_LOBBY:           'leave_lobby',
  SEND_INVITE:           'send_invite',
  ACCEPT_INVITE:         'accept_invite',
  DECLINE_INVITE:        'decline_invite',
  SEND_MOVE:             'send_move',
  RESIGN:                'resign',
  LOBBY_STATE:           'lobby_state',
  USER_JOINED:           'user_joined',
  USER_LEFT:             'user_left',
  RECEIVE_INVITE:        'receive_invite',
  INVITE_ACCEPTED:       'invite_accepted',
  INVITE_DECLINED:       'invite_declined',
  GAME_START:            'game_start',
  RECEIVE_MOVE:          'receive_move',
  GAME_END:              'game_end',
  OPPONENT_DISCONNECTED: 'opponent_disconnected',
  SOCKET_ERROR:          'socket_error',
} as const;

export interface LobbyUser {
  userId:   string;
  username: string;
  rating:   number;
  socketId: string;
}

export interface IncomingInvite {
  fromUserId:   string;
  fromUsername: string;
  fromRating:   number;
}

export interface GameStartPayload {
  gameId:           string;
  yourColor:        'w' | 'b';
  opponentUsername: string;
  opponentRating:   number;
}

export interface ReceiveMovePayload {
  from:        string;
  to:          string;
  promotion?:  string;
  san:         string;
  fen:         string;
  color:       'w' | 'b';
  moveNumber:  number;
}

export interface GameEndPayload {
  result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW' | 'ABANDONED';
  reason: string;
}

interface UseWebSocketOptions {
  myUserId:    string;
  onGameStart: (payload: GameStartPayload) => void;
}

export function useWebSocket(socket: Socket | null, { myUserId, onGameStart }: UseWebSocketOptions) {
  const [lobbyUsers, setLobbyUsers]         = useState<LobbyUser[]>([]);
  const [incomingInvite, setIncomingInvite] = useState<IncomingInvite | null>(null);
  const [pendingInviteTo, setPendingInviteTo] = useState<string | null>(null); // userId we invited
  const [inviteDeclined, setInviteDeclined] = useState<string | null>(null);  // username who declined
  const [socketError, setSocketError]       = useState<string | null>(null);

  const onGameStartRef = useRef(onGameStart);
  onGameStartRef.current = onGameStart;

  // Join lobby and wire up events
  useEffect(() => {
    if (!socket) return;

    socket.emit(EVENTS.JOIN_LOBBY);

    const onLobbyState = ({ users }: { users: LobbyUser[] }) => {
      setLobbyUsers(users.filter((u) => u.userId !== myUserId));
    };

    const onUserJoined = (user: LobbyUser) => {
      if (user.userId === myUserId) return;
      setLobbyUsers((prev) => {
        if (prev.some((u) => u.userId === user.userId)) return prev;
        return [...prev, user];
      });
    };

    const onUserLeft = ({ userId }: { userId: string }) => {
      setLobbyUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    const onReceiveInvite = (invite: IncomingInvite) => {
      setIncomingInvite(invite);
    };

    const onInviteDeclined = ({ byUsername }: { byUsername: string }) => {
      setPendingInviteTo(null);
      setInviteDeclined(byUsername);
      setTimeout(() => setInviteDeclined(null), 3000);
    };

    const onGameStart = (payload: GameStartPayload) => {
      setIncomingInvite(null);
      setPendingInviteTo(null);
      onGameStartRef.current(payload);
    };

    const onError = ({ message }: { message: string }) => {
      setSocketError(message);
      setTimeout(() => setSocketError(null), 4000);
    };

    socket.on(EVENTS.LOBBY_STATE,    onLobbyState);
    socket.on(EVENTS.USER_JOINED,    onUserJoined);
    socket.on(EVENTS.USER_LEFT,      onUserLeft);
    socket.on(EVENTS.RECEIVE_INVITE, onReceiveInvite);
    socket.on(EVENTS.INVITE_DECLINED, onInviteDeclined);
    socket.on(EVENTS.GAME_START,     onGameStart);
    socket.on(EVENTS.SOCKET_ERROR,   onError);

    return () => {
      socket.emit(EVENTS.LEAVE_LOBBY);
      socket.off(EVENTS.LOBBY_STATE,    onLobbyState);
      socket.off(EVENTS.USER_JOINED,    onUserJoined);
      socket.off(EVENTS.USER_LEFT,      onUserLeft);
      socket.off(EVENTS.RECEIVE_INVITE, onReceiveInvite);
      socket.off(EVENTS.INVITE_DECLINED, onInviteDeclined);
      socket.off(EVENTS.GAME_START,     onGameStart);
      socket.off(EVENTS.SOCKET_ERROR,   onError);
    };
  }, [socket, myUserId]);

  const sendInvite = useCallback((toUserId: string) => {
    if (!socket) return;
    setPendingInviteTo(toUserId);
    socket.emit(EVENTS.SEND_INVITE, { toUserId });
  }, [socket]);

  const acceptInvite = useCallback(() => {
    if (!socket || !incomingInvite) return;
    socket.emit(EVENTS.ACCEPT_INVITE, { fromUserId: incomingInvite.fromUserId });
    setIncomingInvite(null);
  }, [socket, incomingInvite]);

  const declineInvite = useCallback(() => {
    if (!socket || !incomingInvite) return;
    socket.emit(EVENTS.DECLINE_INVITE, { fromUserId: incomingInvite.fromUserId });
    setIncomingInvite(null);
  }, [socket, incomingInvite]);

  const cancelInvite = useCallback(() => {
    setPendingInviteTo(null);
  }, []);

  return {
    lobbyUsers,
    incomingInvite,
    pendingInviteTo,
    inviteDeclined,
    socketError,
    sendInvite,
    acceptInvite,
    declineInvite,
    cancelInvite,
  };
}
