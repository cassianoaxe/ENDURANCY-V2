import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error handling to identify where the error is happening
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error handler caught:', { message, source, lineno, colno });
  console.error('Error stack:', error?.stack);
  return false;
};

// Add unhandled rejection handler to catch promise errors
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled Promise Rejection:', event.reason);
  if (event.reason instanceof Error) {
    console.error('Rejection Stack:', event.reason.stack);
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);