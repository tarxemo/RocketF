// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Function to start the app
async function startApp() {
  // Only import the worker in development
  if (process.env.NODE_ENV === 'development') {
    try {
      // Import the worker and start it
      const { startWorker } = await import('./mocks/worker');
      await startWorker();
    } catch (error) {
      console.error('Failed to start mock service worker:', error);
    }
  }

  // Render the app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// Start the application
startApp().catch(console.error);
