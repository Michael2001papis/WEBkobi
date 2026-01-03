import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          © {currentYear} M.P.papis. כל הזכויות שמורות.
        </p>
      </div>
    </footer>
  );
}

