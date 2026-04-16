// ── Socket event name constants ───────────────────────────────────────────────

export const EVENTS = {
  // Client → Server
  JOIN_LOBBY:     'join_lobby',
  LEAVE_LOBBY:    'leave_lobby',
  SEND_INVITE:    'send_invite',
  ACCEPT_INVITE:  'accept_invite',
  DECLINE_INVITE: 'decline_invite',
  SEND_MOVE:      'send_move',
  RESIGN:         'resign',

  // Server → Client
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

// ── Payload types ─────────────────────────────────────────────────────────────

export interface LobbyUser {
  userId:   string;
  username: string;
  rating:   number;
  socketId: string;
}

export interface SendInvitePayload {
  toUserId: string;
}

export interface AcceptInvitePayload {
  fromUserId: string;
}

export interface DeclineInvitePayload {
  fromUserId: string;
}

export interface SendMovePayload {
  gameId:      string;
  from:        string;
  to:          string;
  promotion?:  string;
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

export interface GameStartPayload {
  gameId:           string;
  yourColor:        'w' | 'b';
  opponentUsername: string;
  opponentRating:   number;
}

export interface GameEndPayload {
  result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW' | 'ABANDONED';
  reason: string;
}
