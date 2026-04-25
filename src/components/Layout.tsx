import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./Layout.module.css";

export function Layout() {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.mainWrap}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
