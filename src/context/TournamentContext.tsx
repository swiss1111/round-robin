import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { newPlayerId } from "../domain/playerId";
import { buildRoundRobinSchedule } from "../domain/roundRobin";
import type { AppView, Player } from "../domain/types";
import {
  clearTournamentState,
  defaultPersistedState,
  loadTournamentState,
  saveTournamentState,
  type PersistedTournamentState,
} from "../storage/tournamentStorage";

type TournamentContextValue = {
  view: AppView;
  players: Player[];
  excludedPlayerIds: string[];
  matches: PersistedTournamentState["matches"];
  currentMatchIndex: number;
  matchResults: Record<string, string>;
  sidebarCollapsed: boolean;
  canStart: boolean;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  startTournament: () => void;
  setWinnerForCurrentMatch: (playerId: string) => void;
  excludePlayer: (playerId: string) => void;
  canExcludePlayer: (playerId: string) => boolean;
  goToNextMatch: () => void;
  finishTournament: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  resetAll: () => void;
};

const TournamentContext = createContext<TournamentContextValue | null>(null);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<PersistedTournamentState>(() =>
    loadTournamentState(),
  );

  useEffect(() => {
    saveTournamentState(state);
  }, [state]);

  const canStart = useMemo(() => {
    if (state.view !== "setup") return false;
    if (state.players.length < 2) return false;
    return state.players.every((p) => p.name.trim().length > 0);
  }, [state.players, state.view]);

  const addPlayer = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      players: [...s.players, { id: newPlayerId(), name: trimmed }],
    }));
  }, []);

  const removePlayer = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      players: s.players.filter((p) => p.id !== id),
    }));
  }, []);

  const startTournament = useCallback(() => {
    setState((s) => {
      const ids = s.players.map((p) => p.id);
      if (ids.length < 2) return s;
      const schedule = buildRoundRobinSchedule(ids);
      return {
        ...s,
        view: "tournament" as const,
        excludedPlayerIds: [],
        matches: schedule,
        currentMatchIndex: 0,
        matchResults: {},
      };
    });
    navigate("/jatek", { replace: true });
  }, [navigate]);

  const setWinnerForCurrentMatch = useCallback((playerId: string) => {
    setState((s) => {
      const m = s.matches?.[s.currentMatchIndex];
      if (!m) return s;
      if (
        s.excludedPlayerIds.includes(m.playerAId) ||
        s.excludedPlayerIds.includes(m.playerBId)
      ) {
        return s;
      }
      if (playerId !== m.playerAId && playerId !== m.playerBId) return s;
      return {
        ...s,
        matchResults: { ...s.matchResults, [m.id]: playerId },
      };
    });
  }, []);

  const canExcludePlayer = useCallback(
    (playerId: string) => {
      if (state.excludedPlayerIds.includes(playerId)) return false;
      const activePlayerCount = state.players.filter(
        (p) => !state.excludedPlayerIds.includes(p.id),
      ).length;
      return activePlayerCount > 2;
    },
    [state.excludedPlayerIds, state.players],
  );

  const excludePlayer = useCallback(
    (playerId: string) => {
      let shouldFinish = false;
      setState((s) => {
        if (s.excludedPlayerIds.includes(playerId)) {
          return s;
        }
        const activePlayerCountBefore = s.players.filter(
          (p) => !s.excludedPlayerIds.includes(p.id),
        ).length;
        if (activePlayerCountBefore <= 2) {
          return s;
        }
        const nextExcluded = [...s.excludedPlayerIds, playerId];
        const nextMatches =
          s.matches?.filter(
            (m) => m.playerAId !== playerId && m.playerBId !== playerId,
          ) ?? null;
        const nextResults: Record<string, string> = {};
        if (nextMatches) {
          const allowedMatchIds = new Set(nextMatches.map((m) => m.id));
          for (const [matchId, winnerId] of Object.entries(s.matchResults)) {
            if (allowedMatchIds.has(matchId)) {
              nextResults[matchId] = winnerId;
            }
          }
        }

        const activePlayerCount = s.players.filter(
          (p) => !nextExcluded.includes(p.id),
        ).length;
        const hasPlayableMatches = (nextMatches?.length ?? 0) > 0;
        shouldFinish = activePlayerCount < 2 || !hasPlayableMatches;

        return {
          ...s,
          excludedPlayerIds: nextExcluded,
          matches: nextMatches,
          matchResults: nextResults,
          currentMatchIndex: 0,
          view: shouldFinish ? "results" : s.view,
        };
      });
      if (shouldFinish) {
        navigate("/eredmeny", { replace: true });
      }
    },
    [navigate],
  );

  const goToNextMatch = useCallback(() => {
    setState((s) => {
      const total = s.matches?.length ?? 0;
      if (total === 0) return s;
      const next = s.currentMatchIndex + 1;
      if (next >= total) return s;
      return { ...s, currentMatchIndex: next };
    });
  }, []);

  const finishTournament = useCallback(() => {
    setState((s) => ({ ...s, view: "results" as const }));
    navigate("/eredmeny", { replace: true });
  }, [navigate]);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState((s) => ({ ...s, sidebarCollapsed: collapsed }));
  }, []);

  const resetAll = useCallback(() => {
    clearTournamentState();
    setState(defaultPersistedState());
    navigate("/", { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      view: state.view,
      players: state.players,
      excludedPlayerIds: state.excludedPlayerIds,
      matches: state.matches,
      currentMatchIndex: state.currentMatchIndex,
      matchResults: state.matchResults,
      sidebarCollapsed: state.sidebarCollapsed,
      canStart,
      addPlayer,
      removePlayer,
      startTournament,
      setWinnerForCurrentMatch,
      excludePlayer,
      canExcludePlayer,
      goToNextMatch,
      finishTournament,
      setSidebarCollapsed,
      resetAll,
    }),
    [
      state.view,
      state.players,
      state.excludedPlayerIds,
      state.matches,
      state.currentMatchIndex,
      state.matchResults,
      state.sidebarCollapsed,
      canStart,
      addPlayer,
      removePlayer,
      startTournament,
      setWinnerForCurrentMatch,
      excludePlayer,
      canExcludePlayer,
      goToNextMatch,
      finishTournament,
      setSidebarCollapsed,
      resetAll,
    ],
  );

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament(): TournamentContextValue {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error("useTournament must be used within TournamentProvider");
  }
  return ctx;
}
