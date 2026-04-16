import type { Server, Socket } from 'socket.io';
import { EVENTS, type LobbyUser } from '../events';

// In-memory lobby: socketId → LobbyUser
const lobbyUsers = new Map<string, LobbyUser>();

export function getLobbyUsers(): LobbyUser[] {
  return Array.from(lobbyUsers.values());
}

export function getLobbyUserByUserId(userId: string): LobbyUser | undefined {
  return Array.from(lobbyUsers.values()).find((u) => u.userId === userId);
}

export function removeLobbyUser(socketId: string): LobbyUser | undefined {
  const user = lobbyUsers.get(socketId);
  if (user) lobbyUsers.delete(socketId);
  return user;
}

export function registerConnectionHandler(io: Server, socket: Socket): void {
  const { userId, username, rating } = socket.data.user as {
    userId: string;
    username: string;
    rating: number;
  };

  socket.on(EVENTS.JOIN_LOBBY, () => {
    const entry: LobbyUser = { userId, username, rating, socketId: socket.id };
    lobbyUsers.set(socket.id, entry);

    // Tell this socket the current lobby state
    socket.emit(EVENTS.LOBBY_STATE, { users: getLobbyUsers() });

    // Tell everyone else a new player joined
    socket.broadcast.emit(EVENTS.USER_JOINED, entry);
  });

  socket.on(EVENTS.LEAVE_LOBBY, () => {
    const removed = removeLobbyUser(socket.id);
    if (removed) {
      socket.broadcast.emit(EVENTS.USER_LEFT, { userId });
    }
  });

  socket.on('disconnect', () => {
    const removed = removeLobbyUser(socket.id);
    if (removed) {
      io.emit(EVENTS.USER_LEFT, { userId });
    }
  });
}
