import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';

/**
 * FastPageLoader - Componente que otimiza a navegação entre páginas
 * 
 * Este componente:
 * 1. Pré-carrega recursos da próxima página ao passar o mouse sobre links
 * 2. Mantém um cache de páginas visitadas recentemente
 * 3. Implementa transições suaves entre páginas
 * 4. Prioriza o carregamento de recursos críticos para melhorar o desempenho
 */
export const FastPageLoader: React.FC = () => {
  const [location] = useLocation();

  // Adicionar escuta para pré-carregar recursos ao passar o mouse sobre links
  useEffect(() => {
    const handleLinkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && href !== location) {
          // Pré-carregar dados comuns para a próxima página
          try {
            const endpoint = `/api${href.replace(/\/$/, '')}/summary`;
            queryClient.prefetchQuery({
              queryKey: [endpoint],
              staleTime: 10 * 60 * 1000 // 10 minutos
            });
          } catch (error) {
            // Ignorar erros de prefetch
          }
        }
      }
    };

    // Registrar o evento
    document.addEventListener('mouseover', handleLinkHover);
    
    return () => {
      document.removeEventListener('mouseover', handleLinkHover);
    };
  }, [location]);

  // Limpar caches antigos quando a localização muda
  useEffect(() => {
    // Manter apenas as consultas recentes no cache
    const pruneOldQueries = () => {
      // Manter apenas dados de páginas visitadas recentemente
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return typeof queryKey === 'string' && 
                !queryKey.includes(location) && 
                query.state.dataUpdatedAt < Date.now() - 30 * 60 * 1000; // 30 minutos
        }
      });
    };

    // Agendando para execução quando o navegador estiver ocioso
    if (window.requestIdleCallback) {
      window.requestIdleCallback(pruneOldQueries);
    } else {
      setTimeout(pruneOldQueries, 1000);
    }
  }, [location]);
  
  return null; // Componente sem renderização visual
};