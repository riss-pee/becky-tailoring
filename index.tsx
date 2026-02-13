
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim process.env for browser environments to prevent crashes
// when accessing process.env.API_KEY in geminiService
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
