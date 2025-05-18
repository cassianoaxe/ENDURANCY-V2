/**
 * Utilitários para pré-carregamento de recursos entre navegações
 */
import { queryClient } from '../lib/queryClient';

// Mapeamento de rotas para recursos que devem ser pré-carregados
const ROUTE_RESOURCES_MAP: Record<string, string[]> = {
  '/dashboard': [
    '/api/dashboard/stats', 
    '/api/notifications',
    '/api/modules'
  ],
  '/pre-cadastros': [
    '/api-diagnostic/pre-cadastros',
    '/api/plans'
  ],
  '/organization': [
    '/api/organization/stats',
    '/api/organization-modules',
    '/api/organization/users'
  ],
  '/patient': [
    '/api/patient/stats',
    '/api/patient/appointments'
  ],
  '/doctor': [
    '/api/doctor/stats',
    '/api/doctor/patients',
    '/api/doctor/appointments'
  ]
};

/**
 * Pré-carrega recursos associados a uma rota específica
 * @param route Rota atual ou rota para a qual se está navegando
 * @returns Promise que resolve quando os recursos são pré-carregados
 */
export async function prefetchResourcesForRoute(route: string): Promise<void> {
  // Encontrar a melhor correspondência de rota no mapa
  const matchedRouteKey = Object.keys(ROUTE_RESOURCES_MAP).find(
    routeKey => route.startsWith(routeKey)
  );
  
  if (!matchedRouteKey) return;
  
  const resources = ROUTE_RESOURCES_MAP[matchedRouteKey];
  
  // Usar Promise.allSettled para não falhar se um dos endpoints não estiver disponível
  await Promise.allSettled(
    resources.map(endpoint => 
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        staleTime: 10 * 60 * 1000, // 10 minutos (consistente com a configuração do queryClient)
      })
    )
  );
}

/**
 * Detecta links de navegação no viewport e pré-carrega recursos das possíveis
 * rotas de destino para melhorar a experiência de navegação
 */
export function prefetchResourcesForVisibleLinks(): void {
  if (!('IntersectionObserver' in window)) return;
  
  // Criar um observer para detectar links visíveis
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Para cada link que se torna visível na tela
      if (entry.isIntersecting && entry.target instanceof HTMLAnchorElement) {
        const href = entry.target.getAttribute('href');
        
        // Ignorar links externos ou sem href
        if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
        
        // Pré-carregar recursos para a rota do link
        prefetchResourcesForRoute(href).catch(() => {
          // Ignorar erros de prefetch silenciosamente
        });
        
        // Parar de observar este link depois de pré-carregar
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1 // Trigger quando pelo menos 10% do elemento está visível
  });
  
  // Observar todos os links de navegação interna
  document.querySelectorAll('a[href^="/"]').forEach(link => {
    observer.observe(link);
  });
}

/**
 * Limpa o cache de recursos não utilizados para otimizar a memória
 * Esta função deve ser chamada apenas quando o navegador estiver ocioso
 */
export function pruneUnusedCache(): void {
  // Verificar suporte para requestIdleCallback
  if (typeof window.requestIdleCallback !== 'function') return;
  
  // Executar limpeza quando o navegador estiver ocioso
  window.requestIdleCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        // Manter apenas queries ativas ou recentes
        const isActive = query.isActive();
        const isRecent = query.state.dataUpdatedAt > Date.now() - 60 * 60 * 1000; // 1 hora
        
        // Remover do cache apenas queries inativas e antigas
        return !isActive && !isRecent;
      }
    });
  });
}