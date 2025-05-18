import React, { useEffect, ReactNode, useState } from 'react';
import { useLocation } from 'wouter';

interface OptimizedLayoutProps {
  children: ReactNode;
}

/**
 * OptimizedLayout - Componente de layout que implementa diversas otimizações
 * para melhorar a velocidade percebida durante a navegação entre páginas:
 * 
 * 1. Transições suaves entre páginas
 * 2. Pré-renderização de conteúdo
 * 3. Animações de transição eficientes
 */
const OptimizedLayout: React.FC<OptimizedLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cachedChildren, setCachedChildren] = useState<ReactNode>(children);
  
  // Gerenciar transição entre páginas
  useEffect(() => {
    let isMounted = true;
    
    // Quando a localização muda, inicia transição
    setIsTransitioning(true);
    
    // Mínimo delay para garantir que a animação de fade seja percebida
    const timer = setTimeout(() => {
      if (isMounted) {
        // Atualiza o conteúdo
        setCachedChildren(children);
        
        // Aguarda um frame para garantir que o DOM tenha sido atualizado
        requestAnimationFrame(() => {
          if (isMounted) {
            // Finaliza a transição
            setIsTransitioning(false);
            
            // Scroll para o topo na mudança de página
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      }
    }, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [location, children]);
  
  // Pré-carregar imagens importantes
  useEffect(() => {
    // Buscar todas as imagens visíveis e pré-carregá-las
    const preloadVisibleImages = () => {
      const imgElements = document.querySelectorAll('img[src]:not([data-preloaded])');
      
      imgElements.forEach(img => {
        if (img instanceof HTMLImageElement) {
          const src = img.getAttribute('src');
          if (src) {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.href = src;
            preloadLink.as = 'image';
            document.head.appendChild(preloadLink);
            
            // Marcar como pré-carregada
            img.setAttribute('data-preloaded', 'true');
          }
        }
      });
    };
    
    // Executar após um pequeno atraso para garantir que os elementos estejam no DOM
    if (!isTransitioning) {
      setTimeout(preloadVisibleImages, 200);
    }
  }, [isTransitioning]);
  
  return (
    <div className={`
      transition-opacity duration-150 ease-in-out
      ${isTransitioning ? 'opacity-95' : 'opacity-100'}
    `}>
      {cachedChildren}
    </div>
  );
};

export default OptimizedLayout;