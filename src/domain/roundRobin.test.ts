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
});
