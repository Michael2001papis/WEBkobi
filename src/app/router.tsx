import { lazy, Suspense } from 'react';
import { createHashRouter } from 'react-router-dom';
import { Shell } from '@/components/Layout/Shell';

const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const Overview = lazy(() => import('@/pages/Overview').then((m) => ({ default: m.Overview })));
const Capabilities = lazy(() => import('@/pages/Capabilities').then((m) => ({ default: m.Capabilities })));
const Trust = lazy(() => import('@/pages/Trust').then((m) => ({ default: m.Trust })));
const Games = lazy(() => import('@/pages/Games').then((m) => ({ default: m.Games })));
const Contact = lazy(() => import('@/pages/Contact').then((m) => ({ default: m.Contact })));
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })));

// eslint-disable-next-line react-refresh/only-export-components
const LoadingFallback = () => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center', 
    color: 'var(--color-text)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    minHeight: '200px',
    justifyContent: 'center'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid var(--color-border)',
      borderTopColor: 'var(--color-primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>טוען...</p>
  </div>
);

export const router = createHashRouter(
  [
    {
      path: '/',
      element: <Shell />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Home />
            </Suspense>
          ),
        },
        {
          path: 'overview',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Overview />
            </Suspense>
          ),
        },
        {
          path: 'capabilities',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Capabilities />
            </Suspense>
          ),
        },
        {
          path: 'trust',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Trust />
            </Suspense>
          ),
        },
        {
          path: 'games',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Games />
            </Suspense>
          ),
        },
        {
          path: 'contact',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Contact />
            </Suspense>
          ),
        },
        {
          path: '*',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <NotFound />
            </Suspense>
          ),
        },
      ],
    },
  ]
);

