// כלי עזר לניהול RTL
export const rtl = {
  isRTL: (lang: string = 'he'): boolean => {
    return lang === 'he' || lang === 'ar';
  },

  getDir: (lang: string = 'he'): 'rtl' | 'ltr' => {
    return rtl.isRTL(lang) ? 'rtl' : 'ltr';
  },
};

