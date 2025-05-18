import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '../../lib/queryClient';

/**
 * Componente que otimiza o carregamento de páginas sem interferir no fluxo do app
 * Implementa:
 * 1. Transições suaves entre páginas com opacidade
 * 2. Pré-carregamento de recursos comuns
 * 3. Scroll automático para o topo ao navegar
 */
const PageLoader: React.FC = () => {
  const [location] = useLocation();
  
  // Efeito para melhorar a transição entre páginas
  useEffect(() => {
    // Criar uma transição suave de opacidade no body
    const applyTransition = () => {
      if (document.body) {
        // Aplicar transição
        document.body.style.transition = 'opacity 150ms ease-in-out';
        document.body.style.opacity = '0.98';
        
        // Restaurar opacidade após um momento
        setTimeout(() => {
          document.body.style.opacity = '1';
        }, 120);
        
        // Scroll suave para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    // Aplicar a transição
    applyTransition();
    
    // Opcionalmente, pré-carregar dados comuns
    const prefetchCommonData = () => {
      // Lista de endpoints comuns que podem ser pré-carregados
      const commonEndpoints = [
        '/api/notifications',
        '/api/modules'
      ];
      
      // Endpoints específicos baseados na rota atual
      if (location.includes('dashboard')) {
        commonEndpoints.push('/api/dashboard/stats');
      } else if (location.includes('pre-cadastros')) {
        commonEndpoints.push('/api-diagnostic/pre-cadastros');
      }
      
      // Pré-carregar cada endpoint
      commonEndpoints.forEach(endpoint => {
        try {
          queryClient.prefetchQuery({
            queryKey: [endpoint],
            staleTime: 5 * 60 * 1000 // 5 minutos
          });
        } catch (error) {
          // Ignorar erros de prefetch
        }
      });
    };
    
    // Executar o prefetch com um pequeno atraso
    const prefetchTimer = setTimeout(prefetchCommonData, 300);
    
    return () => {
      clearTimeout(prefetchTimer);
    };
  }, [location]);
  
  // Este componente não renderiza nada visualmente
  return null;
};

export default PageLoader;