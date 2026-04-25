import { describe, expect, it } from "vitest";
import { computeStandings } from "./standings";
import type { Player, ScheduledMatch } from "./types";

describe("computeStandings", () => {
  const players: Player[] = [
    { id: "a", name: "A" },
    { id: "b", name: "B" },
    { id: "c", name: "C" },
  ];

  const matches: ScheduledMatch[] = [
    { id: "m1", round: 1, playerAId: "a", playerBId: "b" },
    { id: "m2", round: 1, playerAId: "a", playerBId: "c" },
  ];

  it("ranks by wins then registration order", () => {
    const s = computeStandings(players, matches, { m1: "a", m2: "a" });
    expect(s[0]?.playerId).toBe("a");
    expect(s[0]?.wins).toBe(2);
    expect(s[1]?.wins).toBe(0);
    expect(s[2]?.wins).toBe(0);
    // b before c (registration tie-break)
    expect(s[1]?.playerId).toBe("b");
    expect(s[2]?.playerId).toBe("c");
  });

  it("ignores unknown winner ids", () => {
    const s = computeStandings(players, matches, { m1: "x" });
    expect(s.every((r) => r.wins === 0)).toBe(true);
  });

  it("removes excluded players and their matches from standings", () => {
    const s = computeStandings(
      players,
      matches,
      { m1: "a", m2: "a" },
      ["a"],
    );
    expect(s).toHaveLength(2);
    expect(s[0]?.playerId).toBe("b");
    expect(s[0]?.wins).toBe(0);
    expect(s[1]?.playerId).toBe("c");
    expect(s[1]?.wins).toBe(0);
  });

  it("ignores results that belong to excluded-player matches", () => {
    const extraMatches: ScheduledMatch[] = [
      ...matches,
      { id: "m3", round: 2, playerAId: "b", playerBId: "c" },
    ];
    const s = computeStandings(
      players,
      extraMatches,
      { m1: "a", m2: "a", m3: "b" },
      ["a"],
    );
    // m1 and m2 are dropped due to excluded player "a"
    expect(s[0]?.playerId).toBe("b");
    expect(s[0]?.wins).toBe(1);
    expect(s[1]?.playerId).toBe("c");
    expect(s[1]?.wins).toBe(0);
  });
});
