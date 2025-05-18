import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '../lib/queryClient';

/**
 * Hook que implementa otimizações para navegação mais rápida entre páginas
 */
export function useFastPageLoading() {
  const [location] = useLocation();
  const prevLocationRef = useRef(location);

  // Otimização 1: Prefetch de recursos para páginas que o usuário pode navegar
  useEffect(() => {
    // Função para observar links e pré-carregar recursos quando o mouse passar sobre eles
    const handleLinkHover = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && href !== location) {
          // Carregar dados relacionados à rota para qual o link aponta
          try {
            setTimeout(() => {
              // Lista de endpoints a serem pré-carregados para cada rota
              if (href.includes('/dashboard')) {
                queryClient.prefetchQuery({
                  queryKey: ['/api/dashboard/stats'],
                  staleTime: 5 * 60 * 1000
                });
              } else if (href.includes('/pre-cadastros')) {
                queryClient.prefetchQuery({
                  queryKey: ['/api-diagnostic/pre-cadastros'],
                  staleTime: 2 * 60 * 1000
                });
              }
            }, 100);
          } catch (error) {
            // Ignorar erros de prefetch
          }
        }
      }
    };
    
    // Registrar evento para monitorar hover sobre links
    document.addEventListener('mouseover', handleLinkHover);
    
    return () => {
      document.removeEventListener('mouseover', handleLinkHover);
    };
  }, [location]);

  // Otimização 2: Transição suave entre páginas
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      // Aplicar uma transição suave quando a localização muda
      document.body.style.opacity = '0.98';
      document.body.style.transition = 'opacity 0.15s ease-in-out';
      
      // Restaurar a opacidade após um breve momento
      const timer = setTimeout(() => {
        document.body.style.opacity = '1';
      }, 120);
      
      // Atualizar a referência à localização anterior
      prevLocationRef.current = location;
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  // Otimização 3: Pré-carregar imagens críticas
  useEffect(() => {
    // Função para pré-carregar imagens visíveis na tela
    const preloadVisibleImages = () => {
      // Encontrar todas as imagens visíveis na janela atual
      const viewportHeight = window.innerHeight;
      
      document.querySelectorAll('img[src]:not([data-preloaded="true"])').forEach(img => {
        const rect = img.getBoundingClientRect();
        
        // Se a imagem está visível ou prestes a ser visível ao rolar
        if (rect.top < viewportHeight + 500) {
          if (img instanceof HTMLImageElement) {
            // Marcar como pré-carregada
            img.setAttribute('data-preloaded', 'true');
            
            // Forçar carregamento
            const preloadImg = new Image();
            preloadImg.src = img.src;
          }
        }
      });
    };
    
    // Executar preload inicialmente
    preloadVisibleImages();
    
    // Executar preload durante rolagem
    const handleScroll = () => {
      requestAnimationFrame(preloadVisibleImages);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);
}