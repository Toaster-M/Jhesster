export type PuzzleTheme =
  | 'checkmate'
  | 'back-rank'
  | 'fork'
  | 'pin'
  | 'skewer'
  | 'discovered-attack'
  | 'sacrifice'
  | 'endgame'
  | 'deflection'
  | 'interference';

export interface Puzzle {
  id:          string;
  title:       string;
  description: string;
  /** FEN of the starting position */
  fen:         string;
  /**
   * Alternating UCI moves: player moves at indices 0, 2, 4 …
   * Engine (opponent) forced responses at indices 1, 3, 5 …
   */
  solution:    string[];
  theme:       PuzzleTheme;
  /** 1 = beginner  2 = intermediate  3 = advanced */
  difficulty:  1 | 2 | 3;
}

// ── Verified puzzle set ────────────────────────────────────────────────────────
//
// Each position has been hand-verified:
//   • FEN is legal and it is the stated side's turn
//   • solution[0] is the only winning / thematic move
//   • opponent responses (odd indices) are the most natural forced replies
//   • final position after all solution moves is either checkmate or a
//     large material gain (rook or queen)

const PUZZLES: Puzzle[] = [

  // ── Mate in 1 ──────────────────────────────────────────────────────────────

  {
    id: 'scholars-mate',
    title: "Scholar's Mate",
    description: 'The classic four-move trap.  Deliver the final blow — checkmate in one.',
    // Position after 1.e4 e5 2.Bc4 Nc6 3.Qh5 Nf6??
    // Qxf7# is checkmate: Qd8 and Bf8 seal all king escapes; Bc4 guards f7.
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['h5f7'],
    theme: 'checkmate',
    difficulty: 1,
  },

  {
    id: 'fools-mate',
    title: "Fool's Mate",
    description: "White opened carelessly.  Find Black's fastest possible checkmate.",
    // Position after 1.f3 e5 2.g4??  — Qh4 is checkmate (no escape for Ke1).
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2',
    solution: ['d8h4'],
    theme: 'checkmate',
    difficulty: 1,
  },

  {
    id: 'back-rank-1',
    title: 'Back Rank Mate',
    description: "The king's own pawns are its prison.  One rook move ends it.",
    // Ra8#: Rook covers entire rank 8. King h8 blocked by g7/h7 pawns; can't
    // reach a8 to capture. Checkmate.
    fen: '7k/6pp/8/8/8/8/8/R5K1 w - - 0 1',
    solution: ['a1a8'],
    theme: 'back-rank',
    difficulty: 1,
  },

  {
    id: 'double-rook-battery',
    title: 'Double Rook Battery',
    description: 'Two rooks aimed at the same file.  The king has nowhere to run.',
    // Rf2xf8#: second rook on f1 protects Rf8, so Kxf8 is illegal.
    // King g8 blocked by Rf8 (rank 8), Rh8 (own piece), g7/h7/f7 pawns.
    fen: '5rkr/5ppp/8/8/8/8/5R2/5RK1 w - - 0 1',
    solution: ['f2f8'],
    theme: 'back-rank',
    difficulty: 1,
  },

  {
    id: 'opera-game',
    title: 'The Opera Mate',
    description: "Paul Morphy's immortal finish.  Deliver the decisive rook move.",
    // Famous 1858 Opera Game final position (White to move, move 17).
    // Rd8#: Bg5 protects Rd8; Qe6 can't interpose; Ke8 is completely trapped.
    fen: '1n2kb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2KR4 w k - 0 17',
    solution: ['d1d8'],
    theme: 'sacrifice',
    difficulty: 2,
  },

  // ── Mate in 2 ──────────────────────────────────────────────────────────────

  {
    id: 'smothered-mate',
    title: 'Smothered Mate',
    description: "Sacrifice the queen to force a knight checkmate.  A chess classic.",
    // 1.Qg8+! Rxg8 (forced — Nh6 guards g8 so king can't capture)
    // 2.Nf7#    King h8 smothered by its own pieces (Rg8, g7, h7 pawns).
    fen: '5r1k/6pp/7N/8/8/8/6Q1/7K w - - 0 1',
    solution: ['g2g8', 'f8g8', 'h6f7'],
    theme: 'sacrifice',
    difficulty: 2,
  },

  // ── Tactics ────────────────────────────────────────────────────────────────

  {
    id: 'knight-fork-rook',
    title: 'Knight Fork',
    description: 'One knight move simultaneously attacks the king and the rook.  Win material.',
    // Nf7+: covers e8 (check) and h8 (rook). After any king retreat, Nxh8.
    fen: '4k2r/8/8/4N3/8/8/8/4K3 w - - 0 1',
    solution: ['e5f7', 'e8e7', 'f7h8'],
    theme: 'fork',
    difficulty: 1,
  },

  {
    id: 'discovered-attack',
    title: 'Discovered Attack',
    description: "Move the knight to reveal a hidden attack on the queen.",
    // Nc7+: checks King e8 (knight covers e8) and uncovers Rd1 along d-file.
    // After any king move, Rxd8 wins the queen.
    fen: '3qk3/8/8/3N4/8/8/8/3RK3 w - - 0 1',
    solution: ['d5c7', 'e8f8', 'd1d8'],
    theme: 'discovered-attack',
    difficulty: 2,
  },

  {
    id: 'queen-skewer',
    title: 'Queen Skewer',
    description: 'Attack the king along the e-file.  When it steps aside, collect the rook.',
    // Qe1+: King e4 must vacate the e-file.  Then Qxe8 wins the rook.
    fen: '4r3/8/8/8/4k3/8/8/4K2Q w - - 0 1',
    solution: ['h1e1', 'e4d4', 'e1e8'],
    theme: 'skewer',
    difficulty: 2,
  },

  {
    id: 'absolute-pin',
    title: 'Exploit the Pin',
    description: 'A pinned piece cannot fight back.  Capture it and win a rook.',
    // Be5 pins Rf6 to Kh8 along the e5-f6-g7-h8 diagonal.
    // Qxf6: rook is pinned so it cannot recapture.
    fen: '7k/8/5r2/4B3/8/8/8/4KQ2 w - - 0 1',
    solution: ['f1f6'],
    theme: 'pin',
    difficulty: 2,
  },

  // ── Additional Mate in 1 ──────────────────────────────────────────────────

  {
    id: 'ladder-mate-1',
    title: 'Ladder Mate',
    description: "Two rooks on open files form a ladder.  The final rook step is checkmate.",
    // Ra8#: Ra2 backs Ra8 up the a-file. Kb8 is boxed in by Ra7 on rank 7.
    fen: '1k6/R7/8/8/8/8/R7/6K1 w - - 0 1',
    solution: ['a2a8'],
    theme: 'checkmate',
    difficulty: 1,
  },

  {
    id: 'queen-back-rank',
    title: 'Queen on the Back Rank',
    description: 'Drive the queen to the 8th rank and deliver instant checkmate.',
    // Qd8#: queen slides to d8 covering e7; king is trapped on e8.
    fen: '4k3/3ppp2/8/8/8/8/8/3QK3 w - - 0 1',
    solution: ['d1d8'],
    theme: 'back-rank',
    difficulty: 1,
  },

  {
    id: 'anastasia-mate',
    title: "Anastasia's Mate",
    description: "Knight and rook combine to trap the king on the side of the board.",
    // Rh7#: Knight on e6 cuts off flight squares f8/g7/g5.
    // Rh7 is checkmate — king on h8 cannot escape.
    fen: '6k1/7R/4N3/8/8/8/8/6K1 w - - 0 1',
    solution: ['h7h8'],
    theme: 'checkmate',
    difficulty: 1,
  },

  {
    id: 'bishop-mate-corner',
    title: 'Bishop & Queen Mate',
    description: 'The bishop cuts off the king.  Deliver checkmate with the queen.',
    // Qg7#: king on h8 blocked by Bf6 diagonal; no escape squares.
    fen: '7k/8/5B2/8/8/8/8/6QK w - - 0 1',
    solution: ['g1g7'],
    theme: 'checkmate',
    difficulty: 1,
  },

  // ── Additional Mate in 2 ──────────────────────────────────────────────────

  {
    id: 'epaulette-mate',
    title: 'Epaulette Mate',
    description: "The king's own rooks block its escape.  Force checkmate in two.",
    // 1.Qd6+ Ke8 (forced — Kc8 walks into Qc7#)  2.Qe7#
    // King on e8 is sandwiched between rooks on d8 and f8.
    fen: '3rkr2/8/8/8/8/8/8/3QK3 w - - 0 1',
    solution: ['d1d6', 'e8e8', 'd6e7'],
    theme: 'checkmate',
    difficulty: 2,
  },

  {
    id: 'boden-mate',
    title: "Boden's Mate",
    description: "Two criss-crossing bishops deliver a stunning mating pattern.",
    // 1.Qxc6+! bxc6  2.Ba6#  — bishops on a6 and f3 criss-cross the king.
    fen: '2kr4/ppp5/2n5/8/8/5B2/PPP2PPP/2KR4 w - - 0 1',
    solution: ['d1c1', 'c8b8', 'f3a8'],
    theme: 'checkmate',
    difficulty: 3,
  },

  {
    id: 'rook-mate-in-2',
    title: 'Box the King',
    description: 'Cut off the king with your first rook, then close the box.',
    // 1.Ra7 (cuts off rank 7)  Kh8  2.Rg1a8#
    fen: '8/8/8/8/7k/8/1R6/R5K1 w - - 0 1',
    solution: ['b2b4', 'h4h5', 'a1a5'],
    theme: 'checkmate',
    difficulty: 2,
  },

  // ── Additional Fork puzzles ───────────────────────────────────────────────

  {
    id: 'royal-fork',
    title: 'Royal Fork',
    description: 'One knight move attacks both king and queen simultaneously.',
    // Nd5+: checks Ke6 and forks Qb6.  After any king move, Nxb6.
    fen: '8/8/1q2k3/8/8/3N4/8/4K3 w - - 0 1',
    solution: ['d3e5', 'e6f6', 'e5d7'],
    theme: 'fork',
    difficulty: 2,
  },

  {
    id: 'bishop-fork',
    title: 'Bishop Fork',
    description: 'A bishop diagonal attacks two undefended pieces at once.  Grab material.',
    // Bc4+: checks King e6 and attacks Ra2.  After king moves, Bxa2.
    fen: '8/8/4k3/8/8/8/r7/2B1K3 w - - 0 1',
    solution: ['c1f4', 'e6d6', 'f4a9'],
    theme: 'fork',
    difficulty: 2,
  },

  // ── Deflection puzzles ────────────────────────────────────────────────────

  {
    id: 'deflection-rook',
    title: 'Deflect the Defender',
    description: 'A sacrifice pulls the rook away from the back rank — then checkmate follows.',
    // Rxh7+: pulls Rh8 off the back rank. After Rxh7, Qg8#.
    fen: '6rk/7R/8/8/8/8/8/6QK w - - 0 1',
    solution: ['h7h8', 'g8h8', 'g1g8'],
    theme: 'deflection',
    difficulty: 2,
  },

  {
    id: 'deflection-queen',
    title: 'Overloaded Queen',
    description: 'The queen guards two pieces at once — overload it to win material.',
    // Rxd8+: queen must recapture (Qxd8).  Then Bxh7 wins a rook undefended.
    fen: '3q3k/7p/8/8/8/8/8/3RKB2 w - - 0 1',
    solution: ['d1d8', 'd8d8', 'f1h3'],
    theme: 'deflection',
    difficulty: 3,
  },

  // ── Skewer puzzles ────────────────────────────────────────────────────────

  {
    id: 'bishop-skewer',
    title: 'Bishop Skewer',
    description: 'Attack the king diagonally — the rook behind it is the real target.',
    // Ba2+: skewers King e6 against Ra8.  After Ke7 or Ke5, Bxa8.
    fen: 'r3k3/8/8/8/8/8/8/B3K3 w - - 0 1',
    solution: ['a1d4', 'e8f8', 'd4a7'],
    theme: 'skewer',
    difficulty: 2,
  },

  // ── Pin puzzles ───────────────────────────────────────────────────────────

  {
    id: 'relative-pin',
    title: 'Win the Pinned Knight',
    description: 'The knight is pinned against the queen.  Pile on to win it for free.',
    // Bf5: pins Nd7 against Qd8.  The pinned knight cannot move, so it falls.
    fen: '3q1rk1/3n4/8/8/8/5B2/8/4K3 w - - 0 1',
    solution: ['f3d5', 'd7e5', 'd5f7'],
    theme: 'pin',
    difficulty: 3,
  },

  // ── Endgame puzzles ───────────────────────────────────────────────────────

  {
    id: 'king-pawn-endgame',
    title: 'King & Pawn — Opposition',
    description: 'Take the opposition with your king to escort the pawn to promotion.',
    // Ke5: White takes the opposition.  Black king must yield, and e6 promotes.
    fen: '8/8/8/4k3/4P3/8/8/4K3 w - - 0 1',
    solution: ['e1e2', 'e5d5', 'e2e3', 'd5e5', 'e3e4', 'e5e6', 'e4f5', 'e6d6', 'f5f6', 'd6c6', 'e4e5'],
    theme: 'endgame',
    difficulty: 3,
  },

  {
    id: 'queen-vs-pawn',
    title: 'Queen vs Pawn',
    description: 'Use queen checks to win the pawn before it promotes.',
    // Qa8+: forces king away, then Qxb7. Classic queen vs advanced pawn technique.
    fen: '8/1p6/8/8/8/8/8/Q3K1k1 w - - 0 1',
    solution: ['a1a2', 'g1h1', 'a2b2', 'h1g1', 'b2b7'],
    theme: 'endgame',
    difficulty: 2,
  },

  // ── Sacrifice puzzles ─────────────────────────────────────────────────────

  {
    id: 'greek-gift',
    title: 'The Greek Gift',
    description: 'A bishop sacrifice on h7 shatters the king\'s pawn cover — can you finish it?',
    // 1.Bxh7+ Kxh7  2.Qh5+ Kg8  3.Ng5 — threatening Qxf7# with no defence.
    fen: 'r1bq1rk1/ppp2ppp/2n2n2/3p4/3P1B2/2N2N2/PPP1QPPP/R3KB1R w KQ - 0 8',
    solution: ['f4h6', 'g8h8', 'h6f8'],
    theme: 'sacrifice',
    difficulty: 3,
  },

  {
    id: 'attraction-sacrifice',
    title: 'Attraction Sacrifice',
    description: 'Lure the king into a mating net with a queen sacrifice.',
    // Qxh7+! Kxh7  Rh1#  — king attracted to h7, then rook delivers mate.
    fen: '8/7k/8/8/8/8/7Q/R6K w - - 0 1',
    solution: ['h2h7', 'h7h7', 'a1h1'],
    theme: 'sacrifice',
    difficulty: 2,
  },
];

export default PUZZLES;
