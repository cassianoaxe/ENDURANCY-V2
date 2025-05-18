/**
 * Utilitários para pré-carregar dados e recursos
 */
import { queryClient } from '../lib/queryClient';

// Lista de recursos comuns que podem ser pré-carregados
const COMMON_RESOURCES = [
  '/api/notifications',
  '/api/modules',
  '/api/plans',
];

// Recursos específicos por papel de usuário
const ROLE_SPECIFIC_RESOURCES: Record<string, string[]> = {
  admin: [
    '/api/organizations',
    '/api/tickets/summary',
    '/api/dashboard/stats'
  ],
  org_admin: [
    '/api/organization/users',
    '/api/organization/stats',
    '/api/organization/modules'
  ],
  pharmacist: [
    '/api/pharmacist/inventory',
    '/api/pharmacist/orders/pending',
    '/api/pharmacist/dashboard/stats'
  ],
  doctor: [
    '/api/doctor/appointments/upcoming',
    '/api/doctor/patients'
  ],
  patient: [
    '/api/patient/prescriptions',
    '/api/patient/orders'
  ]
};

/**
 * Pré-carrega recursos comuns usados em várias páginas
 * Isso melhora o tempo de carregamento entre navegações
 */
export function prefetchCommonResources(): void {
  COMMON_RESOURCES.forEach(resource => {
    queryClient.prefetchQuery({
      queryKey: [resource],
      staleTime: 5 * 60 * 1000 // 5 minutos
    });
  });
}

/**
 * Pré-carrega recursos específicos para o papel do usuário
 * @param userRole Papel do usuário atual
 */
export function prefetchRoleSpecificResources(userRole: string): void {
  // Primeiro carrega recursos comuns
  prefetchCommonResources();
  
  // Depois carrega recursos específicos do papel
  const resources = ROLE_SPECIFIC_RESOURCES[userRole] || [];
  
  resources.forEach(resource => {
    queryClient.prefetchQuery({
      queryKey: [resource],
      staleTime: 5 * 60 * 1000 // 5 minutos
    });
  });
}

/**
 * Pré-carrega recursos necessários para uma rota específica
 * @param route Rota para a qual os recursos serão pré-carregados
 */
export function prefetchRouteResources(route: string): void {
  // Mapeamento de rotas para recursos necessários
  const routeResourcesMap: Record<string, string[]> = {
    '/dashboard': [
      '/api/dashboard/stats',
      '/api/notifications'
    ],
    '/pre-cadastros': [
      '/api/pre-cadastros',
      '/api/pre-cadastros/stats'
    ],
    '/pharmacist/dashboard': [
      '/api/pharmacist/dashboard/stats',
      '/api/pharmacist/inventory/low-stock'
    ],
    '/organization/dashboard': [
      '/api/organization/stats',
      '/api/organization/users'
    ]
  };
  
  // Encontra a rota mais específica que corresponde ao caminho atual
  const matchingRoute = Object.keys(routeResourcesMap)
    .find(r => route.startsWith(r));
  
  if (matchingRoute) {
    const resources = routeResourcesMap[matchingRoute];
    resources.forEach(resource => {
      queryClient.prefetchQuery({
        queryKey: [resource],
        staleTime: 5 * 60 * 1000 // 5 minutos
      });
    });
  }
}