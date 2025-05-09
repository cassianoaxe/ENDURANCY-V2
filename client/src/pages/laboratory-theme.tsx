import React, { useEffect } from 'react';

/**
 * Componente ThemeProvider que injeta estilos globais para melhorar o contraste 
 * e a legibilidade do Portal do Laboratório.
 * 
 * Este componente deve ser usado nas páginas do laboratório para garantir
 * que nenhum texto fique branco ou com baixo contraste.
 */
export function LaboratoryThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Adiciona um elemento style com alta especificidade para sobrescrever quaisquer
    // classes Tailwind que possam estar causando problemas de contraste
    const styleElement = document.createElement('style');
    styleElement.setAttribute('id', 'laboratory-theme-override');
    
    // Estilos com alta especificidade usando !important para garantir que sejam aplicados
    styleElement.innerHTML = `
      /* Corrigir texto branco - escala de cinza */
      .laboratory-theme .text-white,
      .laboratory-theme span.text-white,
      .laboratory-theme p.text-white,
      .laboratory-theme div.text-white,
      .laboratory-theme h1.text-white,
      .laboratory-theme h2.text-white,
      .laboratory-theme h3.text-white {
        color: #1a202c !important;
      }
      
      /* Corrigir texto cinza claro */
      .laboratory-theme .text-gray-100,
      .laboratory-theme .text-gray-200,
      .laboratory-theme .text-gray-300,
      .laboratory-theme span.text-gray-100,
      .laboratory-theme span.text-gray-200,
      .laboratory-theme span.text-gray-300,
      .laboratory-theme p.text-gray-100,
      .laboratory-theme p.text-gray-200,
      .laboratory-theme p.text-gray-300 {
        color: #4b5563 !important;
      }
      
      /* Melhorar contraste em texto secundário */
      .laboratory-theme .text-gray-400,
      .laboratory-theme .text-gray-500,
      .laboratory-theme span.text-gray-400,
      .laboratory-theme span.text-gray-500,
      .laboratory-theme p.text-gray-400,
      .laboratory-theme p.text-gray-500 {
        color: #374151 !important;
      }
      
      /* Garantir contraste em componentes específicos */
      .laboratory-theme .badge,
      .laboratory-theme .badge span,
      .laboratory-theme .card-title,
      .laboratory-theme .card-header {
        color: #1a202c !important;
      }
      
      /* Melhorar texto em áreas visuais específicas */
      .laboratory-theme .card-content,
      .laboratory-theme .card-description {
        color: #4b5563 !important;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    // Função de limpeza para remover o estilo quando o componente for desmontado
    return () => {
      const existingStyle = document.getElementById('laboratory-theme-override');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
  
  return (
    <div className="laboratory-theme">
      {children}
    </div>
  );
}

export default LaboratoryThemeProvider;