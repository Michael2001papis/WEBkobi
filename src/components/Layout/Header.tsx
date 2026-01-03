import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { classnames } from '@/lib/classnames';
import { ThemeToggle } from '@/features/theme/ThemeToggle';
import styles from './Header.module.css';

const navItems = [
  { path: '/', label: 'בית' },
  { path: '/overview', label: 'סקירה' },
  { path: '/capabilities', label: 'יכולות' },
  { path: '/trust', label: 'אמון' },
  { path: '/games', label: 'משחקים' },
  { path: '/contact', label: 'צור קשר' },
];

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    handleCloseMobileMenu();
  }, [location.pathname, handleCloseMobileMenu]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        handleCloseMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen, handleCloseMobileMenu]);

  return (
    <header className={classnames(styles.header, isScrolled && styles.scrolled)}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label="M.P.papis - דף הבית">
          M.P.papis
        </Link>

        <nav className={styles.nav} aria-label="ניווט ראשי">
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={classnames(
                    styles.navLink,
                    location.pathname === item.path && styles.active
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={handleToggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'סגור תפריט' : 'פתח תפריט'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className={styles.hamburgerIcon}>
              <span className={classnames(styles.hamburgerLine, isMobileMenuOpen && styles.open)} />
              <span className={classnames(styles.hamburgerLine, isMobileMenuOpen && styles.open)} />
              <span className={classnames(styles.hamburgerLine, isMobileMenuOpen && styles.open)} />
            </span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className={styles.mobileMenuOverlay}
            onClick={handleCloseMobileMenu}
            aria-hidden="true"
          />
          <nav
            id="mobile-menu"
            className={styles.mobileMenu}
            aria-label="ניווט ראשי - מובייל"
          >
            <ul className={styles.mobileNavList}>
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={classnames(
                      styles.mobileNavLink,
                      location.pathname === item.path && styles.active
                    )}
                    onClick={handleCloseMobileMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}

