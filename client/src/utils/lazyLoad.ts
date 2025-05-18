/**
 * Utilitários para carregamento preguiçoso e otimização de performance
 */

/**
 * Pré-carrega um componente quando o mouse passa sobre um link
 * @param importFn Função de importação do componente
 */
export function preloadOnHover(importFn: () => Promise<any>): () => void {
  let loadPromise: Promise<any> | null = null;
  
  return () => {
    if (!loadPromise) {
      loadPromise = importFn();
    }
  };
}

/**
 * Define prioridade para carregamento de scripts
 * @param scriptUrls URLs dos scripts a serem pré-carregados
 */
export function preloadScripts(scriptUrls: string[]): void {
  scriptUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Marcação de componentes com baixa prioridade de renderização
 * Útil para componentes que não são críticos para a primeira pintura
 */
export function deferRender(callback: () => void): void {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Prefetches imagens críticas para melhorar LCP (Largest Contentful Paint)
 * @param imageUrls Array de URLs de imagens a serem pré-carregadas
 */
export function preloadCriticalImages(imageUrls: string[]): void {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}