/**
 * Opening name lookup — maps a string of space-separated SAN moves to an
 * opening name.  We store every prefix so partial matches work during play.
 *
 * Keys are the full SAN move sequence joined by spaces, e.g. "e4 e5 Nf3".
 * The book is built by adding each opening at every prefix length so that
 * the current position is always matched to the deepest known name.
 */

const RAW_OPENINGS: [string, string][] = [
  // ── e4 openings ──────────────────────────────────────────────────────────
  ['e4',                                              "King's Pawn"],
  ['e4 e5',                                           "Open Game"],
  ['e4 e5 Nf3',                                       "King's Knight Opening"],
  ['e4 e5 Nf3 Nc6',                                   "King's Knight Opening"],
  ['e4 e5 Nf3 Nc6 Bb5',                               "Ruy López"],
  ['e4 e5 Nf3 Nc6 Bb5 a6',                            "Ruy López: Morphy Defense"],
  ['e4 e5 Nf3 Nc6 Bb5 a6 Ba4',                        "Ruy López: Morphy Defense"],
  ['e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6',                   "Ruy López: Morphy Defense, Open"],
  ['e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O',               "Ruy López: Open"],
  ['e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7',           "Ruy López: Closed"],
  ['e4 e5 Nf3 Nc6 Bb5 Nf6',                           "Ruy López: Berlin Defense"],
  ['e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4',                 "Ruy López: Berlin, Rio Gambit"],
  ['e4 e5 Nf3 Nc6 Bc4',                               "Italian Game"],
  ['e4 e5 Nf3 Nc6 Bc4 Bc5',                           "Giuoco Piano"],
  ['e4 e5 Nf3 Nc6 Bc4 Bc5 c3',                        "Giuoco Piano: Main Line"],
  ['e4 e5 Nf3 Nc6 Bc4 Bc5 b4',                        "Evans Gambit"],
  ['e4 e5 Nf3 Nc6 Bc4 Nf6',                           "Two Knights Defense"],
  ['e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5',                       "Two Knights Defense: Main Line"],
  ['e4 e5 Nf3 Nc6 d4',                                "Scotch Game"],
  ['e4 e5 Nf3 Nc6 d4 exd4',                           "Scotch Game"],
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4',                     "Scotch Game"],
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6',                 "Scotch Game: Schmidt Variation"],
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5',                 "Scotch Game: Classical"],
  ['e4 e5 Nf3 f5',                                    "Latvian Gambit"],
  ['e4 e5 f4',                                        "King's Gambit"],
  ['e4 e5 f4 exf4',                                   "King's Gambit Accepted"],
  ['e4 e5 f4 d5',                                     "Falkbeer Counter-Gambit"],
  ['e4 e5 Nc3',                                       "Vienna Game"],
  ['e4 e5 Nc3 Nf6',                                   "Vienna Game: Falkbeer Variation"],
  ['e4 e5 Nc3 Nc6',                                   "Vienna Game"],
  ['e4 c5',                                           "Sicilian Defense"],
  ['e4 c5 Nf3',                                       "Sicilian Defense: Open"],
  ['e4 c5 Nf3 d6',                                    "Sicilian Defense: Najdorf"],
  ['e4 c5 Nf3 d6 d4',                                 "Sicilian Defense: Open"],
  ['e4 c5 Nf3 d6 d4 cxd4',                            "Sicilian Defense: Open"],
  ['e4 c5 Nf3 d6 d4 cxd4 Nxd4',                      "Sicilian Defense: Open"],
  ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6',                  "Sicilian Defense: Najdorf"],
  ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6',           "Sicilian Defense: Najdorf"],
  ['e4 c5 Nf3 Nc6',                                   "Sicilian Defense: Open"],
  ['e4 c5 Nf3 Nc6 d4 cxd4 Nxd4',                     "Sicilian Defense: Open"],
  ['e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3',             "Sicilian Defense: Four Knights"],
  ['e4 c5 Nf3 e6',                                    "Sicilian Defense: Kan Variation"],
  ['e4 c5 Nf3 e6 d4 cxd4 Nxd4',                      "Sicilian Defense: Kan"],
  ['e4 c5 c3',                                        "Sicilian Defense: Alapin Variation"],
  ['e4 c5 Nc3',                                       "Sicilian Defense: Closed"],
  ['e4 e6',                                           "French Defense"],
  ['e4 e6 d4',                                        "French Defense"],
  ['e4 e6 d4 d5',                                     "French Defense"],
  ['e4 e6 d4 d5 Nc3',                                 "French Defense: Classical"],
  ['e4 e6 d4 d5 Nc3 Nf6',                             "French Defense: Classical"],
  ['e4 e6 d4 d5 Nc3 Bb4',                             "French Defense: Winawer Variation"],
  ['e4 e6 d4 d5 Nd2',                                 "French Defense: Tarrasch Variation"],
  ['e4 e6 d4 d5 e5',                                  "French Defense: Advance Variation"],
  ['e4 e6 d4 d5 exd5',                                "French Defense: Exchange Variation"],
  ['e4 c6',                                           "Caro-Kann Defense"],
  ['e4 c6 d4',                                        "Caro-Kann Defense"],
  ['e4 c6 d4 d5',                                     "Caro-Kann Defense"],
  ['e4 c6 d4 d5 Nc3',                                 "Caro-Kann Defense: Classical"],
  ['e4 c6 d4 d5 Nd2',                                 "Caro-Kann Defense: Karpov Variation"],
  ['e4 c6 d4 d5 e5',                                  "Caro-Kann Defense: Advance Variation"],
  ['e4 c6 d4 d5 exd5',                                "Caro-Kann Defense: Exchange Variation"],
  ['e4 d5',                                           "Scandinavian Defense"],
  ['e4 d5 exd5',                                      "Scandinavian Defense"],
  ['e4 d5 exd5 Qxd5',                                 "Scandinavian Defense: Main Line"],
  ['e4 d5 exd5 Nf6',                                  "Scandinavian Defense: Modern Variation"],
  ['e4 d6',                                           "Pirc Defense"],
  ['e4 d6 d4 Nf6',                                    "Pirc Defense"],
  ['e4 d6 d4 Nf6 Nc3 g6',                             "Pirc Defense: Main Line"],
  ['e4 g6',                                           "Modern Defense"],
  ['e4 g6 d4 Bg7',                                    "Modern Defense"],
  ['e4 Nf6',                                          "Alekhine's Defense"],
  ['e4 Nf6 e5 Nd5',                                   "Alekhine's Defense: Main Line"],

  // ── d4 openings ──────────────────────────────────────────────────────────
  ['d4',                                              "Queen's Pawn"],
  ['d4 d5',                                           "Queen's Pawn Game"],
  ['d4 d5 c4',                                        "Queen's Gambit"],
  ['d4 d5 c4 e6',                                     "Queen's Gambit Declined"],
  ['d4 d5 c4 e6 Nc3',                                 "Queen's Gambit Declined"],
  ['d4 d5 c4 e6 Nc3 Nf6',                             "Queen's Gambit Declined"],
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5',                         "Queen's Gambit Declined: Classical"],
  ['d4 d5 c4 e6 Nc3 Nf6 Nf3',                         "Queen's Gambit Declined: Three Knights"],
  ['d4 d5 c4 dxc4',                                   "Queen's Gambit Accepted"],
  ['d4 d5 c4 dxc4 Nf3',                               "Queen's Gambit Accepted"],
  ['d4 d5 c4 c6',                                     "Slav Defense"],
  ['d4 d5 c4 c6 Nf3',                                 "Slav Defense"],
  ['d4 d5 c4 c6 Nf3 Nf6',                             "Slav Defense"],
  ['d4 d5 c4 c6 Nf3 Nf6 Nc3',                         "Slav Defense: Main Line"],
  ['d4 Nf6',                                          "Indian Defense"],
  ['d4 Nf6 c4',                                       "Indian Defense"],
  ['d4 Nf6 c4 g6',                                    "King's Indian Defense"],
  ['d4 Nf6 c4 g6 Nc3',                                "King's Indian Defense"],
  ['d4 Nf6 c4 g6 Nc3 Bg7',                            "King's Indian Defense"],
  ['d4 Nf6 c4 g6 Nc3 Bg7 e4',                         "King's Indian Defense: Main Line"],
  ['d4 Nf6 c4 g6 Nc3 Bg7 e4 d6',                     "King's Indian Defense: Main Line"],
  ['d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O',             "King's Indian Defense: Classical"],
  ['d4 Nf6 c4 e6',                                    "Nimzo-Indian or Queen's Indian"],
  ['d4 Nf6 c4 e6 Nc3',                                "Nimzo-Indian Defense"],
  ['d4 Nf6 c4 e6 Nc3 Bb4',                            "Nimzo-Indian Defense"],
  ['d4 Nf6 c4 e6 Nc3 Bb4 e3',                         "Nimzo-Indian Defense: Rubinstein"],
  ['d4 Nf6 c4 e6 Nf3',                                "Queen's Indian Defense"],
  ['d4 Nf6 c4 e6 Nf3 b6',                             "Queen's Indian Defense"],
  ['d4 Nf6 c4 c5',                                    "Benoni Defense"],
  ['d4 Nf6 c4 c5 d5',                                 "Benoni Defense"],
  ['d4 Nf6 c4 c5 d5 e6',                              "Modern Benoni"],
  ['d4 f5',                                           "Dutch Defense"],
  ['d4 f5 c4',                                        "Dutch Defense"],
  ['d4 f5 c4 Nf6',                                    "Dutch Defense"],
  ['d4 f5 c4 e6',                                     "Dutch Defense: Classical"],
  ['d4 f5 g3',                                        "Dutch Defense: Leningrad"],

  // ── c4 / Nf3 / other openings ────────────────────────────────────────────
  ['c4',                                              "English Opening"],
  ['c4 e5',                                           "English Opening: Reversed Sicilian"],
  ['c4 e5 Nc3',                                       "English Opening: Reversed Sicilian"],
  ['c4 Nf6',                                          "English Opening: Indian"],
  ['c4 c5',                                           "English Opening: Symmetrical"],
  ['c4 c5 Nf3',                                       "English Opening: Symmetrical"],
  ['Nf3',                                             "Réti Opening"],
  ['Nf3 d5',                                          "Réti Opening"],
  ['Nf3 Nf6',                                         "Réti Opening: King's Indian Attack"],
  ['Nf3 d5 c4',                                       "Réti Opening: Main Line"],
  ['g3',                                              "King's Fianchetto Opening"],
  ['b3',                                              "Larsen's Opening"],
  ['b4',                                              "Polish Opening"],
  ['f4',                                              "Bird's Opening"],
  ['f4 e5',                                           "Bird's Opening: From Gambit"],
  ['d4 d5 Nf3',                                       "London System"],
  ['d4 d5 Nf3 Nf6',                                   "London System"],
  ['d4 d5 Nf3 Nf6 Bf4',                               "London System"],
  ['d4 Nf6 Nf3',                                      "London System"],
  ['d4 Nf6 Nf3 d5 Bf4',                               "London System"],
];

// Build the lookup table — index by prefix so partial sequences match
const OPENING_MAP = new Map<string, string>();
for (const [moves, name] of RAW_OPENINGS) {
  OPENING_MAP.set(moves, name);
}

/**
 * Given an array of Move objects (from chess.js history), return the deepest
 * known opening name, or null if no opening is recognised.
 */
export function getOpeningName(sanHistory: string[]): string | null {
  if (sanHistory.length === 0) return null;

  // Walk backwards from the full sequence to find the longest prefix match
  for (let len = sanHistory.length; len >= 1; len--) {
    const key = sanHistory.slice(0, len).join(' ');
    const name = OPENING_MAP.get(key);
    if (name) return name;
  }

  return null;
}
