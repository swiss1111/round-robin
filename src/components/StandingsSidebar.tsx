import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { computeStandings } from "../domain/standings";
import type { Player, ScheduledMatch } from "../domain/types";
import { useTournament } from "../context/TournamentContext";
import styles from "./StandingsSidebar.module.css";

type Props = {
  players: Player[];
  matches: ScheduledMatch[];
  results: Record<string, string>;
  excludedPlayerIds: string[];
};

export function StandingsSidebar({
  players,
  matches,
  results,
  excludedPlayerIds,
}: Props) {
  const { sidebarCollapsed, setSidebarCollapsed, excludePlayer, canExcludePlayer } =
    useTournament();
  const [pendingExcludePlayerId, setPendingExcludePlayerId] = useState<
    string | null
  >(null);
  const standings = computeStandings(
    players,
    matches,
    results,
    excludedPlayerIds,
  );
  const pendingPlayerName = useMemo(() => {
    if (!pendingExcludePlayerId) return "";
    return (
      players.find((p) => p.id === pendingExcludePlayerId)?.name ?? "Ismeretlen"
    );
  }, [pendingExcludePlayerId, players]);

  return (
    <>
      <aside
        className={styles.aside}
        data-collapsed={sidebarCollapsed ? "true" : "false"}
      >
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-expanded={!sidebarCollapsed}
        >
          {sidebarCollapsed ? "Ranglista" : "Ranglista elrejtése"}
        </button>
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              className={styles.panel}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className={styles.title}>Aktuális ranglista</h3>
              <ol className={styles.rows}>
                {standings.map((row, i) => {
                  const name =
                    players.find((p) => p.id === row.playerId)?.name ?? "?";
                  return (
                    <li
                      key={row.playerId}
                      className={styles.row}
                      data-testid={`standings-row-${row.playerId}`}
                      data-player-name={name}
                    >
                      <span className={styles.rank}>{i + 1}.</span>
                      <span className={styles.pname}>{name}</span>
                      <span className={styles.wins}>{row.wins} győzelem</span>
                      <button
                        type="button"
                        className={styles.excludeBtn}
                        disabled={!canExcludePlayer(row.playerId)}
                        data-testid={`exclude-btn-${row.playerId}`}
                        onClick={() => setPendingExcludePlayerId(row.playerId)}
                      >
                        Kizárás
                      </button>
                    </li>
                  );
                })}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      <AnimatePresence>
        {pendingExcludePlayerId && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
            >
              <h4 className={styles.modalTitle}>Játékos kizárása</h4>
              <p className={styles.modalText}>
                Biztosan kizárod őt: <strong>{pendingPlayerName}</strong>?
                Minden hozzá tartozó meccs törlésre kerül a lebonyolításból.
              </p>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  data-testid="exclude-cancel-btn"
                  onClick={() => setPendingExcludePlayerId(null)}
                >
                  Mégse
                </button>
                <button
                  type="button"
                  className={styles.confirmBtn}
                  data-testid="exclude-confirm-btn"
                  onClick={() => {
                    excludePlayer(pendingExcludePlayerId);
                    setPendingExcludePlayerId(null);
                  }}
                >
                  Kizárás megerősítése
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
