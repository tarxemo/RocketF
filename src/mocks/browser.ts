// For MSW v2+
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// If you're using MSW v1.x, use this instead:
// import { setupWorker } from 'msw';
// import { handlers } from './handlers';
// export const worker = setupWorker(...handlers);