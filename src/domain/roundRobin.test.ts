import { describe, expect, it } from "vitest";
import { BYE_PLAYER_ID, buildRoundRobinSchedule } from "./roundRobin";

describe("buildRoundRobinSchedule", () => {
  it("returns empty for fewer than 2 players", () => {
    expect(buildRoundRobinSchedule([])).toEqual([]);
    expect(buildRoundRobinSchedule(["a"])).toEqual([]);
  });

  it("schedules 4 players with 6 matches deterministically", () => {
    const ids = ["a", "b", "c", "d"];
    const m = buildRoundRobinSchedule(ids);
    expect(m).toHaveLength(6);
    const pairs = m.map((x) => [x.playerAId, x.playerBId].sort().join("-"));
    const uniquePairs = new Set(pairs);
    expect(uniquePairs.size).toBe(6);
  });

  it("is stable for the same input order", () => {
    const ids = ["x", "y", "z"];
    const a = buildRoundRobinSchedule(ids);
    const b = buildRoundRobinSchedule(ids);
    expect(a).toEqual(b);
  });

  it("handles odd count with bye (3 players → 3 matches)", () => {
    const m = buildRoundRobinSchedule(["a", "b", "c"]);
    expect(m).toHaveLength(3);
    for (const row of m) {
      expect(row.playerAId).not.toBe(BYE_PLAYER_ID);
      expect(row.playerBId).not.toBe(BYE_PLAYER_ID);
    }
  });

  it("schedules 10 players with full pair coverage", () => {
    const ids = Array.from({ length: 10 }, (_, i) => `p${i + 1}`);
    const m = buildRoundRobinSchedule(ids);
    // n * (n - 1) / 2
    expect(m).toHaveLength(45);

    const pairSet = new Set(
      m.map((x) => [x.playerAId, x.playerBId].sort().join("-")),
    );
    expect(pairSet.size).toBe(45);

    const appearances = new Map<string, number>(ids.map((id) => [id, 0]));
    for (const row of m) {
      appearances.set(row.playerAId, (appearances.get(row.playerAId) ?? 0) + 1);
      appearances.set(row.playerBId, (appearances.get(row.playerBId) ?? 0) + 1);
    }
    for (const id of ids) {
      expect(appearances.get(id)).toBe(9);
    }
  });
});
