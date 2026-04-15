/**
 * Opening explorer data — structured as navigable trees.
 *
 * Each OpeningNode represents a board position reached after a sequence of
 * moves.  Variations are child nodes; clicking one takes the learner deeper.
 *
 * Fields
 * ──────
 * id          — unique identifier (kebab-case)
 * name        — display name for breadcrumb / variation button
 * fen         — FEN of the position AFTER the moves that led to this node
 * lastMove    — UCI move played to reach this node (for board highlight)
 * description — explanation shown in the sidebar
 * tip         — optional key idea shown in a callout
 * variations  — child branches the learner can explore
 */

export interface OpeningNode {
  id:          string;
  name:        string;
  fen:         string;
  lastMove?:   string;
  description: string;
  tip?:        string;
  variations?: OpeningNode[];
}

export interface Opening {
  id:         string;
  title:      string;
  eco:        string;
  summary:    string;
  /** Which side is being taught — shown as a badge */
  color:      'white' | 'black';
  difficulty: 1 | 2 | 3;
  root:       OpeningNode;
}

// ── 1. Ruy López ─────────────────────────────────────────────────────────────

const RUY_LOPEZ: Opening = {
  id:         'ruy-lopez',
  title:      'Ruy López',
  eco:        'C60–C99',
  summary:    "The most deeply studied open-game opening. White immediately pressures the knight defending e5.",
  color:      'white',
  difficulty: 2,
  root: {
    id:   'rl-root',
    name: 'Ruy López — Starting Position',
    fen:  'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    lastMove: 'f1b5',
    description:
      "After 1.e4 e5 2.Nf3 Nc6 3.Bb5 — White's bishop pins the Nc6 (which defends e5) to the king. The threat is not immediate but the long-term pressure is real. Black must decide how to meet it.",
    tip: "3.Bb5 doesn't actually win e5 immediately — 3...Nxe4?! is met by 4.Qe2 and 5.Nxe4. The bishop's real job is to chip away at Black's e5 defender.",
    variations: [
      {
        id:   'rl-morphy',
        name: 'Morphy Defense — 3...a6',
        fen:  'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
        lastMove: 'a7a6',
        description:
          "3...a6 — the Morphy Defense — is the most popular reply. Black challenges the bishop immediately: 'tell me your intentions'. White must decide between retreating (4.Ba4) or trading (4.Bxc6).",
        tip: "This is the most important variation in all of chess theory. GM preparation at the top level goes 20–30 moves deep in some lines.",
        variations: [
          {
            id:   'rl-morphy-ba4',
            name: '4.Ba4 — Main Line',
            fen:  'r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 4',
            lastMove: 'b5a4',
            description:
              "4.Ba4 retreats the bishop and keeps the pressure on c6. Black typically continues 4...Nf6, developing naturally and attacking the undefended e4 pawn. After 5.O-O the position branches sharply.",
            variations: [
              {
                id:   'rl-open',
                name: 'Open Ruy — 5...Nxe4',
                fen:  'r1bqkb1r/1ppp1ppp/p1n5/4p3/B3n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 6',
                lastMove: 'f6e4',
                description:
                  "After 5.O-O Nxe4! — the Open Ruy López. Black grabs the e4 pawn. White must play accurately: 6.d4 opens the centre and regains the pawn with good compensation. Play becomes very tactical.",
                tip: "Despite grabbing a pawn, Black must be careful. The line 6.d4 exd4 7.Re1 d5 8.Nxd4 Bc5 9.Be3 leads to rich complications White is well prepared for.",
              },
              {
                id:   'rl-closed',
                name: 'Closed Ruy — 5...Be7',
                fen:  'r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 4 6',
                lastMove: 'f8e7',
                description:
                  "5...Be7 enters the Closed Ruy — the most popular variation. Black consolidates and prepares O-O. White typically plays 6.Re1 d6 7.Bxc6+ dxc6 or continues building with c3/d4. The position is strategically rich with plans for both sides.",
                tip: "White's plan: c3 then d4 to challenge the centre. Black's plan: ...d6, ...O-O, ...b5, ...Bb7, and a kingside attack with ...Nd7–f8–g6.",
              },
            ],
          },
          {
            id:   'rl-exchange',
            name: '4.Bxc6 — Exchange Variation',
            fen:  'r1bqkbnr/1pp2ppp/p1p5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
            lastMove: 'c6c6',
            description:
              "4.Bxc6 dxc6 — White trades the bishop for the knight, giving Black doubled pawns. Black gets the bishop pair and a semi-open d-file. A strategic battle of bishop pair vs. pawn structure often follows.",
            tip: "The Exchange Ruy is Bobby Fischer's favourite weapon for White. It leads to positions that are easier to play for beginners — no long theory, just exploit the doubled pawns.",
          },
        ],
      },
      {
        id:   'rl-berlin',
        name: 'Berlin Defense — 3...Nf6',
        fen:  'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        lastMove: 'g8f6',
        description:
          "3...Nf6 — the Berlin Defense — develops a piece and attacks e4 directly. It became ultra-popular after Vladimir Kramnik used it to neutralise Garry Kasparov in the 2000 World Championship.",
        tip: "The Berlin is famous for its solidity. After 4.O-O Nxe4 5.d4 Nd6 6.Bxc6 dxc6 7.dxe5 Nf5, queens are exchanged early and a technical ending begins.",
        variations: [
          {
            id:   'rl-berlin-endgame',
            name: 'Berlin Endgame — 4.O-O Nxe4 5.d4',
            fen:  'r1bqkb1r/pppp1ppp/2n5/1B2p3/3Pn3/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 5',
            lastMove: 'd2d4',
            description:
              "After 4.O-O Nxe4 5.d4 — White opens the centre immediately. 5...Nd6 6.Bxc6 dxc6 7.dxe5 Nf5 8.Qxd8+ Kxd8 leads to the famous Berlin Endgame where White has the bishop pair and active pieces but Black's fortress is very hard to break.",
            tip: "The Berlin Endgame is objectively near-equal but psychologically tough to play for the side trying to win (usually White). Perfect for Black players who are happy to draw against stronger opponents.",
          },
          {
            id:   'rl-berlin-keep',
            name: 'Keeping Tension — 4.d3',
            fen:  'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 4',
            lastMove: 'd2d3',
            description:
              "4.d3 avoids the Berlin Endgame entirely. White keeps the centre closed and plans to develop normally with Nc3, O-O, and then push d4 at a better moment. A solid alternative that keeps the queens on.",
          },
        ],
      },
      {
        id:   'rl-classical',
        name: 'Classical — 3...Bc5',
        fen:  'r1bqk1nr/pppp1ppp/2n5/1Bb1p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        lastMove: 'f8c5',
        description:
          "3...Bc5 — the Classical Defense. Black ignores the pin and develops the bishop to its most active square. This is principled play: if the bishop on b5 doesn't actually win material, why worry about it?",
        tip: "After 4.c3, if Black plays 4...Bb6, the bishop retreats to b6 where it is safe but less active. Many players prefer 4...Nf6 to keep the tension.",
      },
    ],
  },
};

// ── 2. Italian Game ───────────────────────────────────────────────────────────

const ITALIAN_GAME: Opening = {
  id:         'italian-game',
  title:      'Italian Game',
  eco:        'C50–C59',
  summary:    "One of the oldest openings. White develops the bishop to c4 targeting the f7 pawn — ideal for beginners.",
  color:      'white',
  difficulty: 1,
  root: {
    id:   'it-root',
    name: 'Italian Game — Starting Position',
    fen:  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    lastMove: 'f1c4',
    description:
      "After 1.e4 e5 2.Nf3 Nc6 3.Bc4 — the Italian Game. White's bishop targets f7, the weakest point in Black's position, while staying safely on the a2–g8 diagonal. This is an excellent opening for beginners: natural, principled, and instructive.",
    tip: "The f7 pawn is only defended by the king. A bishop on c4 and a queen on h5 (the Scholar's Mate) can threaten it immediately. Even experienced players must be careful here.",
    variations: [
      {
        id:   'it-giuoco-piano',
        name: 'Giuoco Piano — 3...Bc5',
        fen:  'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        lastMove: 'f8c5',
        description:
          "3...Bc5 — the Giuoco Piano ('Quiet Game'). Both sides develop their bishops to mirror positions on the a3–f8 and a2–g8 diagonals. A classical battle of equal, principled development.",
        tip: "Giuoco Piano means 'quiet game' in Italian, but modern interpretations with c3/d4 lead to sharp, dynamic positions.",
        variations: [
          {
            id:   'it-main-line',
            name: 'Main Line — 4.c3 Nf6 5.d4',
            fen:  'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq - 0 5',
            lastMove: 'd2d4',
            description:
              "4.c3 prepares d4, claiming the centre. After 4...Nf6 5.d4, both sides fight for the centre. 5...exd4 6.cxd4 Bb4+ 7.Bd2 Bxd2+ leads to an equal endgame, while 5...Bb4+ 6.Bd2 keeps the tension.",
            tip: "White's plan is clear: strong centre with c3+d4. Black must immediately challenge this with ...exd4 or risk being squeezed.",
          },
          {
            id:   'it-evans',
            name: 'Evans Gambit — 4.b4',
            fen:  'r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq - 0 4',
            lastMove: 'b2b4',
            description:
              "4.b4!? — the Evans Gambit. White sacrifices a pawn to gain rapid development and open lines. After 4...Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O, White has a powerful attacking position with full development.",
            tip: "Kasparov played the Evans Gambit to great effect in the 1990s. It's an excellent surprise weapon — most Black players are unprepared for the rapid White development.",
          },
          {
            id:   'it-giuoco-pianissimo',
            name: 'Giuoco Pianissimo — 4.d3',
            fen:  'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 4',
            lastMove: 'd2d3',
            description:
              "4.d3 — the Giuoco Pianissimo ('Very Quiet Game'). White avoids the immediate d4 pawn thrust and instead builds slowly. Plans include Nc3, O-O, a3, Ba2, and eventually d4 at the right moment. Very popular at the top level today.",
            tip: "Engines and modern GMs prefer 4.d3 in many positions. The slow buildup avoids the well-studied 4.c3 lines and leads to unbalanced middlegames.",
          },
        ],
      },
      {
        id:   'it-two-knights',
        name: 'Two Knights Defense — 3...Nf6',
        fen:  'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        lastMove: 'g8f6',
        description:
          "3...Nf6 — the Two Knights Defense. Black attacks the e4 pawn immediately rather than developing the dark-squared bishop. This is more aggressive and leads to sharper play than the Giuoco Piano.",
        tip: "4.Ng5 is White's most dangerous try — threatening Nxf7 (the 'Fried Liver' idea). Black's best reply is 4...d5 5.exd5 Na5, attacking the bishop while exposing the Ng5.",
        variations: [
          {
            id:   'it-fried-liver',
            name: 'Fried Liver Attack — 4.Ng5 d5 5.exd5',
            fen:  'r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 5',
            lastMove: 'e4d5',
            description:
              "4.Ng5 d5 5.exd5 — the Fried Liver setup. After 5...Na5 6.Bb5+ c6 7.dxc6 bxc6 8.Be2 h6 9.Nf3 e4, Black has the centre but White has material. If instead 5...Nxd5?! 6.Nxf7! is the Fried Liver Attack — a knight sacrifice for devastating attack.",
            tip: "The Fried Liver Attack (6.Nxf7! Kxf7) is not objectively winning with perfect play, but it's extremely difficult to defend over the board. A great weapon for aggressive players.",
          },
          {
            id:   'it-pianissimo-two',
            name: 'Quiet Line — 4.d3',
            fen:  'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 4',
            lastMove: 'd2d3',
            description:
              "4.d3 avoids all the sharp Two Knights theory. White builds solidly, planning c3, Nbd2, O-O. This modern approach keeps the position balanced and avoids the razor-sharp Fried Liver lines.",
          },
        ],
      },
    ],
  },
};

// ── 3. Sicilian Defense ───────────────────────────────────────────────────────

const SICILIAN_DEFENSE: Opening = {
  id:         'sicilian-defense',
  title:      'Sicilian Defense',
  eco:        'B20–B99',
  summary:    "The most popular chess opening at all levels. Black fights for the centre asymmetrically, creating rich imbalances.",
  color:      'black',
  difficulty: 2,
  root: {
    id:   'sic-root',
    name: 'Sicilian Defense — 1...c5',
    fen:  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    lastMove: 'c7c5',
    description:
      "1...c5 — the Sicilian Defense. Black fights for the d4 square with a flank pawn, avoiding a symmetrical position. White has a slight space advantage; Black has the c-file half-open. This asymmetry creates unbalanced positions where both sides have winning chances.",
    tip: "The Sicilian is the most combative reply to 1.e4. It scores better for Black than any other response at the grandmaster level.",
    variations: [
      {
        id:   'sic-open',
        name: 'Open Sicilian — 2.Nf3 (White enters the main lines)',
        fen:  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
        lastMove: 'g1f3',
        description:
          "2.Nf3 followed by 3.d4 — the Open Sicilian. White opens the centre and the game becomes highly tactical. Black has many systems to choose from: Najdorf, Dragon, Scheveningen, Classical, and more.",
        tip: "White's 'normal' plan: castle kingside, double rooks on d1 and e1, push f4–f5. Black's plan varies by system but often involves queenside counterplay with ...a5 or ...b5.",
        variations: [
          {
            id:   'sic-najdorf',
            name: 'Najdorf Variation — 2...d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6',
            fen:  'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
            lastMove: 'a7a6',
            description:
              "The Najdorf — named after Miguel Najdorf, popularised by Bobby Fischer and used by Garry Kasparov throughout his career. 5...a6 prepares ...e5 or ...b5 without allowing Nb5. The most played variation in chess at the highest level.",
            tip: "White's most critical tries: 6.Bg5 (English Attack), 6.Be3 (Classical), 6.Bc4 (Fischer's favourite), 6.f4 (aggressive). Black must know all of them.",
            variations: [
              {
                id:   'sic-najdorf-english',
                name: 'English Attack — 6.Be3 f5 or 6.f3',
                fen:  'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6',
                lastMove: 'c1e3',
                description:
                  "6.Be3 — the English Attack. White prepares f3, g4, h4–h5 — a direct kingside pawn storm. Black can counter with 6...e5 7.Nb3 Be6 or 6...e6 entering Scheveningen waters. Very sharp and direct.",
              },
              {
                id:   'sic-najdorf-bg5',
                name: 'Poisoned Pawn — 6.Bg5 e6 7.f4',
                fen:  'rnbqkb1r/1p3ppp/p2ppn2/6B1/3NPP2/2N5/PPP3PP/R2QKB1R b KQkq f3 0 7',
                lastMove: 'f2f4',
                description:
                  "6.Bg5 e6 7.f4 — classical development with attacking intent. White threatens f5, and after 7...Be7 8.Qf3, the Poisoned Pawn Variation arises with 8...Qb6!? — grabbing the b2 pawn at the cost of development. One of the most heavily analysed lines in chess.",
              },
            ],
          },
          {
            id:   'sic-dragon',
            name: 'Dragon Variation — 5...g6',
            fen:  'rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
            lastMove: 'g7g6',
            description:
              "5...g6 — the Dragon. Black fianchettoes the bishop to g7 where it becomes a fearsome 'Dragon Bishop' on the long diagonal. White's main weapon is the Yugoslav Attack (6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.O-O-O) with mutual king-hunting.",
            tip: "In the Yugoslav Attack, both sides attack each other's kings at maximum speed. The Dragon is not for the faint-hearted — whoever hesitates loses.",
            variations: [
              {
                id:   'sic-dragon-yugoslav',
                name: 'Yugoslav Attack — 6.Be3 Bg7 7.f3',
                fen:  'rnbqk2r/pp2ppbp/3p1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R b KQkq - 0 7',
                lastMove: 'f2f3',
                description:
                  "6.Be3 Bg7 7.f3 — the Yugoslav Attack. White prepares O-O-O (queenside castling) and a pawn storm with g4–g5–h4–h5. Black storms White's queenside with ...a5–a4–Rxc3, ...b5–b4. A fascinating race.",
              },
              {
                id:   'sic-dragon-classical',
                name: 'Classical Dragon — 6.Be2 Bg7 7.O-O',
                fen:  'rnbqk2r/pp2ppbp/3p1np1/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq - 2 7',
                lastMove: 'e1g1',
                description:
                  "6.Be2 — the Classical System. White develops calmly and castles kingside, leading to a positional struggle. Less sharp than the Yugoslav Attack; both sides manoeuvre for advantage in the middlegame.",
              },
            ],
          },
          {
            id:   'sic-scheveningen',
            name: 'Scheveningen — 5...e6',
            fen:  'rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
            lastMove: 'e7e6',
            description:
              "5...e6 — the Scheveningen. Black creates a small centre (d6+e6) and plays for counterplay on the queenside and centre. Very solid; favoured by Garry Kasparov in the 1980s. White can try the Keres Attack (6.g4!?) or the English Attack.",
            tip: "The Scheveningen pawn structure (d6+e6) is also reached from the Najdorf (5...a6 then ...e6). Understanding this structure is central to the Sicilian.",
          },
        ],
      },
      {
        id:   'sic-alapin',
        name: 'Alapin Variation — 2.c3',
        fen:  'rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 2',
        lastMove: 'c2c3',
        description:
          "2.c3 — the Alapin Variation. White prepares d4 without allowing cxd4. The pawn on c3 supports the centre but blocks the Nb1. Black's best replies are 2...Nf6 (attacking e4 immediately) or 2...d5 (challenging the centre directly).",
        tip: "The Alapin is a great way for White to avoid complex Sicilian theory. It leads to solid, positional play rather than the sharp open Sicilian battles.",
        variations: [
          {
            id:   'sic-alapin-nf6',
            name: '2...Nf6 — Aggressive Response',
            fen:  'rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3',
            lastMove: 'g8f6',
            description:
              "2...Nf6 attacks e4 at once. After 3.e5 Nd5 4.d4 cxd4 5.Nf3, White gets a strong centre but Black has active piece play. This leads to sharp, tactical positions.",
          },
          {
            id:   'sic-alapin-d5',
            name: '2...d5 — Central Strike',
            fen:  'rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3',
            lastMove: 'd7d5',
            description:
              "2...d5 — the most principled reply. Black immediately strikes the White centre. After 3.exd5 Qxd5 4.d4 Nf6 5.Nf3, the position is symmetrical and Black has the bishop pair after ...Nc6 forces Bd3.",
          },
        ],
      },
      {
        id:   'sic-kan',
        name: 'Kan / Taimanov — 2...e6',
        fen:  'rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
        lastMove: 'e7e6',
        description:
          "2...e6 — the Kan or Taimanov Sicilian. Black keeps the position flexible: the d5 square is not committed yet. After 3.d4 cxd4 4.Nxd4, Black can play 4...a6 (Kan) or 4...Nc6 (Taimanov). Both lead to solid, manoeuvring play.",
        tip: "The Kan with ...a6 is closely related to the Najdorf — the difference is the move order and which pawn captures on d4.",
      },
    ],
  },
};

// ── 4. Queen's Gambit ─────────────────────────────────────────────────────────

const QUEENS_GAMBIT: Opening = {
  id:         'queens-gambit',
  title:      "Queen's Gambit",
  eco:        'D06–D69',
  summary:    "The cornerstone of d4 play. White offers a pawn to control the centre — a classical, strategically rich opening.",
  color:      'white',
  difficulty: 2,
  root: {
    id:   'qg-root',
    name: "Queen's Gambit — Starting Position",
    fen:  'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
    lastMove: 'c2c4',
    description:
      "After 1.d4 d5 2.c4 — the Queen's Gambit. White offers the c4 pawn to divert Black's d5 pawn from the centre. If Black captures with 2...dxc4, White regains the pawn easily with 3.e3 or 3.Nf3. The real fight is about who controls d4 and e5.",
    tip: "Unlike the King's Gambit, 2.c4 is NOT a true gambit — White can always regain the pawn. The 'gambit' is somewhat misleading in name.",
    variations: [
      {
        id:   'qg-declined',
        name: "Queen's Gambit Declined — 2...e6",
        fen:  'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
        lastMove: 'e7e6',
        description:
          "2...e6 — the Queen's Gambit Declined (QGD). Black refuses the gambit and solidly defends d5. The Bc8 is temporarily blocked but the position is sound. White's main plan: Nc3, Nf3, Bg5, e3 — the Classical System.",
        tip: "The QGD was the top-level choice for decades. Black accepts a slightly passive position but has no real weaknesses and excellent long-term drawing chances.",
        variations: [
          {
            id:   'qg-classical',
            name: 'Classical QGD — 3.Nc3 Nf6 4.Bg5',
            fen:  'rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4',
            lastMove: 'c1g5',
            description:
              "4.Bg5 pins the Nf6, which defends d5. After 4...Be7 5.e3 O-O 6.Nf3 Nbd7, White has a slight initiative. The key tension: White wants to push e4; Black aims for ...c5 or ...Ne4 to break the pin.",
            tip: "The famous 'Cambridge Springs' trap: after 4.Bg5 Nbd7 5.e3 c6 6.Nf3, Black can play 6...Qa5! — pinning the Nc3 and threatening ...Ne4.",
          },
          {
            id:   'qg-tarrasch',
            name: 'Tarrasch Defense — 3.Nc3 c5',
            fen:  'rnbqkbnr/pp3ppp/4p3/2pp4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4',
            lastMove: 'c7c5',
            description:
              "3...c5 — the Tarrasch Defense. Black immediately counters in the centre, accepting an isolated d-pawn after 4.cxd5 exd5 5.Nf3 Nc6 6.g3. The isolated pawn gives Black active piece play but a potential endgame weakness.",
            tip: "Spassky and Kasparov played the Tarrasch. The isolated queen's pawn position is ideal for dynamic, attacking play.",
          },
        ],
      },
      {
        id:   'qg-accepted',
        name: "Queen's Gambit Accepted — 2...dxc4",
        fen:  'rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
        lastMove: 'd5c4',
        description:
          "2...dxc4 — the Queen's Gambit Accepted (QGA). Black takes the pawn and gives up the centre temporarily. White regains the pawn quickly with e3 or Nf3+e3, and gets a nice d4 centre. Black gets active piece play and good counterplay with ...c5.",
        tip: "The QGA was used by Alireza Firouzja to beat Magnus Carlsen. Black's strategy: take the pawn, play ...e6 and ...c5 to undermine White's centre, then fight for d5.",
        variations: [
          {
            id:   'qga-main',
            name: 'Main Line — 3.Nf3 Nf6 4.e3',
            fen:  'rnbqkb1r/ppp1pppp/5n2/8/2pP4/4PN2/PP3PPP/RNBQKB1R b KQkq - 0 4',
            lastMove: 'e2e3',
            description:
              "3.Nf3 Nf6 4.e3 — the standard continuation. White prepares Bxc4 to reclaim the pawn. After 4...e6 5.Bxc4 c5 6.O-O a6 7.Qe2 b5 8.Bb3, Black has active queenside play.",
          },
          {
            id:   'qga-catalan',
            name: 'Catalan-like — 3.Nf3 Nf6 4.g3',
            fen:  'rnbqkb1r/ppp1pppp/5n2/8/2pP4/5NP1/PP2PP1P/RNBQKB1R b KQkq - 0 4',
            lastMove: 'g2g3',
            description:
              "4.g3 — a Catalan-style approach. White plans to fianchetto the bishop to g2 where it exerts long-term pressure on the c6–b7 area. After 4...e6 5.Bg2, Black must be careful about the bishop's activity.",
          },
        ],
      },
      {
        id:   'qg-slav',
        name: 'Slav Defense — 2...c6',
        fen:  'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
        lastMove: 'c7c6',
        description:
          "2...c6 — the Slav Defense. Black defends d5 with a pawn while keeping the c8 bishop's diagonal open (unlike the QGD where 2...e6 blocks it). A very solid and principled defense.",
        tip: "The Slav is one of Black's most solid responses to the Queen's Gambit. The bishop on c8 can later develop to f5 or g4 without being blocked by e6.",
        variations: [
          {
            id:   'qg-slav-main',
            name: 'Main Line — 3.Nf3 Nf6 4.Nc3',
            fen:  'rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4',
            lastMove: 'b1c3',
            description:
              "4.Nc3 — both sides develop naturally. After 4...dxc4 5.a4 Bf5 6.e3 e6, Black keeps the extra pawn while developing the light-squared bishop (the Slav's biggest advantage over the QGD). White aims to recover the c4 pawn.",
          },
          {
            id:   'qg-semi-slav',
            name: 'Semi-Slav — 4...e6',
            fen:  'rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5',
            lastMove: 'e7e6',
            description:
              "4...e6 — the Semi-Slav, combining features of both the Slav and the QGD. This is one of the most theoretically complex openings in chess. Key systems: Meran (5.e3 Nbd7 6.Bd3 dxc4 7.Bxc4 b5), Anti-Meran (5.Bg5), and the Botvinnik Variation (5.Bg5 dxc4 6.e4).",
          },
        ],
      },
    ],
  },
};

// ── 5. French Defense ─────────────────────────────────────────────────────────

const FRENCH_DEFENSE: Opening = {
  id:         'french-defense',
  title:      'French Defense',
  eco:        'C00–C19',
  summary:    "A solid, fighting defense. Black accepts a slightly cramped position in exchange for a very solid pawn structure.",
  color:      'black',
  difficulty: 2,
  root: {
    id:   'fr-root',
    name: 'French Defense — Starting Position',
    fen:  'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    lastMove: 'd7d5',
    description:
      "After 1.e4 e6 2.d4 d5 — the French Defense. Black challenges White's centre on move 2. The resulting positions are highly strategic: Black has a solid pawn chain but the c8 bishop is often hemmed in by the e6 pawn. The fight centres on who can mobilise their pawns and pieces better.",
    tip: "The French leads to closed, manoeuvring positions. It suits players who prefer strategy over tactics and are comfortable with slightly passive but very solid positions.",
    variations: [
      {
        id:   'fr-advance',
        name: 'Advance Variation — 3.e5',
        fen:  'rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
        lastMove: 'e4e5',
        description:
          "3.e5 — the Advance Variation. White closes the centre immediately and claims space. Black's plan is to undermine the e5 pawn with ...c5–c4 and attack with ...Nc6, ...Qb6, and ...Nh6–f5. The positions are closed and strategically rich.",
        tip: "White's pawn on e5 is a strength (space) and a weakness (it can become a target). Black must strike it with ...c5 immediately — otherwise White consolidates and the space advantage becomes crushing.",
        variations: [
          {
            id:   'fr-advance-main',
            name: 'Main Line — 3...c5 4.c3 Nc6',
            fen:  'r1bqkbnr/pp3ppp/2n1p3/2ppP3/3P4/2P5/PP3PPP/RNBQKBNR w KQkq - 1 5',
            lastMove: 'b8c6',
            description:
              "3...c5 4.c3 Nc6 — both sides build their pawn chains. White: d4+e5+c3 (the Milner-Barry setup). Black: ...c5+d5+e6. After 5.Nf3 Qb6 6.Bd3 cxd4 7.cxd4 Bd7, the tension resolves in a positional battle.",
          },
          {
            id:   'fr-advance-milner',
            name: 'Milner-Barry Gambit — 3...c5 4.c3 Nc6 5.Nf3 Qb6 6.Bd3',
            fen:  'r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/2PB1N2/PP3PPP/RNBQK2R b KQkq - 3 6',
            lastMove: 'f1d3',
            description:
              "6.Bd3 — the Milner-Barry Gambit. White ignores the attack on d4, offering a pawn for rapid development. After 6...cxd4 7.cxd4 Nxd4?! 8.Nxd4 Qxd4 9.Nb1c3!, White has enormous compensation with the bishop pair and a lead in development.",
          },
        ],
      },
      {
        id:   'fr-classical',
        name: 'Classical Variation — 3.Nc3',
        fen:  'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3',
        lastMove: 'b1c3',
        description:
          "3.Nc3 — the Classical Variation. White develops naturally and maintains tension in the centre. Black must decide: 3...Nf6 (Classical), 3...Bb4 (Winawer), or 3...dxe4 (Rubinstein). Each leads to very different positions.",
        variations: [
          {
            id:   'fr-classical-nf6',
            name: 'Classical French — 3...Nf6 4.e5',
            fen:  'rnbqkb1r/ppp2ppp/4pn2/3pP3/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4',
            lastMove: 'g8f6',
            description:
              "3...Nf6 — Black develops and challenges e4. After 4.e5 Nfd7 5.f4, White builds the Advance pawn chain with Nc3 already developed. Black aims for ...c5, ...Nc6, ...Qb6 — the standard French counterattack.",
            tip: "The Classical French after 4.e5 Nfd7 transposes into Advance-like structures, but with the knight already developed on c3. This means Black's ...Nc6-Nb4 ideas are less effective.",
          },
          {
            id:   'fr-winawer',
            name: 'Winawer Variation — 3...Bb4',
            fen:  'rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4',
            lastMove: 'f8b4',
            description:
              "3...Bb4 — the Winawer Variation, the sharpest French system. Black pins the Nc3 and creates immediate imbalances. After 4.e5 c5 5.a3 Bxc3+ 6.bxc3, White has doubled pawns but the bishop pair and a powerful pawn centre.",
            tip: "The Winawer leads to some of the most complex and double-edged positions in chess. White often attacks kingside while Black counterattacks queenside. Not for the positionally inclined!",
          },
        ],
      },
      {
        id:   'fr-tarrasch',
        name: 'Tarrasch Variation — 3.Nd2',
        fen:  'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPPN1PPP/R1BQKBNR b KQkq - 1 3',
        lastMove: 'b1d2',
        description:
          "3.Nd2 — the Tarrasch Variation. White avoids the pin ...Bb4 and keeps the position solid. The Nd2 is more passive than Nc3 but doesn't allow the Winawer. After 3...c5 4.exd5 exd5, a symmetrical position arises where White tries to exploit the isolated d-pawn.",
        tip: "3.Nd2 is the recommended variation for players who want to avoid the wild Winawer. It's less ambitious but solid and reliable.",
        variations: [
          {
            id:   'fr-tarrasch-c5',
            name: 'Open Tarrasch — 3...c5 4.exd5 exd5',
            fen:  'rnbqkbnr/pp3ppp/8/2pp4/3P4/8/PPPN1PPP/R1BQKBNR w KQkq - 0 5',
            lastMove: 'e6d5',
            description:
              "After 4.exd5 exd5, a symmetrical isolated queen's pawn position arises. White has a slight edge due to better development (Nd2 is developed, c8 bishop is free) but Black has active piece play. After 5.Ngf3 Nc6 6.Bb5 Bd6, the game is balanced.",
          },
        ],
      },
      {
        id:   'fr-exchange',
        name: 'Exchange Variation — 3.exd5',
        fen:  'rnbqkbnr/ppp2ppp/4p3/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
        lastMove: 'e4d5',
        description:
          "3.exd5 exd5 — the Exchange Variation. White simplifies the centre immediately and the position becomes symmetrical. This takes the sting out of the French but also releases Black's problem piece (the c8 bishop). Games often head toward a draw.",
        tip: "White players who just want a solid position or need a quick draw use the Exchange Variation. Black players fighting for a win need to create their own imbalances, usually with ...c5.",
      },
    ],
  },
};

// ── 6. Caro-Kann Defense ──────────────────────────────────────────────────────

const CARO_KANN: Opening = {
  id:         'caro-kann',
  title:      'Caro-Kann Defense',
  eco:        'B10–B19',
  summary:    "A solid, classical defense to 1.e4. Black fights for d5 with a pawn, keeping the light-squared bishop free.",
  color:      'black',
  difficulty: 2,
  root: {
    id:   'ck-root',
    name: 'Caro-Kann Defense — Starting Position',
    fen:  'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    lastMove: 'd7d5',
    description:
      "After 1.e4 c6 2.d4 d5 — the Caro-Kann Defense. Black fights for d5 with a pawn while keeping the light-squared bishop's diagonal open (unlike the French where 1...e6 blocks it). Solid, sound, and popular at all levels.",
    tip: "The Caro-Kann was a favourite of Anatoly Karpov and Tigran Petrosian — champions known for their solidity. It leads to clear, structured play without the wild complications of the Sicilian.",
    variations: [
      {
        id:   'ck-advance',
        name: 'Advance Variation — 3.e5',
        fen:  'rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
        lastMove: 'e4e5',
        description:
          "3.e5 — the Advance Variation. White claims space and Black must immediately react. Unlike the French Advance, Black's light-squared bishop can come to f5 or g4 without being blocked. The key move is 3...Bf5 developing actively.",
        tip: "3...Bf5 is Black's most active response. The bishop develops naturally and targets the h7 pawn or d3 square. Compare to the French where the c8 bishop is problematic.",
        variations: [
          {
            id:   'ck-advance-bf5',
            name: 'Main Line — 3...Bf5 4.Nf3 e6',
            fen:  'rnbqkbnr/pp3ppp/2p1p3/3pPb2/3P4/5N2/PPP2PPP/RNBQKB1R w KQkq - 1 5',
            lastMove: 'e7e6',
            description:
              "3...Bf5 4.Nf3 e6 — Black develops normally. After 5.Be2 Nd7 6.O-O Ne7, Black completes development and prepares ...c5. White's space advantage is real but Black has no weaknesses.",
          },
          {
            id:   'ck-advance-short',
            name: 'Short Variation — 3...Bf5 4.Nc3',
            fen:  'rnbqkbnr/pp2pppp/2p5/3pPb2/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 4',
            lastMove: 'b1c3',
            description:
              "4.Nc3 — the Short Variation. After 4...e6 5.g4 Bg6 6.Nge2, White attacks the bishop and claims kingside space. The game becomes double-edged with White attacking kingside and Black counterattacking in the centre.",
          },
        ],
      },
      {
        id:   'ck-classical',
        name: 'Classical Variation — 3.Nc3 dxe4 4.Nxe4',
        fen:  'rnbqkbnr/pp2pppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR b KQkq - 0 4',
        lastMove: 'c3e4',
        description:
          "3.Nc3 dxe4 4.Nxe4 — the Classical Variation. Black releases the central tension early. Now 4...Bf5 5.Ng3 Bg6 leads to the Classical Main Line, while 4...Nd7 5.Bc4 Ngf6 6.Ng5 leads to the Karpov Variation.",
        tip: "The Classical Caro-Kann gives Black a very harmonious development. The c6 pawn will go to c5 later, fighting for the centre with a solid foundation.",
        variations: [
          {
            id:   'ck-classical-main',
            name: 'Classical Main Line — 4...Bf5 5.Ng3 Bg6',
            fen:  'rnbqkbnr/pp2pppp/2p3b1/8/3P4/6N1/PPP2PPP/R1BQKBNR w KQkq - 2 6',
            lastMove: 'f5g6',
            description:
              "4...Bf5 5.Ng3 Bg6 — the bishop retreats to g6 where it is safe and useful. After 6.h4 h6 7.Nf3 Nd7 8.h5 Bh7, White has pushed the bishop back but spent time doing it. Black develops harmoniously and prepares ...e6, ...Ngf6, ...Bd6.",
          },
          {
            id:   'ck-karpov',
            name: 'Karpov Variation — 4...Nd7',
            fen:  'r1bqkbnr/pp1npppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5',
            lastMove: 'b8d7',
            description:
              "4...Nd7 — the Karpov Variation, Anatoly Karpov's favourite. Black avoids trading the bishop for a knight and prepares a more flexible development. After 5.Bc4 Ngf6 6.Ng5 e6 7.Qe2, White threatens Nxf7 — Black must be careful.",
          },
        ],
      },
      {
        id:   'ck-exchange',
        name: 'Exchange Variation — 3.exd5 cxd5',
        fen:  'rnbqkbnr/pp2pppp/8/3p4/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4',
        lastMove: 'c6d5',
        description:
          "3.exd5 cxd5 — the Exchange Variation. A symmetrical pawn structure arises. White has little advantage but Black has no weakness either. Popular as a drawing weapon. After 4.Nf3 Nf6 5.Bd3, standard development occurs.",
        tip: "The Exchange Caro-Kann leads to symmetrical positions that are theoretically equal. Black should equalise easily with good development.",
      },
    ],
  },
};

// ── 7. King's Indian Defense ──────────────────────────────────────────────────

const KINGS_INDIAN: Opening = {
  id:         'kings-indian',
  title:      "King's Indian Defense",
  eco:        'E61–E99',
  summary:    "A hypermodern defense. Black allows White to build a big centre, then attacks it from the flanks.",
  color:      'black',
  difficulty: 3,
  root: {
    id:   'ki-root',
    name: "King's Indian Defense — Starting Position",
    fen:  'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5',
    lastMove: 'f8g7',
    description:
      "After 1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 — the King's Indian Defense. Black has ceded the centre to White (d4+e4+c4) but the fianchettoed bishop on g7 powerfully targets the centre from afar. The battle: White pushes in the centre; Black counterattacks on the flanks.",
    tip: "The King's Indian is the favourite opening of Bobby Fischer, Garry Kasparov, and many dynamic players. It leads to razor-sharp positions where both sides attack on opposite wings.",
    variations: [
      {
        id:   'ki-classical',
        name: "Classical Variation — 5.Nf3 O-O 6.Be2",
        fen:  'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ - 3 6',
        lastMove: 'f1e2',
        description:
          "5.Nf3 O-O 6.Be2 — the Classical Variation, the most solid White system. After 6...e5 7.O-O Nc6 8.d5 Ne7, the Classical King's Indian begins. White plays on the queenside (b4–b5–c6); Black attacks kingside (f5–f4–g4). Both attacks must race to succeed.",
        tip: "The King's Indian Classical is strategically defined: White plays c5, b4, and tries to advance a queenside majority. Black plays ...f5–f4 and a direct kingside attack. The player who understands their plan better wins.",
        variations: [
          {
            id:   'ki-classical-main',
            name: 'Main Line — 6...e5 7.O-O Nc6 8.d5',
            fen:  'r1bq1rk1/ppp2pbp/2np1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQ1RK1 b - - 0 8',
            lastMove: 'd4d5',
            description:
              "8.d5 — White closes the centre and secures the d4 square. Ne7 retreats (blocking the fianchettoed bishop temporarily), then Black plays ...Ne8–f6 (or ...Nh5 immediately) for kingside play. White: c5, b4, Na4–c5–b7. The race is on.",
          },
          {
            id:   'ki-petrosian',
            name: "Petrosian System — 7.d5",
            fen:  'rnbq1rk1/ppp2pbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQK2R b KQ - 0 7',
            lastMove: 'd4d5',
            description:
              "7.d5 immediately — the Petrosian System. White closes the centre early, avoiding ...exd4 and the complications. Black must play ...a5 to stop b4, then fight for the c5 outpost with ...Na6–c5 or ...Nfd7–c5. A positional battle.",
          },
        ],
      },
      {
        id:   'ki-samisch',
        name: 'Sämisch Variation — 5.f3',
        fen:  'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR b KQkq - 0 5',
        lastMove: 'f2f3',
        description:
          "5.f3 — the Sämisch Variation. White prepares Be3, Qd2, O-O-O (queenside castling) and a kingside pawn storm with g4–h4–h5. One of the most brutal attacking systems against the King's Indian. Black must react immediately: ...c5 or ...e5 to challenge the centre.",
        tip: "The Sämisch leads to all-out attacks. White typically castles queenside and storms Black's king with g4, h4, h5. Black counterattacks with ...c5 or central pawns. Whoever hesitates loses.",
        variations: [
          {
            id:   'ki-samisch-main',
            name: 'Main Line — 5...O-O 6.Be3 e5 7.d5',
            fen:  'rnbq1rk1/ppp2pbp/3p1np1/3Pp3/2P1P3/2N1BP2/PP4PP/R2QKBNR b KQ - 0 7',
            lastMove: 'd4d5',
            description:
              "6.Be3 e5 7.d5 — White closes the centre. Black should play 7...Nh5 (threatening ...f5) or 7...c6 to break down the centre. After 8.Qd2 Nh5 9.O-O-O f5, mutual king hunts begin.",
          },
          {
            id:   'ki-samisch-panov',
            name: 'Panov System — 5...O-O 6.Be3 c5',
            fen:  'rnbq1rk1/pp2ppbp/3p1np1/2p5/2PPP3/2N1BP2/PP4PP/R2QKBNR w KQ - 0 7',
            lastMove: 'c7c5',
            description:
              "6...c5 — Black challenges the centre from the side rather than the front. After 7.dxc5 dxc5 8.Qxd8 Rxd8 9.Bxc5 Nbd7, an endgame arises where Black's active pieces compensate for the isolated pawn.",
          },
        ],
      },
      {
        id:   'ki-four-pawns',
        name: 'Four Pawns Attack — 5.f4',
        fen:  'rnbqk2r/ppp1ppbp/3p1np1/8/2PPPP2/2N5/PP4PP/R1BQKBNR b KQkq - 0 5',
        lastMove: 'f2f4',
        description:
          "5.f4 — the Four Pawns Attack. White occupies d4+e4+c4+f4 — an enormous pawn centre. This is White's most aggressive option. If the centre holds, White wins easily. But it is very rigid: Black can often undermine it with ...c5 or ...e5.",
        tip: "The Four Pawns Attack is a double-edged gamble. If Black knows the theory and strikes the centre at the right moment, the massive White centre becomes a liability. A great surprise weapon but risky at high levels.",
        variations: [
          {
            id:   'ki-four-pawns-c5',
            name: 'Main Line — 5...O-O 6.Nf3 c5',
            fen:  'rnbq1rk1/pp2ppbp/3p1np1/2p5/2PPPP2/2N2N2/PP4PP/R1BQKB1R w KQ - 0 7',
            lastMove: 'c7c5',
            description:
              "6...c5 — the sharpest reply. Black immediately attacks the d4 pawn. After 7.d5 e6 8.dxe6 fxe6, the position opens and Black's piece activity compensates for the pawn weaknesses. Highly tactical play ensues.",
          },
        ],
      },
    ],
  },
};

// ── Exports ───────────────────────────────────────────────────────────────────

export const OPENINGS: Opening[] = [
  RUY_LOPEZ,
  ITALIAN_GAME,
  SICILIAN_DEFENSE,
  QUEENS_GAMBIT,
  FRENCH_DEFENSE,
  CARO_KANN,
  KINGS_INDIAN,
];
