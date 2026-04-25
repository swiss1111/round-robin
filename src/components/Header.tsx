import { motion } from "framer-motion";
import { useTournament } from "../context/TournamentContext";
import styles from "./Header.module.css";

export function Header() {
  const { view, canStart, startTournament, resetAll } = useTournament();

  const startDisabled = view !== "setup" || !canStart;

  return (
    <header className={styles.header}>
      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        Gabi–Dávid ping-pong bajnokság
      </motion.h1>
      <div className={styles.actions}>
        <motion.button
          type="button"
          className={styles.btnPrimary}
          data-testid="start-btn"
          disabled={startDisabled}
          onClick={() => startTournament()}
          whileTap={startDisabled ? undefined : { scale: 0.97 }}
        >
          Start
        </motion.button>
        <motion.button
          type="button"
          className={styles.btnGhost}
          onClick={() => resetAll()}
          whileTap={{ scale: 0.97 }}
        >
          Visszaállítás
        </motion.button>
      </div>
    </header>
  );
}
