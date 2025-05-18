import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '../../lib/queryClient';

/**
 * Componente para otimizar a navegação entre páginas
 * 
 * Este componente:
 * 1. Aplica transições suaves entre páginas
 * 2. Pré-carrega dados comuns utilizados em várias páginas
 * 3. Implementa scroll suave para o topo quando navega entre páginas
 */
export default function OptimizedNavigation() {
  const [location] = useLocation();
  
  // Aplicar transição suave quando a localização muda
  useEffect(() => {
    // Aplicar fade para melhorar a experiência de navegação
    if (document.body) {
      document.body.style.transition = 'opacity 150ms ease-in-out';
      document.body.style.opacity = '0.95';
      
      // Restaurar opacidade após um curto período
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
      
      // Rolar suavemente para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Pré-carregar dados comuns
    const prefetchCommonData = () => {
      // Lista de recursos comuns a pré-carregar
      const commonResources = [
        '/api/notifications',
        '/api/modules'
      ];
      
      // Recursos específicos baseados no caminho atual
      if (location.includes('dashboard')) {
        commonResources.push('/api/dashboard/stats');
      } else if (location.includes('pre-cadastros')) {
        commonResources.push('/api-diagnostic/pre-cadastros');
      }
      
      // Executar prefetch
      commonResources.forEach(resource => {
        queryClient.prefetchQuery({
          queryKey: [resource],
          staleTime: 5 * 60 * 1000 // 5 minutos
        }).catch(() => {
          // Ignorar erros de prefetch
        });
      });
    };
    
    // Executar o prefetch com um leve atraso
    const timer = setTimeout(prefetchCommonData, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [location]);
  
  // Componente não renderiza nada visualmente
  return null;
}