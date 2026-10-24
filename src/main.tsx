import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((reg) => {
        console.log('Retaj Today PWA ServiceWorker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('PWA ServiceWorker registration error:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
