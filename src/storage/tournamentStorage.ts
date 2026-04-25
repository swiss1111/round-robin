import type { AppView, Player, ScheduledMatch } from "../domain/types";
import { STATE_VERSION, STORAGE_KEY } from "./constants";

export type PersistedTournamentState = {
  version: typeof STATE_VERSION;
  view: AppView;
  players: Player[];
  excludedPlayerIds: string[];
  matches: ScheduledMatch[] | null;
  currentMatchIndex: number;
  /** match id → winning player id */
  matchResults: Record<string, string>;
  sidebarCollapsed: boolean;
};

export function defaultPersistedState(): PersistedTournamentState {
  return {
    version: STATE_VERSION,
    view: "setup",
    players: [],
    excludedPlayerIds: [],
    matches: null,
    currentMatchIndex: 0,
    matchResults: {},
    sidebarCollapsed: false,
  };
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function parsePlayer(x: unknown): Player | null {
  if (!isRecord(x)) return null;
  if (typeof x.id !== "string" || typeof x.name !== "string") return null;
  return { id: x.id, name: x.name };
}

function parseMatch(x: unknown): ScheduledMatch | null {
  if (!isRecord(x)) return null;
  if (typeof x.id !== "string") return null;
  if (typeof x.round !== "number") return null;
  if (typeof x.playerAId !== "string" || typeof x.playerBId !== "string")
    return null;
  return {
    id: x.id,
    round: x.round,
    playerAId: x.playerAId,
    playerBId: x.playerBId,
  };
}

/**
 * Loads persisted state from localStorage, or returns defaults.
 * Unknown versions / corrupt payloads fall back to defaults (migration hook).
 */
export function loadTournamentState(
  storage: Storage = localStorage,
): PersistedTournamentState {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return defaultPersistedState();

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return defaultPersistedState();
    if (parsed.version !== STATE_VERSION) return defaultPersistedState();

    const view = parsed.view;
    if (view !== "setup" && view !== "tournament" && view !== "results") {
      return defaultPersistedState();
    }

    const playersRaw = parsed.players;
    if (!Array.isArray(playersRaw)) return defaultPersistedState();
    const players: Player[] = [];
    for (const p of playersRaw) {
      const pl = parsePlayer(p);
      if (pl) players.push(pl);
    }

    let matches: ScheduledMatch[] | null = null;
    if (parsed.matches === null) {
      matches = null;
    } else if (Array.isArray(parsed.matches)) {
      const ms: ScheduledMatch[] = [];
      for (const m of parsed.matches) {
        const row = parseMatch(m);
        if (row) ms.push(row);
      }
      matches = ms;
    }
    const excludedPlayerIds: string[] = [];
    if (Array.isArray(parsed.excludedPlayerIds)) {
      for (const id of parsed.excludedPlayerIds) {
        if (typeof id === "string") {
          excludedPlayerIds.push(id);
        }
      }
    }

    const currentMatchIndex =
      typeof parsed.currentMatchIndex === "number" &&
      Number.isInteger(parsed.currentMatchIndex) &&
      parsed.currentMatchIndex >= 0
        ? parsed.currentMatchIndex
        : 0;

    const matchResults: Record<string, string> = {};
    if (isRecord(parsed.matchResults)) {
      for (const [k, v] of Object.entries(parsed.matchResults)) {
        if (typeof v === "string") matchResults[k] = v;
      }
    }

    const sidebarCollapsed =
      typeof parsed.sidebarCollapsed === "boolean"
        ? parsed.sidebarCollapsed
        : false;

    let resolvedView: AppView = view;
    let resolvedMatches = matches;
    if (resolvedView === "tournament" && (!resolvedMatches || resolvedMatches.length === 0)) {
      resolvedView = "setup";
      resolvedMatches = null;
    }
    if (resolvedView === "results" && (!resolvedMatches || resolvedMatches.length === 0)) {
      resolvedView = "setup";
    }

    const maxIdx =
      resolvedMatches && resolvedMatches.length > 0
        ? resolvedMatches.length - 1
        : 0;
    const safeMatchIndex = Math.min(currentMatchIndex, maxIdx);

    return {
      version: STATE_VERSION,
      view: resolvedView,
      players,
      excludedPlayerIds,
      matches: resolvedMatches,
      currentMatchIndex: safeMatchIndex,
      matchResults,
      sidebarCollapsed,
    };
  } catch {
    return defaultPersistedState();
  }
}

export function saveTournamentState(
  state: PersistedTournamentState,
  storage: Storage = localStorage,
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota / private mode — ignore
  }
}

export function clearTournamentState(storage: Storage = localStorage): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
