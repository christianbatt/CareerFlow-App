import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker for standalone and offline support
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.update().catch(() => {});
      })
      .catch((err) => {
        console.debug('SW registration skipped or error:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
