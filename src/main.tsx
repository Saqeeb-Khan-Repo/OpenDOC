import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Global resilience handler for uncaught async errors and stale chunks
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /failed to fetch dynamically imported module/i.test(error?.message || '') ||
      /error loading dynamically imported module/i.test(error?.message || '');

    if (isChunkError) {
      console.warn('Unhandled dynamic chunk failure detected. Reloading for latest build...');
      const lastReload = sessionStorage.getItem('docflow_last_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('docflow_last_chunk_reload', now.toString());
        window.location.reload();
      }
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
