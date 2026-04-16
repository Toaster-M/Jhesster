# Using the TODO List with Claude Code

## Overview

The `DEVELOPMENT_TODO_LIST.md` is a comprehensive checklist designed for Claude Code to understand the complete development roadmap and execute tasks systematically.

---

## How to Use This List

### 1. Copy the TODO List into Your Project

Place `DEVELOPMENT_TODO_LIST.md` in your project root:

```bash
chess-app/
├── DEVELOPMENT_TODO_LIST.md    ← Main checklist
├── frontend/
└── chess-app-backend/
```

### 2. Share with Claude Code

When using Claude Code, reference this file in your prompt:

```bash
claude code

# Then in the code session:
cat DEVELOPMENT_TODO_LIST.md | head -100
# or reference a specific phase:
grep -A 30 "PHASE 1:" DEVELOPMENT_TODO_LIST.md
```

### 3. Start with Phase 1

Example Claude Code prompt:

```
I'm working on Phase 1 of my chess application. Please:

1. Review the Phase 1 section in DEVELOPMENT_TODO_LIST.md
2. Start with "Setup & Infrastructure" section
3. Execute the following subtasks:
   - Create root project directory
   - Initialize Git repository
   - Create Vite React project
   - Install all dependencies

Let me know when each task is complete.
```

### 4. Track Progress

Update the checkboxes in the markdown as you go:

```markdown
- [x] Create root project directory: `chess-app/`
- [x] Initialize Git repository with `.gitignore`
- [ ] Create Vite React project in `frontend/` directory
```

Commit to Git when you complete a section:

```bash
git add DEVELOPMENT_TODO_LIST.md
git commit -m "Update: Phase 1 setup complete"
```

---

## Claude Code Workflow

### For Individual Tasks

```
claude code

> Read DEVELOPMENT_TODO_LIST.md and focus on this task:
> "Create `src/types/chess.ts` with all type definitions"
> 
> Create the file with complete TypeScript interfaces for:
> - Color, PieceSymbol, Piece
> - Square, Move
> - GameState, GameContext
> - GameMode, GameSettings
> - EngineEvaluation
```

### For Component Development

```
claude code

> Using Phase 1, "Board Components" section as reference:
>
> Create frontend/src/components/Board/Square.tsx
> with the following specifications from the TODO:
> - Props: square, piece, isSelected, isLegal, isLastMove, onClick
> - Correct square colors (light/dark)
> - Display pieces using Unicode
> - Show legal move indicators
> - Style with Tailwind
>
> Also create Board.module.css with required styles
```

### For Testing Tasks

```
claude code

> Check DEVELOPMENT_TODO_LIST.md "Testing & Validation" section for Phase 1:
> 
> Run these tests and verify each passes:
> - [ ] Vite dev server runs without errors
> - [ ] Application loads at http://localhost:5173/
> - [ ] Menu displays both game mode buttons
> - [ ] Game board renders with all 64 squares
> - [ ] Can click piece to select it
> - [ ] Legal moves highlight when piece selected
>
> Report which tests pass and which fail
```

### For Debugging

```
claude code

> I'm getting this error: [ERROR MESSAGE]
> Checking DEVELOPMENT_TODO_LIST.md Phase 1 "Testing & Validation"
> 
> This should work according to the checklist. Can you:
> 1. Identify what's wrong
> 2. Fix the issue
> 3. Verify the test now passes
```

---

## Batch Task Execution

### Execute Full Phase

```bash
claude code

# Read and execute all Phase 1 infrastructure setup
cat DEVELOPMENT_TODO_LIST.md | grep -A 50 "Setup & Infrastructure"

# Execute these tasks in order:
# 1. Create project structure
# 2. Initialize Git
# 3. Setup Vite
# 4. Install dependencies
# 5. Setup TypeScript and Tailwind

# Report completion status for each
```

### Execute by Component

```bash
claude code

# List all "Board Components" tasks from Phase 1
grep -A 25 "Board Components" DEVELOPMENT_TODO_LIST.md

# Create both Square.tsx and Board.tsx components
# Include Board.module.css with all required styles
# Test each component thoroughly
# Report completion with file paths
```

---

## Checkpoint Strategy

### After Each Section

1. **Check Progress**: Mark completed items in TODO
2. **Commit Work**: 
   ```bash
   git add .
   git commit -m "Phase 1: [Section Name] complete"
   ```
3. **Test**: Run the testing checklist from TODO
4. **Document**: Add any notes to the TODO for future reference

### Example After Setting Up Infrastructure

```bash
git commit -m "Phase 1: Setup & Infrastructure complete
  
- Created chess-app directory structure
- Initialized Git repository
- Created Vite React project
- Installed all dependencies
- Configured TypeScript and Tailwind CSS"
```

---

## Prompting Tips for Claude Code

### Be Specific

❌ **Bad:** "Create the components"  
✅ **Good:** "Create `src/components/Board/Square.tsx` per Phase 1 'Board Components' section with props: square, piece, isSelected, isLegal, isLastMove, onClick"

### Reference the TODO

❌ **Bad:** "Add some styling"  
✅ **Good:** "Create `src/components/Board/Board.module.css` with styles for: board grid layout, promotion modal, promotion overlay, and promotion piece buttons (from Phase 1 TODO)"

### Include Test Requirements

❌ **Bad:** "Make the board"  
✅ **Good:** "Create Board.tsx and ensure these tests pass (from TODO): board renders with all 64 squares, legal moves show correctly, board flip works"

### Ask for Status Reports

❌ **Bad:** "Do the work"  
✅ **Good:** "Execute Phase 1 'Type Definitions' section. When complete, show me a file listing of all types created and confirm each matches the TODO specification"

---

## Example Session Flow

### Session 1: Setup (1-2 hours)

```
User: Let's start Phase 1. What's the first step?

Claude: First task from DEVELOPMENT_TODO_LIST.md is:
"Create root project directory: `chess-app/`"

User: Do it. Then create Git repo and Vite project.

Claude: ✓ Created chess-app/
        ✓ Initialized .git
        ✓ Created Vite React project in frontend/
        ✓ Installed all dependencies
        
Next step: Setup TypeScript config with path aliases

User: Do it. Check the TODO for the aliases needed.

Claude: ✓ Created tsconfig.json with path aliases:
        - @/* → src/*
        - @components/* → src/components/*
        - @hooks/* → src/hooks/*
        - @utils/* → src/utils/*
        - @services/* → src/services/*
        - @types/* → src/types/*

Done! Ready for Session 2: Type Definitions
```

### Session 2: Type Definitions (1 hour)

```
User: Now let's create all the type definitions from Phase 1.

Claude: I'll create src/types/chess.ts with all these types from the TODO:
- Color, PieceSymbol, Piece
- Square, Move
- GameState, GameContext
- GameMode, GameSettings
- EngineEvaluation

User: Good. Make sure it's complete.

Claude: ✓ Created chess.ts (108 lines)
        ✓ All 12 types defined per TODO specification
        ✓ Exported and ready to use
        
Ready for Session 3: Utility Functions
```

### Continue Through Phases

Build methodically through the TODO, testing after each section.

---

## Organizing Long Sessions

### If Working Multiple Hours

Split work by logical sections:

**Session 1 (2 hrs):** Setup & infrastructure  
**Session 2 (2 hrs):** Types, Utils, Store  
**Session 3 (2 hrs):** Board components  
**Session 4 (2 hrs):** Game components & Modals  
**Session 5 (2 hrs):** App component & Styling  
**Session 6 (2 hrs):** Testing & Documentation  

### Between Sessions

```bash
# Check what's done
grep "^\- \[x\]" DEVELOPMENT_TODO_LIST.md | wc -l
# Result: "42 tasks complete"

# Check what's next
grep "^\- \[ \]" DEVELOPMENT_TODO_LIST.md | head -5
# Shows next 5 tasks
```

---

## Handling Blocked Tasks

If a task is blocked, note it in the TODO:

```markdown
- [ ] Create `src/services/chessEngine.ts`
  **NOTE:** Blocked - waiting for stockfish.js npm installation (completed in Setup phase)
```

Then ask Claude Code to:

```
claude code

> Task is blocked. Can you:
> 1. Check if stockfish.js is actually installed
> 2. Verify it's in package.json
> 3. If not, install it
> 4. Update DEVELOPMENT_TODO_LIST.md to mark as unblocked
```

---

## Using TODO for Code Review

When reviewing code against the TODO:

```bash
# Check if all required methods are in ChessGame
grep -A 200 "ChessGame class wrapper" DEVELOPMENT_TODO_LIST.md | grep "Method:"

# Verify against the actual file
grep "^\s*[a-z]*(" frontend/src/utils/chessHelpers.ts
```

---

## Maintaining the TODO

### Update As You Go

```markdown
- [x] Create `src/types/chess.ts` with:
  - [x] Color type ('w' | 'b')
  - [x] PieceSymbol type
  - [x] Piece interface
  - [x] Square type
  - [x] Move interface
  - [x] GameState interface
  - [x] GameContext interface
  - [x] GameMode type
  - [x] GameSettings interface
  - [x] EngineEvaluation interface
```

### Add Notes When Needed

```markdown
- [x] Test: Legal moves highlight when piece selected
  **NOTE:** Implemented with yellow highlighting, legal moves show small dots inside empty squares
```

### Track Completion Percentage

At the end of each phase, add:

```
### Phase 1 Summary
- Total tasks: 85
- Completed: 85 ✅
- Progress: 100%
- Status: Ready for Phase 2
```

---

## Using TODO with GitHub

### Reference in Commit Messages

```bash
git commit -m "feat: implement Board and Square components

Closes #Phase1-BoardComponents

From DEVELOPMENT_TODO_LIST.md:
- Board.tsx with 64 square grid
- Square.tsx with piece display
- Board.module.css with styling
- All visual states working correctly
- Testing: 12/12 board tests passing"
```

### Reference in Pull Requests

```markdown
## Phase 1: MVP - Board Components

This PR completes the "Board Components" section of DEVELOPMENT_TODO_LIST.md

### Tasks Completed
- [x] Square.tsx component
- [x] Board.tsx component  
- [x] Board.module.css styling
- [x] All tests passing (12/12)

### Testing Results
- [x] All 64 squares render
- [x] Piece display correct
- [x] Legal moves highlight
- [x] Last move highlight
- [x] Board flip works

Ref: DEVELOPMENT_TODO_LIST.md lines 210-245
```

---

## Success Indicators

### Good Signs

✅ Checkbox marks progressing through the TODO  
✅ Regular Git commits following completed sections  
✅ Tests passing as specified in TODO  
✅ Code matches TODO specifications exactly  
✅ No items blocked for more than a session  

### Warning Signs

⚠️ Skipping ahead to later phases  
⚠️ Leaving TODO items unchecked but code written  
⚠️ Deviating significantly from TODO specifications  
⚠️ Tests not matching the TODO test list  
⚠️ Many blocked items with unclear blockers  

---

## Automation Ideas

### Generate Progress Report

```bash
#!/bin/bash
echo "=== Development Progress ==="
echo ""
echo "Phase 1:"
grep -A 100 "^## PHASE 1:" DEVELOPMENT_TODO_LIST.md | \
  grep "^\- \[" | wc -l
echo "tasks in phase"

grep -A 100 "^## PHASE 1:" DEVELOPMENT_TODO_LIST.md | \
  grep "^\- \[x\]" | wc -l
echo "tasks complete"
```

### Track Time Spent

```bash
# See commits by phase
git log --oneline | grep -i "phase 1"
```

---

## Final Notes

- **Use the TODO as your north star** - it's your complete specification
- **Check items as you complete them** - provides satisfaction and progress visibility
- **Commit regularly** - tying commits to TODO sections
- **Test according to the TODO** - not more, not less
- **Don't deviate** - follow specifications exactly
- **Ask Claude Code for help** - reference the TODO when explaining what you need

**The TODO list is your contract with the project. Follow it precisely, and you'll have a production-grade chess application at the end.**

Good luck! 🎉
