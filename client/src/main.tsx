import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

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

// Helper para detectar se temos tema inicial salvo antes de renderização
function applyInitialTheme() {
  // Verificar se há um tema salvo
  const savedTheme = localStorage.getItem('theme');
  const root = document.documentElement;
  
  if (savedTheme === 'dark') {
    root.classList.add('dark');
  } else if (savedTheme === 'light') {
    root.classList.add('light');
  } else {
    // Para 'system' ou null, verificar a preferência do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
  }
}

// Aplicar o tema inicial antes da renderização 
// para evitar flash de tela branca
applyInitialTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);