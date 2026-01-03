import { storage } from '@/lib/storage';
import type { Theme, ResolvedTheme } from './theme.types';

const THEME_STORAGE_KEY = 'brand-theme';

// קביעת ערכת נושא לפי העדפת המערכת
function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// פתרון ערכת נושא סופית (light/dark)
export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

// ניהול מצב ערכת הנושא
class ThemeStore {
  private listeners: Set<(theme: Theme) => void> = new Set();
  private currentTheme: Theme;

  constructor() {
    this.currentTheme = storage.get<Theme>(THEME_STORAGE_KEY, 'system');
    this.setupSystemListener();
  }

  // האזנה לשינוי העדפת המערכת
  private setupSystemListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.currentTheme === 'system') {
        this.notifyListeners();
      }
    });
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  getResolvedTheme(): ResolvedTheme {
    return resolveTheme(this.currentTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    storage.set(THEME_STORAGE_KEY, theme);
    this.notifyListeners();
    this.applyTheme();
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentTheme));
  }

  private applyTheme(): void {
    const resolved = this.getResolvedTheme();
    document.documentElement.setAttribute('data-theme', resolved);
  }

  init(): void {
    this.applyTheme();
  }
}

export const themeStore = new ThemeStore();

