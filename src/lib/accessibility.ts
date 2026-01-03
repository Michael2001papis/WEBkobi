// כלי עזר לנגישות
export const a11y = {
  // יצירת ID ייחודי לניהול ARIA
  generateId: (prefix: string = 'a11y'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // בדיקת תמיכה ב-reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};

