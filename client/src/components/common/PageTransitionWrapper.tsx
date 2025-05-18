import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

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
      });
    }, 80); // Delay curto para não atrasar muito a navegação
    
    return () => clearTimeout(timer);
  }, [location, children]);

  // Scrollar para o topo suavemente ao navegar entre páginas
  useEffect(() => {
    if (!isTransitioning) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
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