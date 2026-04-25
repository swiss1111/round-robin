import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTournament } from "../context/TournamentContext";
import { StandingsSidebar } from "./StandingsSidebar";
import styles from "./TournamentView.module.css";

export function TournamentView() {
  const navigate = useNavigate();
  const {
    view,
    players,
    matches,
    currentMatchIndex,
    matchResults,
    excludedPlayerIds,
    setWinnerForCurrentMatch,
    goToNextMatch,
    finishTournament,
  } = useTournament();

  useEffect(() => {
    if (view === "setup" || !matches?.length) {
      navigate("/", { replace: true });
    }
    if (view === "results") {
      navigate("/eredmeny", { replace: true });
    }
  }, [view, matches, navigate]);

  const current = matches?.[currentMatchIndex];
  const next = matches?.[currentMatchIndex + 1];

  const currentWinner = current ? matchResults[current.id] : undefined;
  const currentBlocked =
    current &&
    (excludedPlayerIds.includes(current.playerAId) ||
      excludedPlayerIds.includes(current.playerBId));

  const name = (id: string) => players.find((p) => p.id === id)?.name ?? "?";

  const isLast =
    matches && matches.length > 0
      ? currentMatchIndex >= matches.length - 1
      : false;

  const canAdvance = !currentBlocked && Boolean(currentWinner);

  const nextNames = useMemo(() => {
    if (!next) return null;
    const na = players.find((p) => p.id === next.playerAId)?.name ?? "?";
    const nb = players.find((p) => p.id === next.playerBId)?.name ?? "?";
    return { a: na, b: nb };
  }, [next, players]);

  if (!matches?.length || !current) {
    return null;
  }

  const handlePrimary = () => {
    if (!canAdvance) return;
    if (isLast) finishTournament();
    else goToNextMatch();
  };

  return (
    <motion.div
      className={styles.wrap}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.row}>
        <div className={styles.main}>
          <p className={styles.meta}>
            Meccs {currentMatchIndex + 1} / {matches.length} · {current.round}.
            forduló
          </p>
          <div className={styles.versus}>
            <button
              type="button"
              className={
                styles.playerCard +
                (currentWinner === current.playerAId ? ` ${styles.picked}` : "")
              }
              disabled={currentBlocked}
              onClick={() => setWinnerForCurrentMatch(current.playerAId)}
            >
              <span className={styles.label}>Játékos</span>
              <span className={styles.pname}>{name(current.playerAId)}</span>
            </button>
            <span className={styles.vs}>VS</span>
            <button
              type="button"
              className={
                styles.playerCard +
                (currentWinner === current.playerBId ? ` ${styles.picked}` : "")
              }
              disabled={currentBlocked}
              onClick={() => setWinnerForCurrentMatch(current.playerBId)}
            >
              <span className={styles.label}>Játékos</span>
              <span className={styles.pname}>{name(current.playerBId)}</span>
            </button>
          </div>
          <p className={styles.sub}>
            {currentBlocked
              ? "A meccs egyik játékosa kizárt, ez a meccs nem számít."
              : "Koppints a győztesre"}
          </p>

          <div className={styles.nextBlock}>
            <h3 className={styles.nextTitle}>Következőként felkészülnek</h3>
            {nextNames ? (
              <p className={styles.nextNames}>
                {nextNames.a} és {nextNames.b}
              </p>
            ) : (
              <p className={styles.nextEmpty}>Nincs több meccs.</p>
            )}
          </div>

          <motion.button
            type="button"
            className={styles.nextBtn}
            disabled={!canAdvance}
            onClick={handlePrimary}
            whileTap={canAdvance ? { scale: 0.98 } : undefined}
          >
            {isLast ? "Befejezés" : "Következő"}
          </motion.button>
        </div>

        <StandingsSidebar
          players={players}
          matches={matches}
          results={matchResults}
          excludedPlayerIds={excludedPlayerIds}
        />
      </div>
    </motion.div>
  );
}
