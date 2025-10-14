// This file configures the mock service worker for API requests during development.
// It helps simulate API responses without needing a real backend server.

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// Export a function to start the worker
export async function startWorker() {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
  console.log('MSW worker started');
}
