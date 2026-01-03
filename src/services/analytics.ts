// Analytics stub - להרחבה עתידית
export const analytics = {
  track: (event: string, data?: Record<string, unknown>): void => {
    // Placeholder - ניתן להוסיף Google Analytics, Mixpanel וכו'
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, data);
    }
  },

  pageView: (path: string): void => {
    analytics.track('page_view', { path });
  },
};

