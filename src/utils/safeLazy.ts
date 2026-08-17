import { lazy, ComponentType } from 'react';

/**
 * Resilient lazy-loading wrapper that catches stale chunk / network fetch errors
 * and retries dynamically before giving up.
 */
export function safeLazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  pageName = 'Page'
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      console.warn(`Initial dynamic import for ${pageName} failed, retrying...`, error);

      // Check if it's a ChunkLoadError / dynamic import fetch error
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        /failed to fetch dynamically imported module/i.test(error?.message || '') ||
        /error loading dynamically imported module/i.test(error?.message || '');

      if (isChunkError) {
        // Retry once after 600ms
        try {
          await new Promise(res => setTimeout(res, 600));
          return await factory();
        } catch (retryError) {
          console.error(`Second dynamic import attempt for ${pageName} failed:`, retryError);
          // Check if we haven't reloaded recently for a new build
          const lastReload = sessionStorage.getItem('docflow_last_chunk_reload');
          const now = Date.now();
          if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
            sessionStorage.setItem('docflow_last_chunk_reload', now.toString());
            window.location.reload();
            // Return an empty component while reloading
            return { default: (() => null) as unknown as T };
          }
          throw retryError;
        }
      }

      throw error;
    }
  });
}
