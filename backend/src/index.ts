import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config/env';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import gameRoutes from './routes/games';
import { errorHandler, notFound } from './middleware/errorHandler';
import { registerConnectionHandler } from './websocket/handlers/connectionHandler';
import { registerGameHandler } from './websocket/handlers/gameHandler';
import type { JwtPayload } from './types/auth';
import { prisma } from './utils/db';

const app = express();
const httpServer = createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────

const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
});

// JWT authentication middleware for socket connections
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) return next(new Error('Authentication required'));

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { rating: true },
    });
    socket.data.user = {
      userId:   payload.userId,
      username: payload.username,
      rating:   dbUser?.rating ?? 1200,
    };
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  const u = socket.data.user as { username: string };
  console.log(`[socket] Connected: ${u.username} (${socket.id})`);
  registerConnectionHandler(io, socket);
  registerGameHandler(io, socket);
});

// ── Express middleware ────────────────────────────────────────────────────────

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── REST routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

// ── Error handling ────────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────

httpServer.listen(env.PORT, () => {
  console.log(`[server] Jhesster Chess API running on http://localhost:${env.PORT}`);
  console.log(`[server] Environment: ${env.NODE_ENV}`);
  console.log(`[server] WebSocket ready on ws://localhost:${env.PORT}`);
});

export default app;
