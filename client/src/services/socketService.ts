import { io, type Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  // Disconnect any stale instance first
  socket?.disconnect();

  socket = io(SERVER_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
