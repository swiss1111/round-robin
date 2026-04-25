import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import styles from "./Footer.module.css";

export function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer className={styles.footer}>
        <p className={styles.text}>
          Ezt a weblapot Martin csinálta Dávidnak a ping pong bajnokságra.
        </p>
        <button
          type="button"
          className={styles.infoButton}
          data-testid="footer-info-btn"
          onClick={() => setOpen(true)}
        >
          Hogyan működik a round-robin?
        </button>
      </footer>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
            >
              <h3 className={styles.title} data-testid="footer-modal-title">
                Hogyan állnak össze a meccsek?
              </h3>
              <p className={styles.body}>
                A round-robin (körmérkőzés) lényege, hogy minden játékos sorban
                találkozik mindenki mással pontosan egyszer.
              </p>
              <p className={styles.body}>
                Így igazságosabb az eredmény, mert nem csak néhány ellenfél
                alapján dől el a sorrend, hanem mindenki ugyanannyi
                lehetőséget kap.
              </p>
              <p className={styles.body}>
                A végső ranglista a győzelmek számából áll össze: akinek több
                győzelme van, előrébb végez.
              </p>
              <button
                type="button"
                className={styles.closeButton}
                data-testid="footer-modal-close-btn"
                onClick={() => setOpen(false)}
              >
                Bezárás
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
