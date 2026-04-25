import type { ScheduledMatch } from "./types";

/** Internal sentinel for odd player counts; never a real player id. */
export const BYE_PLAYER_ID = "__bye__";

/**
 * Deterministic single round-robin: circle / Berger scheduling.
 * `playerIds` order is the bracket input order (e.g. name entry order).
 */
export function buildRoundRobinSchedule(playerIds: string[]): ScheduledMatch[] {
  if (playerIds.length < 2) return [];

  const schedule = [...playerIds];
  if (schedule.length % 2 === 1) {
    schedule.push(BYE_PLAYER_ID);
  }

  const n = schedule.length;
  const rounds = n - 1;
  const matches: ScheduledMatch[] = [];

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < n / 2; i++) {
      const a = schedule[i]!;
      const b = schedule[n - 1 - i]!;
      if (a !== BYE_PLAYER_ID && b !== BYE_PLAYER_ID) {
        matches.push({
          id: `r${r + 1}-p${i}`,
          round: r + 1,
          playerAId: a,
          playerBId: b,
        });
      }
    }
    schedule.splice(1, 0, schedule.pop()!);
  }

  return matches;
}
