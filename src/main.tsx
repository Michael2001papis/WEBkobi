import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { themeStore } from './features/theme/theme.store';
import './styles/globals.css';

// Initialize theme before first render to prevent flash
themeStore.init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

