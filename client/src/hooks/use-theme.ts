import { useState, useEffect } from 'react';

// Tipo do tema
type Theme = 'light' | 'dark' | 'system';

// Opções de mídia para detectar preferência do sistema
const MEDIA = '(prefers-color-scheme: dark)';

/**
 * Hook para gerenciar o tema da aplicação (claro/escuro)
 * Armazena a preferência no localStorage e sincroniza com as classes do DOM
 */
export function useTheme() {
  // Define o estado inicial com base no localStorage ou preferência do sistema
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      return storedTheme || 'light';
    }
    return 'light';
  });

  // Efeito para aplicar o tema escolhido
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove todas as classes de tema
    root.classList.remove('light', 'dark');
    
    // Aplica a classe do tema selecionado
    if (theme === 'system') {
      const systemTheme = window.matchMedia(MEDIA).matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Salva a preferência no localStorage
    window.localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Retorna o tema atual e função para alterá-lo
  return { theme, setTheme };
}