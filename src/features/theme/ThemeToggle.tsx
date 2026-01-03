import { useEffect, useState } from 'react';
import { themeStore, resolveTheme } from './theme.store';
import type { Theme } from './theme.types';
import { classnames } from '@/lib/classnames';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(themeStore.getTheme());
  const resolvedTheme = resolveTheme(theme);

  useEffect(() => {
    const unsubscribe = themeStore.subscribe((newTheme) => {
      setTheme(newTheme);
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    const nextTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
    themeStore.setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={classnames(styles.toggle, styles[resolvedTheme])}
      aria-label={resolvedTheme === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
      title={resolvedTheme === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
    >
      <span className={styles.icon} aria-hidden="true">
        {resolvedTheme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
}

