import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTournament } from "../context/TournamentContext";
import styles from "./NameEntry.module.css";

export function NameEntry() {
  const navigate = useNavigate();
  const { view, matches, players, addPlayer, removePlayer } = useTournament();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (view === "tournament" && matches && matches.length > 0) {
      navigate("/jatek", { replace: true });
    }
    if (view === "results") {
      navigate("/eredmeny", { replace: true });
    }
  }, [view, matches, navigate]);

  const submit = () => {
    addPlayer(draft);
    setDraft("");
  };

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={styles.heading}>Játékosok</h2>
      <p className={styles.hint}>
        Add meg a neveket a <strong>játszma sorrendjében</strong>. A round-robin
        ütemezés ehhez a sorrendhez igazodik (determinisztikus, nincs
        véletlenszerű keverés).
      </p>
      <div className={styles.formRow}>
        <input
          data-testid="player-name-input"
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Név"
          aria-label="Új játékos neve"
        />
        <button
          type="button"
          className={styles.addBtn}
          data-testid="add-player-btn"
          onClick={submit}
        >
          Hozzáadás
        </button>
      </div>
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {players.map((p, index) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={styles.listItem}
              data-testid="player-list-item"
            >
              <span className={styles.order}>{index + 1}.</span>
              <span className={styles.name}>{p.name}</span>
              <button
                type="button"
                className={styles.remove}
                onClick={() => removePlayer(p.id)}
                aria-label={`${p.name} eltávolítása`}
              >
                ✕
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {players.length < 2 && (
        <p className={styles.warn}>
          Legalább két játékos szükséges a starthoz.
        </p>
      )}
    </motion.section>
  );
}
