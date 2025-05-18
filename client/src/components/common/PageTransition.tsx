import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Componente que adiciona transições suaves entre páginas
 * Melhora a percepção de velocidade durante a navegação
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [content, setContent] = useState<ReactNode>(children);
  
  useEffect(() => {
    // Quando o local muda, iniciamos a transição
    setIsTransitioning(true);
    
    // Curto timeout para permitir a animação iniciar
    const transitionTimeout = setTimeout(() => {
      // Atualizar o conteúdo
      setContent(children);
      
      // Finalizar a transição após um momento
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 100);
    
    return () => clearTimeout(transitionTimeout);
  }, [location, children]);
  
  return (
    <div 
      className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-95' : 'opacity-100'} ${className}`}
      style={{
        willChange: 'opacity',
        backfaceVisibility: 'hidden',
      }}
    >
      {content}
    </div>
  );
}