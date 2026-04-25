import type { Player, ScheduledMatch, StandingRow } from "./types";

/**
 * Wins from finished matches; tie-break: more wins first, then earlier registration (lower orderIndex).
 */
export function computeStandings(
  players: Player[],
  matches: ScheduledMatch[],
  resultsByMatchId: Record<string, string>,
  excludedPlayerIds: string[] = [],
): StandingRow[] {
  const excluded = new Set(excludedPlayerIds);
  const activePlayers = players.filter((p) => !excluded.has(p.id));
  const order = new Map(players.map((p, i) => [p.id, i]));
  const wins = new Map<string, number>();
  for (const p of activePlayers) {
    wins.set(p.id, 0);
  }

  for (const m of matches) {
    if (excluded.has(m.playerAId) || excluded.has(m.playerBId)) continue;
    const w = resultsByMatchId[m.id];
    if (!w) continue;
    if (w !== m.playerAId && w !== m.playerBId) continue;
    if (excluded.has(w)) continue;
    wins.set(w, (wins.get(w) ?? 0) + 1);
  }

  return activePlayers
    .map((p) => ({
      playerId: p.id,
      wins: wins.get(p.id) ?? 0,
      orderIndex: order.get(p.id) ?? 999,
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.orderIndex - b.orderIndex;
    });
}

export function topN(
  standings: StandingRow[],
  n: number,
): StandingRow[] {
  return standings.slice(0, n);
}
