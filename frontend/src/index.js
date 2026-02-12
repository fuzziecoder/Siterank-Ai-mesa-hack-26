import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ========== SUPPRESS BROWSER EXTENSION ERRORS ==========
// This MUST run before anything else to catch all extension errors

// Override window.ethereum to prevent MetaMask auto-connect
if (typeof window !== 'undefined') {
  // Prevent MetaMask from auto-connecting
  Object.defineProperty(window, 'ethereum', {
    get() { return undefined; },
    set() { return true; },
    configurable: false
  });
}

// Suppress console errors from extensions
const originalConsoleError = console.error;
console.error = function(...args) {
  const errorStr = args.join(' ');
  if (errorStr.includes('MetaMask') || 
      errorStr.includes('chrome-extension') || 
      errorStr.includes('moz-extension') ||
      errorStr.includes('inpage.js')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Global error handler for extension errors
window.addEventListener('error', (event) => {
  if (event.message?.includes('MetaMask') || 
      event.message?.includes('Failed to connect') ||
      event.filename?.includes('chrome-extension') ||
      event.filename?.includes('inpage.js')) {
    event.stopPropagation();
    event.preventDefault();
    return false;
  }
}, true);

// Handle unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason?.message?.includes('MetaMask') ||
      reason?.message?.includes('Failed to connect') ||
      reason?.stack?.includes('chrome-extension') ||
      reason?.stack?.includes('inpage.js')) {
    event.stopPropagation();
    event.preventDefault();
    return false;
  }
}, true);

// ========== END EXTENSION ERROR SUPPRESSION ==========

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
