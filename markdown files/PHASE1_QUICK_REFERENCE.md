# Phase 1 Quick Reference

## Files to Copy (In Order)

### 1. Type Definitions
- `chess.ts` → `frontend/src/types/chess.ts`

### 2. Utils & Services
- `chessHelpers.ts` → `frontend/src/utils/chessHelpers.ts`
- `chessEngine.ts` → `frontend/src/services/chessEngine.ts`

### 3. State Management
- `gameStore.ts` → `frontend/src/store/gameStore.ts`

### 4. Hooks
- `useGame.ts` → `frontend/src/hooks/useGame.ts`
- `useChessEngine.ts` → `frontend/src/hooks/useChessEngine.ts`

### 5. Components
**Board Components:**
- `Board.tsx` → `frontend/src/components/Board/Board.tsx`
- `Square.tsx` → `frontend/src/components/Board/Square.tsx`
- `Board.module.css` → `frontend/src/components/Board/Board.module.css`

**Game Components:**
- `GameController.tsx` → `frontend/src/components/Game/GameController.tsx`
- `GameInfo.tsx` → `frontend/src/components/Game/GameInfo.tsx`

**Modal Components:**
- `PiecePromotionModal.tsx` → `frontend/src/components/Modals/PiecePromotionModal.tsx`

### 6. Styling & Entry
- `globals.css` → `frontend/src/styles/globals.css`
- `App.tsx` → `frontend/src/App.tsx`
- `main.tsx` → `frontend/src/main.tsx` (replace existing)

## Development Workflow

```bash
# Start development
cd chess-app/frontend
npm run dev

# Open browser to http://localhost:5173/
```

## Game Features (Phase 1)

✅ Click-to-move piece placement  
✅ Legal move validation  
✅ AI opponent with 5 difficulty levels  
✅ Game state management  
✅ Captured pieces display  
✅ Move history  
✅ Undo button  
✅ New game reset  
✅ Piece promotion modal  
✅ Game end detection  

## Architecture Overview

```
User clicks square
    ↓
GameController
    ↓
useGame hook
    ↓
gameStore (Zustand)
    ↓
ChessGame class (chess.js)
    ↓
Board updates

For AI:
useChessEngine hook
    ↓
ChessEngine service
    ↓
stockfish.js (WASM)
    ↓
Returns best move
```

## Key Components & Their Roles

**App.tsx** - Menu and game mode selection
**GameController.tsx** - Main game orchestrator
**Board.tsx** - Renders all 64 squares
**Square.tsx** - Individual square with piece
**GameInfo.tsx** - Sidebar with game status
**PiecePromotionModal.tsx** - Pawn promotion selector

**useGame.ts** - All game logic and state
**useChessEngine.ts** - AI interaction
**gameStore.ts** - Centralized state (Zustand)

**ChessGame** - chess.js wrapper (move validation, FEN, etc.)
**ChessEngine** - stockfish.js wrapper (AI moves)

## Testing Checklist

- [ ] Menu loads with both game mode buttons
- [ ] "Play vs AI" button shows difficulty slider
- [ ] Can select difficulty 1-5
- [ ] Board renders correctly
- [ ] Can click piece to select it (shows legal moves)
- [ ] Can click destination square to move piece
- [ ] AI responds with a move after ~1 second
- [ ] Captured pieces display correctly
- [ ] Move history shows moves
- [ ] Undo button works
- [ ] New Game button resets board
- [ ] Game detects checkmate and draws

## Debugging Tips

1. **Open browser DevTools:** F12
2. **Console tab:** Shows any JavaScript errors
3. **Network tab:** Check Stockfish loading
4. **React DevTools:** Inspect component state

## Next Phase (Phase 2) Preview

- Algebraic notation input ("e2e4")
- Better difficulty indicator
- Move analysis display
- UI animations
- Settings panel
