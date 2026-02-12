import React from "react";
import ReactDOM from "react-dom/client";

// Suppress errors from browser extensions (MetaMask, etc.)
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.toString?.().includes('MetaMask') || 
      args[0]?.toString?.().includes('chrome-extension')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Suppress uncaught extension errors
window.addEventListener('error', (event) => {
  if (event.message?.includes('MetaMask') || 
      event.filename?.includes('chrome-extension')) {
    event.preventDefault();
    return true;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('MetaMask') ||
      event.reason?.stack?.includes('chrome-extension')) {
    event.preventDefault();
    return true;
  }
});
import "@/index.css";
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
