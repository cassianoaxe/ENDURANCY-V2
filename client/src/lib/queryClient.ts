import { QueryClient } from "@tanstack/react-query";

// Default query function for React Query with improved typing
const defaultQueryFn = async ({ queryKey }: { queryKey: unknown[] }) => {
  // The first item in the query key should be the endpoint URL
  const endpoint = Array.isArray(queryKey[0]) ? queryKey[0][0] : queryKey[0];
  
  if (typeof endpoint !== 'string') {
    throw new Error('Query key must be a string URL');
  }

  // Check cache for frequently used endpoints
  const cachedEndpoints = [
    '/api/plans', 
    '/api/organizations', 
    '/api/modules', 
    '/api/notifications',
    '/api/dashboard/stats',
    '/api/organization-modules',
    '/api-diagnostic/pre-cadastros'
  ];
  const shouldUseCache = cachedEndpoints.includes(endpoint);
  
  const cacheOptions: RequestInit = shouldUseCache 
    ? { cache: 'force-cache' } 
    : { cache: 'no-store' };

  try {
    const response = await fetch(endpoint, {
      credentials: 'include',
      ...cacheOptions
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn as any,  // Corrigir erro de tipagem com type assertion
      retry: 1,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
      refetchOnWindowFocus: false, // Não recarregar automaticamente ao focar a janela
      refetchOnMount: false, // Não recarregar ao montar o componente para reduzir requisições
      staleTime: 10 * 60 * 1000, // 10 minutos para considerar os dados obsoletos (aumentado)
      gcTime: 60 * 60 * 1000, // 60 minutos para garbage collection (aumentado)
      refetchInterval: false, // Desabilitar refetch automático por tempo
    },
  },
});

interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  includeCredentials?: boolean;
}

// Armazenar o token CSRF após obtê-lo
let csrfToken = '';


/**
 * Obter o token CSRF do servidor
 * Esta função será chamada automaticamente quando necessário
 */
async function fetchCsrfToken(): Promise<string> {
  // Se já temos o token, retorná-lo
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await fetch('/api/csrf-token');
    
    if (!response.ok) {
      throw new Error('Falha ao obter token CSRF');
    }
    
    const data = await response.json();
    if (data && typeof data.csrfToken === 'string') {
      csrfToken = data.csrfToken;
      return data.csrfToken; // Retorna diretamente o valor do token
    }
    
    throw new Error('Token CSRF não encontrado na resposta');
  } catch (error) {
    console.error('Erro ao obter token CSRF:', error);

    throw new Error('Falha ao obter token CSRF');
  }
}

/**
 * Função utilitária para requisições à API com suporte a CSRF
 * @param url URL da requisição
 * @param method Método HTTP opcional (GET, POST, etc)
 * @param data Dados opcionais para enviar na requisição
 * @returns Resposta JSON da API
 */
export async function apiRequest(url: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', data?: any): Promise<any>;
export async function apiRequest(url: string, options?: ApiRequestOptions): Promise<any>;
export async function apiRequest(
  url: string, 
  methodOrOptions?: string | ApiRequestOptions, 
  data?: any
): Promise<any> {
  // Configuração da requisição de forma simplificada
  let options: ApiRequestOptions;
  
  if (typeof methodOrOptions === 'string') {
    options = { method: methodOrOptions as any, data };
  } else {
    options = methodOrOptions || { method: 'GET' };
  }
  
  const { method, data: requestData, headers = {}, includeCredentials = true } = options;
  
  // Verificar se a URL é para API de autenticação ou logout
  const isAuthRelated = url.includes('/api/auth/');
  
  // Para requisições não relacionadas a autenticação, verificar o cache em localStorage
  if (method === 'GET' && !isAuthRelated) {
    const cacheKey = `api_cache_${url}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_time`);
    const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutos
    
    // Se temos um cache válido, retornar os dados sem fazer requisição
    if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < CACHE_MAX_AGE) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.warn('Erro ao parsear cache da API:', e);
      }
    }
  }
  
  // Configuração base da requisição
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    },
    credentials: includeCredentials ? 'include' : 'same-origin'
  };

  // Adicionar corpo da requisição se necessário
  if (data) {
    requestOptions.body = JSON.stringify(data);
  }
  
  // Adicionar um controle de timeout para evitar requisições que nunca respondem
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout
  requestOptions.signal = controller.signal;

  try {
    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);
    
    const contentType = response.headers.get('content-type');
    
    // Tratamento de erros simplificado
    if (!response.ok) {
      // Tratamento especial para erros de autenticação
      if (response.status === 401 && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
        throw new Error('Sessão expirada. Redirecionando para login...');
      }
      
      // Extrair mensagem de erro
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    // Processar resposta de sucesso
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      
      // Armazenar em cache para requisições GET não relacionadas a autenticação
      if (method === 'GET' && !isAuthRelated) {
        const cacheKey = `api_cache_${url}`;
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
      }
      
      return data;
    }
    
    return {};
  } catch (error: any) {
    // Tratar erros de timeout
    if (error.name === 'AbortError') {
      throw new Error('Requisição cancelada por timeout. Verifique sua conexão.');
    }
    
    // Repassar erro original
    throw error;
  }
}