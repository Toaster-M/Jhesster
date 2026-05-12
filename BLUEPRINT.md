# Jhesster Chess Platform — Blueprint

---

## Part 1: Requirements

### Hosting & Infrastructure
- Deployed for free for personal use, with the ability to scale to paid tiers as needed
- Frontend hosted on **GitHub Pages**
- Backend hosted on **Render**
- Database hosted on **Neon** (serverless PostgreSQL)
- Pushing to GitHub should trigger automatic deployment via GitHub Actions
- All dependencies must use their most up-to-date stable versions at time of build

### Tech Stack
- **Frontend:** React 19, Vite 6, TypeScript 5
- **Backend:** Node.js 22 LTS, Express 5
- **Database:** Neon (PostgreSQL), accessed via **Drizzle ORM** (no Prisma)
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand v5
- **Chess Logic:** chess.js v1
- **AI Engine:** Stockfish (WASM) via stockfish.js
- **Real-Time:** Socket.io v4 (backend + client)
- **Auth:** JSON Web Tokens (jsonwebtoken) + bcryptjs
- **PWA:** vite-plugin-pwa

### Authentication
- Users must be able to register an account
- Users must be able to sign in to an existing account
- Auth must be protected via JWT
- Authenticated state must persist across page refreshes (stored in localStorage or httpOnly cookie)

### Chess Board
- Fully interactive chess board rendered in React
- Legal move validation via chess.js
- Pieces can be moved via click-to-select or drag-and-drop
- **Algebraic notation displayed on all 4 sides of the board** (ranks 1–8, files a–h)
- **Color picker in user settings** to customize:
  - Light square color
  - Dark square color
  - Piece color (for standard piece sets)
- Board customization preferences saved to the user's account
- Custom piece sets and board skins are planned for a future phase

### Game Modes

#### Play vs AI
- Play a full chess game against Stockfish (WASM, runs in-browser)
- Selectable difficulty levels (mapped to Stockfish skill levels) — accessible before each game and changeable mid-game (changing mid-game immediately restarts the position with the new difficulty)
- Optional game timer (selectable time controls)
- **Untimed games can be saved** and revisited later
- Option to analyze the completed game after it ends
- Completed games can be **exported as PGN** or **shared via a unique link**

#### Player vs Player — Local (Offline)
- Two players take turns on the same device
- No internet connection required
- Optional game timer
- **Untimed games can be saved** and revisited later
- Option to analyze the completed game after it ends
- Completed games can be **exported as PGN** or **shared via a unique link**

#### Player vs Player — Online
- Real-time multiplayer over WebSockets (Socket.io)
- Players can create a game room or join an existing one
- Moves synced in real time between both clients
- Handles reconnection gracefully
- Games can optionally be marked as **Ranked**, contributing to both players' Elo ratings and the competitive ladder
- Completed games can be **exported as PGN** or **shared via a unique link**

#### Puzzles
- Standard chess puzzles (tactic trainer)
- Puzzles sourced from the Lichess open puzzle database
- Each puzzle presents a position; the player must find the correct move sequence
- Hint system available
- Puzzle progress tracked per user account

#### Learn
- **Opening Library:**
  - Browseable library of chess openings organized by ECO code
  - Each opening shows the move tree, including major variations and continuations into the mid-game/end-game
  - Interactive board to step through each variation
- **AI Tutor Mode:**
  - Play a game against Stockfish in a guided learning context
  - After each move the player makes, Stockfish evaluates it
  - If the move is **notably good or notably bad** (not neutral), a **dialogue box** appears explaining *why* the move is good or bad
  - Commentary is generated from Stockfish evaluation deltas and a curated set of explanatory templates covering common chess concepts (tactics, piece activity, pawn structure, king safety, etc.)
  - Neutral moves do not trigger any commentary
- Learning mode games are **not eligible for post-game analysis** or saving
- **Shared Game Analysis:**
  - Any game shared via a link can be opened in a full analysis view within Learn mode
  - The AI provides a high-level written summary covering the opening played, key turning points, and move quality breakdown per player
  - Accessible without login — the link alone grants read-only access to the analysis

### Game Analysis
- Available after any completed game **except** Learning mode games
- Powered by Stockfish running in the browser (WASM)
- Features:
  - Navigate through every move of the completed game
  - Stockfish evaluation bar showing advantage at each position
  - Best move suggestions per position
  - Move classification (brilliant, good, inaccuracy, mistake, blunder)
  - Graph of evaluation over time

### Game Saving
- Available for **untimed** vs AI and untimed Local PvP games
- Saved games stored in the database under the user's account
- User can revisit and continue a saved game, or view it in analysis mode
- Each saved game and completed online game is assigned a **unique share token** — used to generate a public analysis link accessible without login

### Elo Estimation Mode
- A calibration mode that estimates the player's Elo rating by having them play against Stockfish at dynamically adjusted difficulty
- The player completes up to 5 timed games (5 minutes each); Stockfish's difficulty adjusts up or down after each result
- At the end, an estimated Elo is computed from Stockfish's final skill level and optionally saved to the player's profile
- The saved Elo seeds the player's starting rating for the competitive ladder

### Competitive Ladder
- Registered users have an Elo rating (default 1200, refinable via Elo Estimation Mode)
- Online PvP games can be created as **Ranked** — both players must be authenticated
- Ranked game results update both players' Elo ratings using the standard Elo formula (K-factor 32)
- A public leaderboard shows the top 100 players ranked by Elo, with each player's rating and ranked game count

### Progressive Web App (PWA)
- The platform must function as an installable PWA on desktop and mobile
- Must include a web app manifest with icon, name, and theme color
- Service worker for asset caching (to support offline loading of the shell)
- Responsive layout that works across mobile, tablet, and desktop screen sizes

---

## Part 2: Roadmap

---

### Phase 1 — Project Scaffold & CI/CD

**Goal:** Establish the monorepo, tooling, and deployment pipeline so every subsequent phase ships automatically.

---

#### 1.1 — Repository Structure

Create the top-level directories. Run all of these from the repo root (`c:\Users\dstee\Desktop\Jhesster`):

```bash
mkdir shared
mkdir .github
mkdir .github/workflows
```

The final layout will be:
```
/client/                ← React frontend (Vite)
/backend/               ← Express API + WebSocket server
/shared/                ← Shared TypeScript types (imported by both sides)
/.github/workflows/     ← GitHub Actions CI/CD
/BLUEPRINT.md
```

Create a root `.gitignore` to ensure neither side's `node_modules` or build output is committed:

```bash
# run from repo root
echo "node_modules/
dist/
.env
*.local
" > .gitignore
```

---

#### 1.2 — Frontend Initialization

**Step 1 — Scaffold the Vite + React + TypeScript project:**
```bash
npm create vite@latest client -- --template react-ts
```

**Step 2 — Enter the client directory and install the base scaffold dependencies:**
```bash
cd client
npm install
```

**Step 3 — Install Tailwind CSS v4 and its Vite plugin:**
```bash
npm install tailwindcss @tailwindcss/vite
```

**Step 4 — Install all remaining frontend dependencies in one command:**
```bash
npm install zustand chess.js react-router-dom socket.io-client vite-plugin-pwa
```

**Step 5 — Install type definitions for any untyped packages:**
```bash
npm install -D @types/node
```

**Step 6 — Replace the generated `vite.config.ts`** with the following to wire up Tailwind, PWA, and set the correct `base` path for GitHub Pages:

```ts
// client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Jhesster/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Jhesster',
        short_name: 'Jhesster',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        start_url: '/Jhesster/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.onrender\.com\/api\/.*/i,
            handler: 'NetworkFirst',
          },
        ],
      },
    }),
  ],
})
```

**Step 7 — Replace `client/tsconfig.json`** with strict settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src"]
}
```

**Step 8 — Add a `client/.gitignore`:**
```bash
echo "node_modules/
dist/
dist-ssr/
*.local
.env
.env.production
" > .gitignore
```

**Step 9 — Add a Tailwind CSS entry point.** Replace the contents of `client/src/index.css` with:
```css
@import "tailwindcss";
```

**Step 10 — Verify the dev server starts without errors:**
```bash
npm run dev
```
Expected output: `VITE vX.X.X  ready in Xms — Local: http://localhost:5173/Jhesster/`
Press `Ctrl+C` to stop once confirmed.

---

#### 1.3 — Backend Initialization

Run all of the following from the repo root unless stated otherwise.

**Step 1 — Create the backend directory and initialize a Node project:**
```bash
mkdir backend
cd backend
npm init -y
```

**Step 2 — Create the source directory tree:**
```bash
mkdir -p src/db
mkdir -p src/controllers
mkdir -p src/routes
mkdir -p src/middleware
mkdir -p src/services
mkdir -p src/websocket/handlers
mkdir -p src/types
mkdir -p src/config
mkdir -p scripts
```

**Step 3 — Install production dependencies:**
```bash
npm install express socket.io jsonwebtoken bcryptjs drizzle-orm @neondatabase/serverless cors dotenv express-rate-limit
```

**Step 4 — Install development dependencies:**
```bash
npm install -D typescript tsx tsup @types/node @types/express @types/jsonwebtoken @types/bcryptjs @types/cors drizzle-kit
```

**Step 5 — Create `backend/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src", "scripts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 6 — Replace the `scripts` block in `backend/package.json`:**
```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsup src/index.ts --format esm --dts --out-dir dist",
  "start": "node dist/index.js",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

**Step 7 — Create `backend/drizzle.config.ts`:**
```ts
import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'
config()

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

**Step 8 — Create the entry point `backend/src/index.ts`** (a minimal placeholder to confirm the server boots):
```ts
import express from 'express'
import { config } from 'dotenv'
config()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

**Step 9 — Add `backend/.gitignore`:**
```bash
echo "node_modules/
dist/
.env
drizzle/meta/
" > .gitignore
```

**Step 10 — Confirm the backend starts:**
```bash
npm run dev
```
Expected output: `Server running on port 3001`
Test it: open `http://localhost:3001/api/health` in a browser — should return `{"status":"ok"}`.
Press `Ctrl+C` to stop.

---

#### 1.4 — Neon Database Connection

**Step 1 — Create your Neon project** (one-time, done in the browser):
1. Go to [neon.tech](https://neon.tech) and sign in
2. Click **New Project**
3. Name it `jhesster`, select the region closest to your Render deployment
4. Copy the **Connection string** — it will look like:
   `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

**Step 2 — Create `backend/.env`** (never commit this file):
```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=replace_with_a_long_random_string_at_least_64_chars
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

To generate a secure `JWT_SECRET` from the terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Step 3 — Create `backend/.env.example`** (safe to commit, no real values):
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_64_char_random_secret_here
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

**Step 4 — Create `backend/src/db/client.ts`:**
```ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

**Step 5 — Create a placeholder `backend/src/db/schema.ts`** (full schema added in Phase 2):
```ts
// Tables will be defined here in Phase 2
export {}
```

**Step 6 — Confirm the database connection** by adding a temporary test route to `src/index.ts` and hitting it:
```ts
import { db } from './db/client'
import { sql } from 'drizzle-orm'

app.get('/api/db-check', async (_req, res) => {
  const result = await db.execute(sql`SELECT 1 AS connected`)
  res.json(result)
})
```
Visit `http://localhost:3001/api/db-check` — should return `[{"connected":1}]`.
Remove this test route after confirming.

---

#### 1.5 — GitHub Actions CI/CD

**Step 1 — Enable GitHub Pages on your repo** (one-time, done in the browser):
1. Go to your GitHub repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**

**Step 2 — Add GitHub repository secrets** (one-time, done in the browser):
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Add each of the following:

| Secret Name | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Your 64-char random secret |
| `VITE_API_URL` | Your Render backend URL (e.g. `https://jhesster-api.onrender.com`) |
| `VITE_WS_URL` | Same Render backend URL |

> Note: `VITE_API_URL` and `VITE_WS_URL` can be placeholder values until the Render service is created. Update them after Render deployment is set up.

**Step 3 — Create the frontend deploy workflow** at `.github/workflows/deploy-client.yml`:
```yaml
name: Deploy Client to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'client/**'
      - '.github/workflows/deploy-client.yml'

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - name: Install dependencies
        working-directory: client
        run: npm ci

      - name: Build
        working-directory: client
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_WS_URL: ${{ secrets.VITE_WS_URL }}
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: client/dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 4 — Create the backend CI workflow** at `.github/workflows/deploy-backend.yml`:

> Render auto-deploys when you push to `main`, so this workflow just validates the backend builds cleanly on every push. Render handles the actual deployment via its own webhook.

```yaml
name: Backend CI

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Type-check
        working-directory: backend
        run: npx tsc --noEmit

      - name: Build
        working-directory: backend
        run: npm run build
```

**Step 5 — Configure Render** (one-time, done in the browser):
1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Node Version:** `22`
4. Under **Environment**, add the same secrets: `DATABASE_URL`, `JWT_SECRET`, `PORT` (`10000`), `CLIENT_ORIGIN` (your GitHub Pages URL)
5. Render will give you a URL like `https://jhesster-api.onrender.com` — go back and update your GitHub secrets `VITE_API_URL` and `VITE_WS_URL` with this URL

---

#### 1.6 — Environment Configuration

**Create `client/.env.development`** (used when running `npm run dev` locally):
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

**Create `client/.env.production`** (used during the GitHub Actions build — values are injected from secrets, so this file only needs to exist as a reference; real values come from the CI environment):
```
VITE_API_URL=https://jhesster-api.onrender.com
VITE_WS_URL=https://jhesster-api.onrender.com
```

> `client/.env.production` should be committed to the repo since it contains no secrets — the values are the public Render URL. If you ever want to keep even the URL private, remove this file and rely entirely on GitHub Actions secrets.

**Create `client/.env.example`:**
```
VITE_API_URL=https://your-render-backend-url.onrender.com
VITE_WS_URL=https://your-render-backend-url.onrender.com
```

**Create the `shared/` directory's initial structure:**
```bash
# run from repo root
echo '{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationDir": "dist",
    "outDir": "dist",
    "skipLibCheck": true
  },
  "include": ["index.ts"]
}' > shared/tsconfig.json

echo "// Shared types will be added here as features are built
export type {}
" > shared/index.ts
```

**Phase 1 completion check — run through this list before moving to Phase 2:**
- [ ] `cd client && npm run dev` — Vite dev server starts at `http://localhost:5173/Jhesster/`
- [ ] `cd backend && npm run dev` — Express server starts at `http://localhost:3001`
- [ ] `http://localhost:3001/api/health` returns `{"status":"ok"}`
- [ ] Neon DB connection confirmed (via the temporary db-check route)
- [ ] `.github/workflows/deploy-client.yml` and `deploy-backend.yml` are committed
- [ ] GitHub Pages is set to **GitHub Actions** source
- [ ] All 4 GitHub repo secrets are set
- [ ] Render web service is created and pointing to `backend/`
- [ ] Pushing a commit to `main` triggers both Actions workflows and Render deploys without errors

---

### Phase 2 — Database Schema & Migrations

**Goal:** Define all database tables upfront using Drizzle so the schema is stable before any feature work begins.

#### 2.1 — Schema Design
Define the following tables in `backend/src/db/schema.ts`:

**`users`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| username | varchar(32) | unique, not null |
| email | varchar(255) | unique, not null |
| password_hash | text | not null |
| board_light_color | varchar(7) | default `#F0D9B5` |
| board_dark_color | varchar(7) | default `#B58863` |
| piece_color_light | varchar(7) | default `#FFFFFF` |
| piece_color_dark | varchar(7) | default `#000000` |
| created_at | timestamp | default now() |

**`saved_games`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users.id) | |
| mode | varchar(20) | `vs_ai` or `local_pvp` |
| pgn | text | full PGN of the game |
| fen | text | current board position (for resuming) |
| is_complete | boolean | default false |
| saved_at | timestamp | default now() |

**`puzzles`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| lichess_id | varchar(20) | unique |
| fen | text | starting position |
| moves | text | correct move sequence (UCI) |
| rating | integer | |
| themes | text[] | e.g. `['fork', 'mateIn2']` |

**`puzzle_attempts`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → users.id) | |
| puzzle_id | uuid (FK → puzzles.id) | |
| solved | boolean | |
| attempted_at | timestamp | default now() |

**`online_games`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| white_user_id | uuid (FK → users.id, nullable) | |
| black_user_id | uuid (FK → users.id, nullable) | |
| pgn | text | |
| status | varchar(20) | `waiting`, `active`, `complete`, `abandoned` |
| result | varchar(10) | `1-0`, `0-1`, `1/2-1/2`, null |
| created_at | timestamp | |
| ended_at | timestamp | nullable |

#### 2.2 — Drizzle Migrations
- Configure `drizzle.config.ts` at the backend root
- Run `npx drizzle-kit generate` to create SQL migration files
- Run `npx drizzle-kit migrate` to apply to Neon
- Commit all migration files to version control

#### 2.3 — Schema Additions (Migration 2)

> **Note:** These columns were not in the original schema and must be applied as a second Drizzle migration. Add them to `backend/src/db/schema.ts`, then run `npx drizzle-kit generate` and `npx drizzle-kit migrate`.

**Additional column for `users`:**
| Column | Type | Notes |
|---|---|---|
| elo_rating | integer | not null, default 1200 |

**Additional column for `saved_games`:**
| Column | Type | Notes |
|---|---|---|
| share_token | varchar(21) | unique, nullable — generated on game completion |

**Additional columns for `online_games`:**
| Column | Type | Notes |
|---|---|---|
| is_ranked | boolean | default false |
| share_token | varchar(21) | unique, nullable — generated on game completion |
| white_elo_before | integer | nullable — recorded at game start for ranked games |
| black_elo_before | integer | nullable |
| white_elo_after | integer | nullable — recorded on ranked game completion |
| black_elo_after | integer | nullable |

---

### Phase 3 — Authentication

**Goal:** Secure registration, login, JWT issuance, and protected route middleware.

#### 3.1 — Backend Auth Endpoints
- `POST /api/auth/register`
  - Validate: username (3–32 chars, alphanumeric), email (format), password (min 8 chars)
  - Hash password with `bcryptjs` (12 rounds)
  - Insert user row
  - Return JWT
- `POST /api/auth/login`
  - Look up user by email
  - Compare password hash
  - Return JWT
- `GET /api/auth/me`
  - Protected: requires valid JWT in `Authorization: Bearer <token>` header
  - Returns user profile (no password hash)

#### 3.2 — JWT Middleware
- `backend/src/middleware/auth.ts`
  - Verify token with `jsonwebtoken`
  - Attach decoded `userId` to `req.user`
  - Return 401 if missing or invalid

#### 3.3 — Frontend Auth
- Auth store in Zustand (`useAuthStore`):
  - State: `user`, `token`, `isAuthenticated`
  - Actions: `login()`, `register()`, `logout()`, `hydrateFromStorage()`
  - Persist token to localStorage on login; clear on logout
- Register page (`/register`): form with username, email, password, confirm password
- Login page (`/login`): form with email and password
- `ProtectedRoute` component: redirects to `/login` if not authenticated
- Call `GET /api/auth/me` on app load to validate stored token and hydrate user state

---

### Phase 4 — Core Chess Board Component

**Goal:** A reusable, fully functional chess board that all game modes will use.

#### 4.1 — Board Architecture
- `<ChessBoard>` component accepts:
  - `fen: string` — current position
  - `onMove: (from: string, to: string, promotion?: string) => void`
  - `orientation: 'white' | 'black'`
  - `interactive: boolean`
  - `highlightedSquares?: string[]`
  - `lastMove?: { from: string; to: string }`
- Board renders an 8×8 grid of `<Square>` components
- Each `<Square>` renders the piece on that square (if any) as an SVG

#### 4.2 — Pieces
- Use a free, open-licensed SVG piece set (e.g. Cburnett from Wikimedia)
- Each piece type (K, Q, R, B, N, P) has a white and black variant
- Pieces are rendered as inline SVGs for crisp scaling at any board size

#### 4.3 — Notation Labels (All 4 Sides)
- Render rank labels (1–8) on both the left and right edges of the board
- Render file labels (a–h) on both the top and bottom edges of the board
- Labels automatically flip when board orientation is `black`

#### 4.4 — Interaction
- **Click to move:** click a piece to select it (highlights legal destination squares), click a destination to move
- **Drag to move:** drag a piece to a destination square
- Legal moves computed via `chess.js` `moves({ square, verbose: true })`
- Illegal moves rejected silently
- Pawn promotion: show a promotion picker modal when a pawn reaches the back rank

#### 4.5 — Board Customization
- Read light square color, dark square color from `useAuthStore` (user preferences)
- Applied as inline CSS custom properties on the board container
- `<ColorPicker>` component in user settings page calls `PATCH /api/users/me/settings` to persist changes

#### 4.6 — User Settings API
- `PATCH /api/users/me/settings` (protected)
  - Accepts: `boardLightColor`, `boardDarkColor`, `pieceLightColor`, `pieceDarkColor`
  - Updates user row in DB
  - Returns updated user object

---

### Phase 5 — Play vs AI Mode

**Goal:** A complete single-player game against Stockfish running in the browser.

#### 5.1 — Stockfish WASM Integration
- Use the `stockfish` npm package (WASM build) or serve `stockfish.js` + `stockfish.wasm` from `/public`
- Initialize Stockfish in a Web Worker to keep the UI thread free
- Create a `useStockfish` hook:
  - `getMove(fen: string, skillLevel: number, depth: number): Promise<string>` — returns best move in UCI format
  - Exposes `evaluate(fen: string): Promise<number>` for analysis (centipawn score)
  - Handles worker lifecycle (init, terminate)

#### 5.2 — Game Flow
- Difficulty selector: Easy (skill 1–3), Medium (skill 8–12), Hard (skill 17–20) — displayed as a dropdown accessible both before starting and during the game; changing mid-game immediately restarts the position with the new difficulty applied
- Player chooses color (white/black/random)
- On each AI turn: send current FEN to Stockfish worker → receive best move → apply to board
- Display captured pieces and move history in algebraic notation
- Detect and display: check, checkmate, stalemate, draw conditions (fifty-move, threefold repetition, insufficient material) via `chess.js`

#### 5.3 — Timer (Optional)
- Time controls: 1 min, 3 min, 5 min, 10 min, 30 min, unlimited
- `<PlayerClock>` component counts down per player
- On time expiry, game ends immediately
- Timed games cannot be saved

#### 5.4 — Game Saving (Untimed)
- When an untimed game is in progress, a **Save Game** button is available
- `POST /api/games/save` (protected): saves PGN + current FEN to `saved_games`
- Saved games listed on user profile page
- User can load a saved game to resume it or view in analysis

#### 5.5 — Post-Game
- On game end: show result modal (win/lose/draw with reason)
- Buttons: **Analyze Game**, **Export PGN** (downloads a `.pgn` file), **Share Game** (generates a share token via `POST /api/games/:id/share` and copies `/analyze/<token>` to clipboard), **Play Again**, **Home**

---

### Phase 6 — Local Player vs Player Mode

**Goal:** Two players take turns on the same device with no network required.

#### 6.1 — Game Flow
- No authentication required to play locally, but saving requires login
- Board flips automatically after each move (optional toggle in settings)
- Same timer options as vs AI mode
- Same end-game result modal

#### 6.2 — Game Saving (Untimed)
- Same mechanism as Phase 5.4
- Mode stored as `local_pvp` in `saved_games.mode`

#### 6.3 — Post-Game
- On game end: show the same result modal as vs AI mode
- Buttons: **Analyze Game**, **Export PGN**, **Share Game**, **Play Again**, **Home**

---

### Phase 7 — Online Player vs Player Mode

**Goal:** Real-time multiplayer over WebSockets.

#### 7.1 — Socket.io Server Setup
- Mount Socket.io on the Express HTTP server in `backend/src/index.ts`
- Namespaces: `/game`
- Auth middleware on socket connection: verify JWT from `socket.handshake.auth.token`

#### 7.2 — Game Room Logic
- **Create game:** authenticated user emits `game:create` with optional `{ isRanked: boolean }` → server creates a room, inserts a row in `online_games` with status `waiting` and the `is_ranked` flag set, returns `gameId`
- **Join game:** another user emits `game:join` with `gameId` → server assigns them the opposite color, updates `online_games` status to `active`, emits `game:start` to both players with initial FEN and color assignments
- **Make move:** current player emits `game:move` with `{ from, to, promotion? }` → server validates with chess.js → broadcasts `game:move` to opponent → saves PGN to DB

#### 7.3 — Reconnection
- On disconnect, keep the game row `active` for 60 seconds
- On reconnect within that window, re-emit the current game state to the reconnecting player
- After 60 seconds, mark game as `abandoned`

#### 7.4 — Shareable Game Link
- After creating a game, the creator gets a shareable URL (e.g. `/play/online/<gameId>`)
- The opponent pastes the link to join

#### 7.5 — Frontend
- Lobby/join page at `/play/online`; game creation form includes a **Ranked** toggle (visible to authenticated users only)
- When a ranked game ends, the result modal shows the Elo change for both players (e.g. `+14` / `−8`)
- Game view identical to vs AI mode but moves only accepted on the correct player's turn
- Opponent's clock continues to count down in real time via socket events

#### 7.6 — Ranked Games & Elo Rating
- When a ranked game starts, record both players' current `elo_rating` as `white_elo_before` / `black_elo_before` on the `online_games` row
- On game completion (`status = 'complete'`), calculate new ratings using the standard Elo formula (K = 32):
  - `expected = 1 / (1 + 10^((opponent_elo − player_elo) / 400))`
  - Actual score: Win = 1.0, Draw = 0.5, Loss = 0.0
  - `new_elo = current_elo + 32 × (actual − expected)`
- Update both players' `users.elo_rating` and store `white_elo_after` / `black_elo_after` on the game row
- Abandoned ranked games do not affect Elo

#### 7.7 — Leaderboard API
- `GET /api/leaderboard` (public — no auth required)
  - Returns top 100 users by `elo_rating` descending, with a count of their completed ranked games
  - Response: `[{ rank, username, elo_rating, ranked_games_played }]`
- `GET /api/leaderboard/me` (protected)
  - Returns the authenticated user's rank, Elo, and ranked game count even if they fall outside the top 100

---

### Phase 8 — Puzzles Mode

**Goal:** A tactic trainer with a large set of puzzles from the Lichess database.

#### 8.1 — Puzzle Data Import
- Download the Lichess puzzle CSV (`lichess_db_puzzle.csv.zst`) from `database.lichess.org`
- Write a one-time import script (`backend/scripts/importPuzzles.ts`) that:
  - Reads the CSV
  - Inserts rows into the `puzzles` table in batches
  - Skips duplicates by `lichess_id`
- Target: import ~500,000 puzzles (filtered to ratings 800–2800)

#### 8.2 — Puzzle API
- `GET /api/puzzles/next` (protected):
  - Returns a puzzle not yet attempted by the user, weighted toward the user's current rating range
  - Returns: `{ id, fen, themes, rating }` — **does not return the solution moves**
- `POST /api/puzzles/:id/attempt` (protected):
  - Body: `{ moves: string[] }` — the player's move sequence in UCI
  - Server compares against stored solution
  - Records attempt in `puzzle_attempts`
  - Returns: `{ solved: boolean, solution: string[] }`

#### 8.3 — Frontend Puzzle UI
- Board is set to the puzzle's starting position
- It is always the player's turn (board orientation matches the side to move)
- Player makes moves; after each move the server checks if it matches the solution
  - Correct move: Stockfish plays the opponent's response (from the solution)
  - Wrong move: highlight the move as incorrect, offer a retry or show solution
- On completion: show rating, themes, and a **Next Puzzle** button
- Hint: reveal the first move of the solution (costs a hint point, cosmetic only)

---

### Phase 9 — Learn Mode

**Goal:** An interactive learning system for beginners through advanced players, with an opening library and an AI tutor.

#### 9.1 — Opening Library Data
- Encode all major openings (ECO A through E) as JSON tree structures:
  ```json
  {
    "name": "Sicilian Defense",
    "eco": "B20",
    "moves": [
      { "san": "e4", "fen": "...", "children": [
        { "san": "c5", "fen": "...", "children": [...] }
      ]}
    ],
    "description": "...",
    "continuesInto": "..."
  }
  ```
- Source from free/open databases (e.g. the `chess-openings` npm package or the ECO dataset from the Lichess GitHub)
- Store in a JSON file served from the backend, or import into a dedicated `openings` table

#### 9.2 — Opening Library UI
- Searchable list of openings, filterable by ECO code or name
- Selecting an opening loads an interactive board that steps through the move tree
- Navigation controls: **Previous**, **Next**, **Jump to variation**
- Sidebar shows the current move, ECO code, opening name, and a short description
- Variations are shown as a branching list; clicking a variation switches the board to that line

#### 9.3 — AI Tutor Mode
- Player selects **AI Tutor** from the Learn menu
- Board and game flow identical to vs AI mode (Stockfish provides opponent moves)
- After **each player move**, the tutor evaluates:
  1. Get centipawn evaluation of the position **before** the move (Stockfish `eval`)
  2. Get centipawn evaluation **after** the move
  3. Compute delta
  4. Classify:
     - Delta ≤ −150 cp: **Blunder** — triggers explanation
     - Delta −50 to −149 cp: **Mistake** — triggers explanation
     - Delta +50 cp or more: **Good move / Brilliant** — triggers positive explanation
     - Delta −49 to +49 cp: **Neutral** — no dialogue shown
- Commentary dialogue box:
  - Appears in a non-blocking overlay at the bottom of the board
  - Displays a short (2–4 sentence) explanation using a template system:
    - Templates are written for common patterns: hanging pieces, forks, discovered attacks, pawn structure damage, king safety, piece development, etc.
    - The template selected is based on Stockfish's `info` output (best move, threat detection) and the move played
  - Player clicks **Got it** to dismiss and continue
- No game saving or post-game analysis for Tutor games

#### 9.4 — Shared Game Analysis
- Route: `/analyze/:shareToken`
- Loads the game's PGN from the backend using the share token (`GET /api/games/shared/:token`) — no auth required
- Runs the same full Stockfish analysis as Phase 10 (evaluation bar, move classification badges, evaluation graph)
- Additionally generates a **high-level text summary** displayed in a sidebar panel:
  - **Opening:** matched against ECO data; shows name and ECO code
  - **Move quality per player:** count of Brilliant / Good / Inaccuracy / Mistake / Blunder moves for each side
  - **Key moments:** the 2–3 positions with the largest evaluation swings, each annotated with the move that caused the swing
  - **Overall verdict:** a 1–2 sentence plain-English summary generated from the classification data (e.g. "White built a strong positional advantage but allowed a decisive tactic on move 31")
  - Summary is template-generated from Stockfish output — no external LLM required
- Logged-in users viewing a shared game are offered a **Save to Profile** option (`POST /api/games/import`)

---

### Phase 10 — Game Analysis Mode

**Goal:** Let players replay and deeply analyze any completed game.

#### 10.1 — Analysis Board
- Accessible after any completed vs AI or online/local PvP game
- Also accessible from a saved game in the user's profile
- **Shareable:** clicking **Share Game** in the post-game modal generates a unique `share_token` for the game (via `POST /api/games/:id/share`) and copies the URL `/analyze/<token>` to the clipboard — the link is publicly accessible without login
- Board loads the full PGN and starts at move 1
- Navigation: **◀◀ Start**, **◀ Prev**, **Next ▶**, **End ▶▶**, or click any move in the move list

#### 10.2 — Stockfish Analysis
- For each position in the game, run Stockfish at depth 18 (sufficient for accurate eval)
- Show:
  - **Evaluation bar** on the side of the board (white advantage +, black advantage −)
  - **Best move arrow** on the board (highlighted source → destination square)
  - **Move classification badge** next to each move in the move list: Brilliant ✨, Good ✓, Inaccuracy ?!, Mistake ?, Blunder ??
- **Evaluation graph** below the board showing the swing of advantage over all moves

#### 10.3 — Performance
- Run Stockfish analysis asynchronously in the Web Worker
- Cache evaluation results for each FEN in a local Map so navigating back doesn't re-evaluate

---

### Phase 11 — PWA & Responsive Design

**Goal:** Make the platform installable as an app and usable on any device.

#### 11.1 — PWA Configuration
- Configure `vite-plugin-pwa` in `vite.config.ts`:
  - `registerType: 'autoUpdate'`
  - App name: `Jhesster`
  - Icons: 192×192 and 512×512 PNG
  - `workbox` strategy: `CacheFirst` for assets, `NetworkFirst` for API calls
- Web app manifest:
  - `name`, `short_name`, `theme_color`, `background_color`, `display: standalone`
  - `start_url`: repo-relative path for GitHub Pages

#### 11.2 — Responsive Layout
- Mobile-first design using Tailwind breakpoints
- Board size: fluid, fills available viewport width on mobile; fixed max-width on desktop
- Navigation: hamburger menu on mobile, sidebar on desktop
- All modals (promotion picker, game over, save game) must work correctly on touch devices
- Drag-and-drop piece movement falls back to tap-to-select on touch screens (use pointer events)

---

### Phase 12 — User Profile & Settings

**Goal:** Central place for the user to manage their account and preferences.

#### 12.1 — Profile Page (`/profile`)
- Displays username, account creation date
- **Saved Games** section: list of saved games with mode, date, and options to resume or analyze
- **Puzzle Stats** section: total puzzles attempted, solved %, average puzzle rating
- **Elo Rating** section: displays current Elo rating, a **Calibrate** button linking to `/calibrate`, and a table of ranked game history (opponent, result, Elo change per game)

#### 12.3 — Leaderboard Page (`/leaderboard`)
- Public page — no login required
- Table showing top 100 players: **Rank**, **Username**, **Elo Rating**, **Ranked Games Played**
- The logged-in user's row is highlighted if they appear in the top 100, or pinned at the bottom of the table if outside it
- Clicking a username opens that user's public profile showing their Elo and recent ranked game results

#### 12.2 — Settings Page (`/settings`)
- **Board Colors:** two color pickers for light and dark squares (live preview using the actual `<ChessBoard>` component)
- **Piece Colors:** two color pickers for light and dark pieces
- **Save Settings** button calls `PATCH /api/users/me/settings`
- **Change Password** form (requires current password)
- **Delete Account** option (with confirmation)

---

### Phase 13 — Polish, Error Handling & Production Hardening

**Goal:** Make the app robust and production-ready.

#### 13.1 — Error Handling
- Global error boundary in React (`<ErrorBoundary>`)
- Toast notification system for user-facing errors (e.g. network failure, auth expiry)
- Backend: centralized error handler middleware returning consistent `{ error: string, code: string }` JSON

#### 13.2 — Security
- All API routes that touch user data are protected by JWT middleware
- Passwords never returned from any endpoint
- `cors` configured to only allow `CLIENT_ORIGIN`
- Rate limit auth endpoints (`express-rate-limit`): max 10 requests per 15 minutes per IP
- Sanitize all user inputs server-side

#### 13.3 — Performance
- Lazy-load game mode routes with `React.lazy` + `Suspense`
- Stockfish WASM only loaded when entering a mode that requires it
- Board SVGs inlined (no image HTTP requests per piece)
- Tailwind CSS purged in production build (automatic with v4)

#### 13.4 — Accessibility
- Board squares have `aria-label` attributes (e.g. "e4, white pawn")
- All interactive elements reachable via keyboard
- Color choices in settings checked for sufficient contrast (warn if contrast ratio < 4.5:1)

---

### Phase 14 — Elo Estimation Mode

**Goal:** Allow players to calibrate their estimated chess skill level through a short series of games, seeding their Elo rating for the competitive ladder.

#### 14.1 — Calibration Flow
- Accessible from the main menu or the Play vs AI page as **Estimate My Elo**
- The player plays up to 5 consecutive games against Stockfish, each with a fixed 5-minute clock (no timer changes allowed)
- Stockfish starts at skill level 10 (≈ 1400 Elo):
  - **Win:** increase skill level by 3
  - **Loss:** decrease skill level by 3
  - **Draw:** no change
  - Skill level is clamped to the range 1–20

#### 14.2 — Skill Level → Elo Mapping
Linear interpolation between the following anchor points:

| Stockfish Skill | Estimated Elo |
|---|---|
| 1 | 800 |
| 4 | 1000 |
| 7 | 1200 |
| 10 | 1400 |
| 13 | 1600 |
| 16 | 1800 |
| 20 | 2000+ |

#### 14.3 — Result & Profile Update
- After all 5 games (or if the player exits early, after completing at least 1 game):
  - Display the estimated Elo prominently
  - **Set as my rating** button — calls `PATCH /api/users/me/elo` to update `users.elo_rating`
  - Player can decline and keep their current rating
- Calibration games are not saved, not eligible for export or sharing, and do not count as ranked games

#### 14.4 — Frontend
- Route: `/calibrate`
- Progress indicator showing "Game X of 5" with a visual step bar
- Standard board with visible 5-minute clocks for both sides
- Between games: a brief interstitial screen showing the last result and a **Next Game** button
- Final screen: estimated Elo displayed in large text, a breakdown of game-by-game results, and **Set as my rating** / **Skip** buttons

---

## Dependency Version Reference

> Verify latest versions via `npm info <package> version` at build time.

| Package | Purpose |
|---|---|
| react, react-dom | UI framework |
| vite | Build tool |
| typescript | Type safety |
| tailwindcss | Styling |
| @tailwindcss/vite | Tailwind Vite plugin |
| zustand | State management |
| react-router-dom | Client-side routing |
| chess.js | Chess rules engine |
| stockfish | Stockfish WASM engine |
| socket.io-client | WebSocket client |
| vite-plugin-pwa | PWA support |
| express | HTTP server |
| socket.io | WebSocket server |
| drizzle-orm | ORM |
| drizzle-kit | Migrations CLI |
| @neondatabase/serverless | Neon DB driver |
| jsonwebtoken | JWT issuance & verification |
| bcryptjs | Password hashing |
| cors | CORS middleware |
| express-rate-limit | Rate limiting |
| dotenv | Environment variable loading |
| tsx | TypeScript dev runner |
| tsup | TypeScript build tool |

---

## Deployment Checklist (Pre-Launch)

- [ ] All GitHub secrets set (`DATABASE_URL`, `JWT_SECRET`, `VITE_API_URL`, `VITE_WS_URL`)
- [ ] Neon database migrations applied
- [ ] Puzzle import script run (if including puzzles at launch)
- [ ] Render service pointing to `backend/` directory with correct env vars
- [ ] GitHub Pages enabled, pointing to `gh-pages` branch
- [ ] Vite `base` config matches the GitHub Pages path
- [ ] PWA manifest icons present at correct paths
- [ ] CORS `CLIENT_ORIGIN` set to the GitHub Pages URL on Render
- [ ] Test auth flow (register → login → protected route)
- [ ] Test a full game in each mode
- [ ] Verify board loads and moves work on mobile
