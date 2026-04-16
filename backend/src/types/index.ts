export * from './auth';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateGameBody {
  blackId?: string;   // null means vs AI
  timeControl?: string;
}

export interface AddMoveBody {
  from: string;
  to: string;
  san: string;
  fen: string;
  moveNumber: number;
  color: 'w' | 'b';
}

export interface EndGameBody {
  result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW' | 'ABANDONED';
  pgn?: string;
  fen?: string;
}
