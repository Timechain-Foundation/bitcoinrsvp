import LogoSvg from "../svg/LogoSvg";
import styles from "./Nav.module.css";

function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.leftAligned}>
        <LogoSvg className={styles.svg} />
        <p className={styles.logoText}>BTC RSVP</p>
      </div>
      <div className={styles.rightAligned}>
        <button className={styles.loginButton}>Login</button>
      </div>
    </nav>
  );
}

export default Nav;
