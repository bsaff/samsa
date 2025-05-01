import styles from "./styles.module.css";

const Navbar = () => {
  return (
    <nav className={styles.wrapper}>
      <div className={styles.logoWrapper}>
        <img src="/samsa_logo.png" alt="Samsa Logo" className={styles.logo} />
      </div>
    </nav>
  );
};

export default Navbar;
