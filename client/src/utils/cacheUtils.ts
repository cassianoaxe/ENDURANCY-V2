/**
 * Utilitários para otimizar o cache e carregamento de recursos
 */
import { queryClient } from '../lib/queryClient';

/**
 * Define o tempo máximo (em ms) que um recurso deve permanecer no cache
 * antes de ser considerado obsoleto
 */
const CACHE_TTL = {
  SHORT: 2 * 60 * 1000, // 2 minutos
  MEDIUM: 5 * 60 * 1000, // 5 minutos
  LONG: 15 * 60 * 1000  // 15 minutos
};

/**
 * Mapeamento de endpoints para suas categorias de cache
 */
const ENDPOINT_CACHE_MAPPING: Record<string, number> = {
  // Dados que raramente mudam (15 minutos)
  '/api/modules': CACHE_TTL.LONG,
  '/api/plans': CACHE_TTL.LONG,
  '/api/organizations': CACHE_TTL.LONG,
  
  // Dados que mudam ocasionalmente (5 minutos)
  '/api/dashboard/stats': CACHE_TTL.MEDIUM,
  '/api/organization-modules': CACHE_TTL.MEDIUM,
  
  // Dados que mudam frequentemente (2 minutos)
  '/api/notifications': CACHE_TTL.SHORT,
  '/api-diagnostic/pre-cadastros': CACHE_TTL.SHORT
};

/**
 * Recursos agrupados por rota para pré-carregamento otimizado
 */
const ROUTE_RESOURCES: Record<string, string[]> = {
  '/dashboard': [
    '/api/dashboard/stats',
    '/api/notifications',
    '/api/modules'
  ],
  '/pre-cadastros': [
    '/api-diagnostic/pre-cadastros',
    '/api/plans'
  ],
  '/organization/dashboard': [
    '/api/organization/stats',
    '/api/organization/users',
    '/api/organization-modules'
  ]
};

/**
 * Pré-carrega recursos para uma rota específica
 * @param route Rota para a qual os recursos serão pré-carregados
 */
export async function prefetchResourcesForRoute(route: string): Promise<void> {
  // Encontra a correspondência da rota ou usa uma rota padrão
  const matchingRoute = Object.keys(ROUTE_RESOURCES).find(r => 
    route.startsWith(r)
  ) || '/dashboard';
  
  if (matchingRoute) {
    // Lista de recursos a serem pré-carregados
    const resources = ROUTE_RESOURCES[matchingRoute];
    
    // Pré-carregar cada recurso com configurações de cache apropriadas
    for (const resource of resources) {
      const ttl = ENDPOINT_CACHE_MAPPING[resource] || CACHE_TTL.MEDIUM;
      
      try {
        await queryClient.prefetchQuery({
          queryKey: [resource],
          staleTime: ttl
        });
      } catch (error) {
        // Ignorar erros de prefetch para não bloquear o carregamento da página
        console.warn(`Erro ao pré-carregar recurso ${resource}:`, error);
      }
    }
  }
}

/**
 * Limpa cache antigo ou desnecessário para otimizar memória
 */
export function pruneCache(): void {
  // Execute apenas quando o navegador estiver ocioso
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      // Invalidar queries antigas para liberar memória
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          if (typeof key !== 'string') return false;
          
          // Obtém o TTL apropriado para este endpoint
          let cacheTTL = CACHE_TTL.MEDIUM; // Padrão médio
          for (const endpoint in ENDPOINT_CACHE_MAPPING) {
            if (key.includes(endpoint)) {
              cacheTTL = ENDPOINT_CACHE_MAPPING[endpoint];
              break;
            }
          }
          
          // Verificar se está obsoleto com base no TTL
          const isStale = query.state.dataUpdatedAt < Date.now() - cacheTTL;
          
          // Descartar se estiver obsoleto E não estiver sendo usado atualmente
          return isStale && !query.isActive();
        }
      });
    });
  }
}