import { describe, expect, it, beforeEach } from "vitest";
import { STORAGE_KEY } from "./constants";
import {
  clearTournamentState,
  defaultPersistedState,
  loadTournamentState,
  saveTournamentState,
} from "./tournamentStorage";

function makeMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("tournamentStorage", () => {
  let mem: Storage;

  beforeEach(() => {
    mem = makeMemoryStorage();
  });

  it("returns defaults when empty", () => {
    const s = loadTournamentState(mem);
    expect(s).toEqual(defaultPersistedState());
  });

  it("round-trips state", () => {
    const s = defaultPersistedState();
    s.players = [{ id: "p1", name: "A" }];
    s.excludedPlayerIds = ["p1"];
    saveTournamentState(s, mem);
    const again = loadTournamentState(mem);
    expect(again.players).toEqual([{ id: "p1", name: "A" }]);
    expect(again.excludedPlayerIds).toEqual(["p1"]);
  });

  it("falls back on corrupt JSON", () => {
    mem.setItem(STORAGE_KEY, "{not json");
    expect(loadTournamentState(mem)).toEqual(defaultPersistedState());
  });

  it("clearTournamentState removes key", () => {
    saveTournamentState(defaultPersistedState(), mem);
    clearTournamentState(mem);
    expect(mem.getItem(STORAGE_KEY)).toBeNull();
  });

  it("falls back to setup when tournament view has no matches", () => {
    mem.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaultPersistedState(),
        view: "tournament",
        matches: [],
      }),
    );
    const loaded = loadTournamentState(mem);
    expect(loaded.view).toBe("setup");
    expect(loaded.matches).toBeNull();
  });

  it("clamps currentMatchIndex to existing schedule size", () => {
    mem.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaultPersistedState(),
        view: "tournament",
        players: [
          { id: "p1", name: "A" },
          { id: "p2", name: "B" },
        ],
        matches: [{ id: "m1", round: 1, playerAId: "p1", playerBId: "p2" }],
        currentMatchIndex: 999,
      }),
    );
    const loaded = loadTournamentState(mem);
    expect(loaded.currentMatchIndex).toBe(0);
  });
});
