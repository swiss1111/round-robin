import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { computeStandings, topN } from "../domain/standings";
import { useTournament } from "../context/TournamentContext";
import styles from "./Podium.module.css";

const podiumOrder = [1, 0, 2] as const;

export function Podium() {
  const navigate = useNavigate();
  const { view, players, matches, matchResults, excludedPlayerIds } =
    useTournament();

  useEffect(() => {
    if (view === "setup") {
      navigate("/", { replace: true });
    } else if (view === "tournament" && matches?.length) {
      navigate("/jatek", { replace: true });
    }
  }, [view, matches, navigate]);

  const top = useMemo(() => {
    if (!matches?.length) return [];
    const standings = computeStandings(
      players,
      matches,
      matchResults,
      excludedPlayerIds,
    );
    return topN(standings, 3);
  }, [players, matches, matchResults, excludedPlayerIds]);

  const label = (i: number) => {
    if (i === 0) return "1. hely";
    if (i === 1) return "2. hely";
    return "3. hely";
  };

  if (view !== "results") {
    return null;
  }

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className={styles.heading}>Eredményhirdetés</h2>
      <p className={styles.sub}>A legjobb három helyezett</p>
      <div className={styles.podium}>
        {podiumOrder.map((slot, idx) => {
          const row = top[slot];
          const name = row
            ? (players.find((p) => p.id === row.playerId)?.name ?? "?")
            : "—";
          const heightClass =
            slot === 0
              ? styles.first
              : slot === 1
                ? styles.second
                : styles.third;
          return (
            <motion.div
              key={slot}
              className={`${styles.step} ${heightClass}`}
              data-testid={`podium-slot-${slot + 1}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * idx, duration: 0.4, type: "spring" }}
            >
              <span className={styles.place}>{label(slot)}</span>
              <span className={styles.name}>{name}</span>
              {row && <span className={styles.wins}>{row.wins} győzelem</span>}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
