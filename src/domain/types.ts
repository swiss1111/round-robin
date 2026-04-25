export type Player = {
  id: string;
  name: string;
};

export type ScheduledMatch = {
  id: string;
  round: number;
  playerAId: string;
  playerBId: string;
};

export type AppView = "setup" | "tournament" | "results";

export type StandingRow = {
  playerId: string;
  wins: number;
  /** lower = better (registration order tie-break) */
  orderIndex: number;
};
