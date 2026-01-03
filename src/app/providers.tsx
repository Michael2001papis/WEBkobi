import { useEffect } from 'react';
import { themeStore } from '@/features/theme/theme.store';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    themeStore.init();
  }, []);

  return <>{children}</>;
}

