import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress MetaMask console errors from browser extension
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('MetaMask')) {
    e.preventDefault();
    return true;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && e.reason.message.includes('MetaMask')) {
    e.preventDefault();
    return true;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
