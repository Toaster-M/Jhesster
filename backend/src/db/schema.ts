import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 32 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  boardLightColor: varchar('board_light_color', { length: 7 }).default('#F0D9B5'),
  boardDarkColor: varchar('board_dark_color', { length: 7 }).default('#B58863'),
  pieceColorLight: varchar('piece_color_light', { length: 7 }).default('#FFFFFF'),
  pieceColorDark: varchar('piece_color_dark', { length: 7 }).default('#000000'),
  eloRating: integer('elo_rating').notNull().default(1200),
  createdAt: timestamp('created_at').defaultNow(),
})

export const savedGames = pgTable('saved_games', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  mode: varchar('mode', { length: 20 }).notNull(),
  pgn: text('pgn').notNull(),
  fen: text('fen').notNull(),
  isComplete: boolean('is_complete').default(false),
  shareToken: varchar('share_token', { length: 21 }).unique(),
  savedAt: timestamp('saved_at').defaultNow(),
})

export const puzzles = pgTable('puzzles', {
  id: uuid('id').primaryKey().defaultRandom(),
  lichessId: varchar('lichess_id', { length: 20 }).unique().notNull(),
  fen: text('fen').notNull(),
  moves: text('moves').notNull(),
  rating: integer('rating').notNull(),
  themes: text('themes').array(),
})

export const puzzleAttempts = pgTable('puzzle_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  puzzleId: uuid('puzzle_id').notNull().references(() => puzzles.id),
  solved: boolean('solved').notNull(),
  attemptedAt: timestamp('attempted_at').defaultNow(),
})

export const onlineGames = pgTable('online_games', {
  id: uuid('id').primaryKey().defaultRandom(),
  whiteUserId: uuid('white_user_id').references(() => users.id),
  blackUserId: uuid('black_user_id').references(() => users.id),
  pgn: text('pgn'),
  status: varchar('status', { length: 20 }).notNull(),
  result: varchar('result', { length: 10 }),
  isRanked: boolean('is_ranked').default(false),
  shareToken: varchar('share_token', { length: 21 }).unique(),
  whiteEloBefore: integer('white_elo_before'),
  blackEloBefore: integer('black_elo_before'),
  whiteEloAfter: integer('white_elo_after'),
  blackEloAfter: integer('black_elo_after'),
  createdAt: timestamp('created_at').defaultNow(),
  endedAt: timestamp('ended_at'),
})
