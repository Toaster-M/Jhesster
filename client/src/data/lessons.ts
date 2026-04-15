export type LessonCategory = 'basics' | 'tactics' | 'openings' | 'endgames' | 'strategy';

export interface LessonStep {
  text:  string;
  /** Optional FEN to show on the board for this step */
  fen?:  string;
  /** Optional move to highlight (UCI string) */
  move?: string;
}

export interface Lesson {
  id:          string;
  title:       string;
  summary:     string;
  category:    LessonCategory;
  /** Reading time estimate in minutes */
  readTime:    number;
  steps:       LessonStep[];
  /** Optional key takeaway bullets */
  takeaways:   string[];
}

export const LESSONS: Lesson[] = [

  // ── Basics ─────────────────────────────────────────────────────────────────

  {
    id: 'piece-values',
    title: 'Piece Values',
    summary: 'Learn how much each piece is worth and why it matters.',
    category: 'basics',
    readTime: 3,
    steps: [
      {
        text: "Every piece in chess has a rough point value. Knowing these values helps you decide whether a trade is profitable.",
      },
      {
        text: "Pawn = 1 point. The humble pawn is the least valuable individual piece, but connected pawns and passed pawns can become extremely powerful.",
        fen: '8/pppppppp/8/8/8/8/PPPPPPPP/8 w - - 0 1',
      },
      {
        text: "Knight = 3 points. Knights move in an L-shape and can jump over other pieces. They are especially effective in closed positions.",
        fen: '8/8/8/8/4N3/8/8/8 w - - 0 1',
      },
      {
        text: "Bishop = 3 points. Bishops slide diagonally and cover long distances. Two bishops working together (the 'bishop pair') are particularly strong in open positions.",
        fen: '8/8/8/8/3B4/8/8/8 w - - 0 1',
      },
      {
        text: "Rook = 5 points. Rooks are powerful long-range pieces that control entire files and ranks. They are most effective in open files.",
        fen: '8/8/8/8/3R4/8/8/8 w - - 0 1',
      },
      {
        text: "Queen = 9 points. The queen combines the powers of the rook and bishop, making it the most powerful piece on the board.",
        fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1',
      },
      {
        text: "King = invaluable. You cannot trade the king — losing it means losing the game. Protect it at all costs.",
      },
    ],
    takeaways: [
      'Pawn ≈ 1, Knight/Bishop ≈ 3, Rook ≈ 5, Queen ≈ 9',
      'Winning a rook for a bishop is called "winning the exchange" (≈ +2 points)',
      'Material advantage is a guide, not a rule — activity and king safety matter too',
    ],
  },

  {
    id: 'check-and-mate',
    title: 'Check, Checkmate & Stalemate',
    summary: 'Understand the three most important game-ending situations.',
    category: 'basics',
    readTime: 4,
    steps: [
      {
        text: "Check means your king is under attack. You MUST address the check immediately — by moving the king, blocking, or capturing the attacking piece.",
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2',
      },
      {
        text: "Checkmate is when the king is in check AND has no legal way to escape. The game ends immediately — the side delivering checkmate wins.",
        fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
      },
      {
        text: "Stalemate is a draw. It occurs when the side to move has NO legal moves but their king is NOT in check. Be careful not to stalemate a losing opponent — and try to force it if you're losing!",
        fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',
      },
      {
        text: "Key insight: in stalemate the king is NOT in check, but has no legal moves. In checkmate the king IS in check with no escape. The difference decides draw vs. loss.",
      },
    ],
    takeaways: [
      'You must resolve a check every single move',
      'Checkmate wins the game; stalemate ends it as a draw',
      'When winning, watch out for accidental stalemate',
    ],
  },

  {
    id: 'castling',
    title: 'Castling',
    summary: 'Learn the special king-safety move and when to use it.',
    category: 'basics',
    readTime: 3,
    steps: [
      {
        text: "Castling is a special move combining king and rook. The king moves two squares toward the rook, and the rook jumps to the other side of the king.",
      },
      {
        text: "Kingside castling (O-O): the king goes from e1 to g1 (or e8 to g8), and the h-rook moves to f1 (or f8).",
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        move: 'e1g1',
      },
      {
        text: "Queenside castling (O-O-O): the king goes from e1 to c1, and the a-rook moves to d1.",
      },
      {
        text: "Castling is NOT allowed if:\n• The king has moved before\n• The chosen rook has moved before\n• The king is currently in check\n• Any square the king passes through is under attack\n• There are pieces between king and rook",
      },
    ],
    takeaways: [
      'Castle to tuck your king away safely and activate your rook',
      'Kingside castling is faster (fewer pieces to clear)',
      'You cannot castle through, out of, or into check',
    ],
  },

  // ── Openings ───────────────────────────────────────────────────────────────

  {
    id: 'opening-principles',
    title: 'Opening Principles',
    summary: 'The four rules every beginner should follow in the first 10 moves.',
    category: 'openings',
    readTime: 5,
    steps: [
      {
        text: "Opening play can seem overwhelming, but four timeless principles will keep you competitive from move one.",
      },
      {
        text: "1. Control the centre. The squares e4, d4, e5, d5 are the most important on the board. Pieces placed in or near the centre control more squares than pieces on the edge.",
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      },
      {
        text: "2. Develop your pieces. Move knights and bishops to active squares in the first few moves. Each move should bring a new piece into the game.",
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 5',
      },
      {
        text: "3. Castle early. After developing your minor pieces, castle to safeguard your king and connect your rooks.",
      },
      {
        text: "4. Don't move the same piece twice. Every time you move a piece that's already developed, you're falling behind in development. Exceptions exist for winning material or avoiding capture.",
      },
      {
        text: "Bonus: Don't bring the queen out early. The queen can be easily chased by enemy pieces, wasting tempos.",
      },
    ],
    takeaways: [
      'Control the centre with pawns and pieces',
      'Develop knights before bishops as a rule of thumb',
      'Castle before move 10 in most positions',
      "The 'free developing move' concept: gain a tempo with every move",
    ],
  },

  {
    id: 'italian-game',
    title: 'The Italian Game',
    summary: "One of the oldest and most instructive openings — great for beginners.",
    category: 'openings',
    readTime: 4,
    steps: [
      {
        text: "The Italian Game begins with 1.e4 e5 2.Nf3 Nc6 3.Bc4 — the bishop attacks the weakest square in Black's camp, f7.",
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
      },
      {
        text: "Black typically responds with 3...Bc5 (the Giuoco Piano) or 3...Nf6 (the Two Knights). Both fight for the centre.",
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      },
      {
        text: "After 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+, White gets a strong pawn centre but must deal with the pin on the knight.",
      },
      {
        text: "Key ideas: occupy the centre with d4, develop naturally, and castle kingside. The Italian is solid, instructive, and played at all levels.",
      },
    ],
    takeaways: [
      "1.e4 e5 2.Nf3 Nc6 3.Bc4 — easy to remember and principled",
      'Target the f7 square, Black\'s weakest point early on',
      'Follow up with c3 and d4 to claim the centre',
    ],
  },

  // ── Tactics ────────────────────────────────────────────────────────────────

  {
    id: 'tactics-forks',
    title: 'Forks',
    summary: 'Attack two pieces at once and guarantee winning material.',
    category: 'tactics',
    readTime: 4,
    steps: [
      {
        text: "A fork is a single move that attacks two or more enemy pieces simultaneously. The opponent can only save one, so you win the other.",
      },
      {
        text: "Knight forks are the most common and dangerous because knights jump over pieces and their attack patterns are hard to see. Here the knight on e5 forks the king and rook.",
        fen: '4k2r/8/8/4N3/8/8/8/4K3 w - - 0 1',
        move: 'e5f7',
      },
      {
        text: "Queen forks are also very powerful — the queen can attack along files, ranks, and diagonals, giving it many forking opportunities.",
      },
      {
        text: "Pawn forks often go unnoticed. An advancing pawn can threaten two pieces at once — be alert to this pattern in the middlegame.",
        fen: '4k3/8/8/3n1b2/4P3/8/8/4K3 w - - 0 1',
        move: 'e4e5',
      },
      {
        text: "To spot forks: look at all your pieces and ask 'Can I move this piece to a square that attacks two of their pieces at once?'",
      },
    ],
    takeaways: [
      'Always look for knight forks — they are the most common tactical motif',
      'A check combined with an attack on another piece is a very effective fork',
      'Centralised pieces create more forking opportunities',
    ],
  },

  {
    id: 'tactics-pins',
    title: 'Pins',
    summary: 'Freeze a piece in place by threatening something more valuable behind it.',
    category: 'tactics',
    readTime: 4,
    steps: [
      {
        text: "A pin is when an attacking piece threatens an enemy piece that is shielding a more valuable piece behind it. The pinned piece cannot (or should not) move.",
      },
      {
        text: "An absolute pin is when the shielded piece is the king. Moving the pinned piece would be illegal because it would expose the king to check.",
        fen: 'r1bqk2r/pppp1ppp/2n2n2/1B2p3/3PP3/8/PPP2PPP/RNBQK2R b KQkq - 0 5',
      },
      {
        text: "A relative pin is when the shielded piece is very valuable (like a queen) but not the king. The pinned piece CAN move but doing so loses material.",
      },
      {
        text: "How to exploit a pin: pile up attackers on the pinned piece! Since it cannot move, you can threaten to capture it with multiple pieces.",
      },
      {
        text: "How to break a pin: move the valuable piece that's being shielded, interpose a piece, or attack the pinning piece.",
      },
    ],
    takeaways: [
      'Bishops and rooks create the most powerful pins',
      'A pinned piece defends nothing effectively',
      'Always check if your own pieces are pinned before assuming they can defend',
    ],
  },

  {
    id: 'tactics-skewers',
    title: 'Skewers',
    summary: 'The reverse of a pin — attack the valuable piece first, then take what is behind.',
    category: 'tactics',
    readTime: 3,
    steps: [
      {
        text: "A skewer is like a reverse pin. You attack a valuable piece (usually the king) directly, forcing it to move — then you capture the less valuable piece behind it.",
      },
      {
        text: "Skewers with queens and rooks along files or ranks are the most common. Here, the queen skewers the king on the e-file to win the rook behind it.",
        fen: '4r3/8/8/8/4k3/8/8/4K2Q w - - 0 1',
        move: 'h1e1',
      },
      {
        text: "Bishop skewers along diagonals are trickier to see but equally effective.",
      },
      {
        text: "Key difference from a pin: in a pin, the attacker hits the less valuable piece first; in a skewer, it hits the more valuable piece first.",
      },
    ],
    takeaways: [
      'After a skewer, the valuable piece must move and the piece behind is lost',
      'Look for skewers whenever the opponent\'s king and rook (or queen) share a file, rank, or diagonal',
      'Skewers are very common in rook endgames',
    ],
  },

  // ── Endgames ───────────────────────────────────────────────────────────────

  {
    id: 'endgame-king-pawn',
    title: 'King and Pawn Endgames',
    summary: 'Master the fundamental endgame that decides countless games.',
    category: 'endgames',
    readTime: 5,
    steps: [
      {
        text: "In king and pawn endgames, the king becomes an active fighting piece. Activating your king is the single most important principle.",
      },
      {
        text: "The 'opposition': two kings are in direct opposition when they face each other with exactly one square between them. The side that does NOT have to move has the opposition — a key advantage.",
        fen: '8/8/8/3kK3/8/8/8/8 w - - 0 1',
      },
      {
        text: "With the opposition, you can push the enemy king back and escort your pawn to promotion. Without the opposition, the defending king can block the path.",
      },
      {
        text: "The 'rule of the square': if the enemy king cannot step inside the square formed by the pawn's path to promotion, the pawn promotes without the help of its king.",
        fen: '8/8/8/8/k7/8/4P3/4K3 w - - 0 1',
      },
      {
        text: "Passed pawns — pawns with no enemy pawns in front of them on adjacent files — are endgame powerhouses. Pass and promote!",
      },
    ],
    takeaways: [
      'Centralise and activate your king in the endgame',
      'The side with the opposition controls the flow of a K+P endgame',
      'A passed pawn that reaches the 6th rank is nearly always winning',
    ],
  },

  {
    id: 'endgame-rook',
    title: 'Rook Endgame Basics',
    summary: 'The most common type of endgame — and the most complex.',
    category: 'endgames',
    readTime: 5,
    steps: [
      {
        text: "Rook endgames are the most frequently reached endgames in practice. Understanding a few key ideas will save you many half-points.",
      },
      {
        text: "Rooks belong behind passed pawns — both your own (pushing them) and the enemy's (restraining them). This is the most important rook endgame principle.",
        fen: '8/8/8/3k4/p7/8/8/R3K3 w - - 0 1',
      },
      {
        text: "The Lucena position is the most important winning technique. You use the rook to 'build a bridge', shielding your king from enemy rook checks.",
      },
      {
        text: "The Philidor position is the most important drawing technique. The defending rook cuts the king off on the 6th rank, and switches to back-rank checking when the pawn advances.",
        fen: '8/8/8/3k4/8/8/6P1/R5K1 w - - 0 1',
      },
      {
        text: "Rook activity is paramount. An active rook on the 7th rank ('the pig') creates tremendous pressure, winning pawns and cutting off the king.",
      },
    ],
    takeaways: [
      'Rooks belong behind passed pawns',
      'Know the Lucena (win) and Philidor (draw) positions',
      'Active rooks dominate passive ones — avoid passivity even at the cost of a pawn',
    ],
  },

  // ── Strategy ───────────────────────────────────────────────────────────────

  {
    id: 'strategy-pawn-structure',
    title: 'Pawn Structure',
    summary: 'Pawns shape the game. Understand what makes a pawn weak or strong.',
    category: 'strategy',
    readTime: 5,
    steps: [
      {
        text: "Pawns can never move backwards. A pawn weakness lasts the entire game unless you can trade it off. Avoid creating unnecessary weaknesses.",
      },
      {
        text: "Isolated pawns have no friendly pawns on adjacent files. They cannot be defended by other pawns and become targets for the opponent's pieces.",
        fen: '8/8/8/8/3p4/8/8/8 w - - 0 1',
      },
      {
        text: "Doubled pawns are two pawns of the same colour on the same file. They cannot defend each other and often create open files for the opponent.",
      },
      {
        text: "Backward pawns are pawns that cannot be advanced without being captured by an enemy pawn. They sit on a 'hole' — a square the opponent can occupy permanently.",
      },
      {
        text: "Passed pawns are your best friends in the endgame. A pawn with no enemy pawns in front of it on adjacent files will march to promotion if not stopped.",
        fen: '8/3P4/8/8/8/8/8/8 w - - 0 1',
      },
    ],
    takeaways: [
      'Think twice before creating isolated or doubled pawns',
      'Control holes — squares that cannot be attacked by enemy pawns',
      'Passed pawns in the endgame are often worth more than material',
    ],
  },
];

export const LESSON_CATEGORIES: Record<LessonCategory, { label: string; icon: string }> = {
  basics:    { label: 'Basics',    icon: '♟' },
  tactics:   { label: 'Tactics',   icon: '⚔' },
  openings:  { label: 'Openings',  icon: '📖' },
  endgames:  { label: 'Endgames',  icon: '♔' },
  strategy:  { label: 'Strategy',  icon: '🧠' },
};
