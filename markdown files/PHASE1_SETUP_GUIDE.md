# Phase 1 Setup Complete Guide

## Prerequisites
- Node.js 18+ installed
- Git installed and configured
- Git Bash as default terminal in VS Code

## Step-by-Step Setup

### 1. Create Project Structure
```bash
mkdir chess-app
cd chess-app
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2. Create Frontend with Vite
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D typescript @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier
npm install chess.js stockfish.js zustand classnames
cd ..
```

### 3. Setup Tailwind CSS
```bash
cd frontend
npx tailwindcss init -p
cd ..
```

### 4. Update Tailwind Config
Edit `frontend/tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'board-light': '#f0d9b5',
        'board-dark': '#baca44',
        'highlight': '#baca44',
      },
    },
  },
  plugins: [],
}
```

### 5. Create Folder Structure
```bash
cd frontend/src

# Main folders
mkdir -p components/Board
mkdir -p components/Game
mkdir -p components/Modals
mkdir -p components/UI
mkdir -p pages
mkdir -p hooks
mkdir -p utils
mkdir -p store
mkdir -p types
mkdir -p styles
mkdir -p services

cd ../..
```

### 6. Copy All Files

Copy the files from outputs in this order:

**Types:**
```bash
cp /path/to/chess.ts frontend/src/types/chess.ts
```

**Utils:**
```bash
cp /path/to/chessHelpers.ts frontend/src/utils/chessHelpers.ts
```

**Store:**
```bash
cp /path/to/gameStore.ts frontend/src/store/gameStore.ts
```

**Services:**
```bash
cp /path/to/chessEngine.ts frontend/src/services/chessEngine.ts
```

**Hooks:**
```bash
cp /path/to/useGame.ts frontend/src/hooks/useGame.ts
cp /path/to/useChessEngine.ts frontend/src/hooks/useChessEngine.ts
```

**Components - Board:**
```bash
cp /path/to/Board.tsx frontend/src/components/Board/Board.tsx
cp /path/to/Square.tsx frontend/src/components/Board/Square.tsx
cp /path/to/Board.module.css frontend/src/components/Board/Board.module.css
```

**Components - Modals:**
```bash
cp /path/to/PiecePromotionModal.tsx frontend/src/components/Modals/PiecePromotionModal.tsx
```

**Components - Game:**
```bash
cp /path/to/GameController.tsx frontend/src/components/Game/GameController.tsx
cp /path/to/GameInfo.tsx frontend/src/components/Game/GameInfo.tsx
```

**Styles:**
```bash
cp /path/to/globals.css frontend/src/styles/globals.css
```

**Root:**
```bash
cp /path/to/App.tsx frontend/src/App.tsx
cp /path/to/main.tsx frontend/src/main.tsx
```

### 7. Verify Project Structure
Your `frontend/src/` should now look like:
```
src/
├── components/
│   ├── Board/
│   │   ├── Board.tsx
│   │   ├── Square.tsx
│   │   └── Board.module.css
│   ├── Game/
│   │   ├── GameController.tsx
│   │   └── GameInfo.tsx
│   └── Modals/
│       └── PiecePromotionModal.tsx
├── hooks/
│   ├── useGame.ts
│   └── useChessEngine.ts
├── services/
│   └── chessEngine.ts
├── store/
│   └── gameStore.ts
├── styles/
│   └── globals.css
├── types/
│   └── chess.ts
├── utils/
│   └── chessHelpers.ts
├── App.tsx
└── main.tsx
```

### 8. Create .gitignore
Create `chess-app/.gitignore`:

```
node_modules/
dist/
build/
.vscode/
.env.local
.env.*.local
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.idea/
*.swp
.next
out/
```

### 9. Test the Application
```bash
cd chess-app/frontend
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open http://localhost:5173/ in your browser.

### 10. First Git Commit
```bash
cd chess-app
git add .
git commit -m "Phase 1: Initial chess game setup with local play and basic AI"
git branch -M main
```

### 11. Push to GitHub (Optional)
```bash
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/chess-app.git
git push -u origin main
```

## Testing the Game

1. **Start the dev server:** `npm run dev` in `frontend/` directory
2. **Select "Play vs AI"** from the menu
3. **Choose difficulty level** (1-5)
4. **Click squares** to select pieces and move them
5. **Watch the AI respond** after you move

## Common Issues & Fixes

### Stockfish.js not loading
- Make sure npm install included `stockfish.js`
- Check browser console for errors
- May take a few seconds on first load

### Tailwind styles not applying
- Verify `tailwind.config.js` has correct paths
- Ensure `globals.css` has `@import 'tailwindcss/...'`
- Restart dev server after config changes

### Board not rendering
- Check console for TypeScript errors
- Verify all components are imported correctly
- Make sure chess.js is installed

### AI not moving
- Check browser console for Stockfish errors
- Try a different difficulty level
- Reload the page

## Next Steps for Phase 2

1. Add algebraic notation input (e.g., "e2e4")
2. Implement difficulty indicator
3. Add move history with proper formatting
4. Create game analysis display
5. Improve UI/UX with animations

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality

# If you installed ESLint
npm run lint -- --fix  # Auto-fix issues
```

## Project Structure Explanation

- **types/**: TypeScript interfaces for type safety
- **utils/**: Helper functions (chess logic, utilities)
- **store/**: Zustand state management (game state)
- **services/**: External service integrations (Stockfish engine)
- **hooks/**: React custom hooks (useGame, useChessEngine)
- **components/**: Reusable React components
  - Board/: Chess board and squares
  - Game/: Game logic and display
  - Modals/: Overlay modals (promotion, etc.)
  - UI/: Generic UI components

## Key Technologies

- **React 18**: UI framework
- **Vite**: Fast build tool
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **chess.js**: Move validation and game logic
- **stockfish.js**: AI engine (WASM)
- **Zustand**: Simple state management

You now have a working Phase 1 chess application! 🎉
