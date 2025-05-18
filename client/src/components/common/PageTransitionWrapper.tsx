import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '../../lib/queryClient';
import { prefetchResourcesForRoute, prefetchResourcesForVisibleLinks, pruneUnusedCache } from '../../utils/prefetchUtils';

interface PageTransitionWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Componente que envolve conteúdo de página e aplica transições suaves
 * durante a navegação, melhorando a experiência de carregamento
 */
const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [content, setContent] = useState<ReactNode>(children);

  // Referência para verificar se é a primeira renderização
  const isFirstRender = useRef(true);
  
  // Efeito para configurar pré-carregamento na primeira renderização
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      // Pré-carregar recursos para a rota inicial
      prefetchResourcesForRoute(location).catch(() => {
        // Silenciosamente ignorar erros de prefetch
      });
      
      // Configurar observador para pré-carregar recursos de links visíveis
      setTimeout(() => {
        prefetchResourcesForVisibleLinks();
      }, 1000);
      
      // Configurar limpeza periódica de cache não utilizado
      const intervalId = setInterval(pruneUnusedCache, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [location]);
  
  // Efeito para lidar com transições de página
  useEffect(() => {
    // Quando a localização muda, inicia a transição
    setIsTransitioning(true);
    
    // Pequeno delay para que a animação de fade seja perceptível
    const timer = setTimeout(() => {
      // Atualiza o conteúdo com os novos elementos da página
      setContent(children);
      
      // Finaliza a transição após um momento para que a renderização ocorra
      requestAnimationFrame(() => {
        setIsTransitioning(false);
        
        // Pré-carregar recursos para a nova localização após a transição
        prefetchResourcesForRoute(location).catch(() => {
          // Silenciosamente ignorar erros de prefetch
        });
      });
    }, 80); // Delay curto para não atrasar muito a navegação
    
    return () => clearTimeout(timer);
  }, [location, children]);

  // Scrollar para o topo suavemente ao navegar entre páginas
  useEffect(() => {
    if (!isTransitioning) {
      // Rolar suavemente para o topo
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Após a renderização da página, observar novos links para pré-carregamento
      setTimeout(() => {
        prefetchResourcesForVisibleLinks();
      }, 500);
    }
  }, [isTransitioning]);

  return (
    <div 
      className={`
        transition-opacity duration-150 ease-in-out
        ${isTransitioning ? 'opacity-95' : 'opacity-100'}
        ${className}
      `}
      style={{
        willChange: 'opacity',
        backfaceVisibility: 'hidden',
      }}
    >
      {content}
    </div>
  );
};

export default PageTransitionWrapper;