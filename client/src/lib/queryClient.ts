import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false, // Não recarregar automaticamente ao focar a janela
      refetchOnMount: true, // Apenas recarregar ao montar o componente
      staleTime: 30000, // 30 segundos para considerar os dados obsoletos
      gcTime: 30 * 60 * 1000 // 30 minutos para garbage collection
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
  let options: ApiRequestOptions;
  
  // Verificar se o segundo parâmetro é uma string (método HTTP) ou objeto de opções
  if (typeof methodOrOptions === 'string') {
    options = {
      method: methodOrOptions as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      data
    };
  } else {
    options = methodOrOptions || { method: 'GET' };
  }
  
  const { method, data: requestData, headers = {}, includeCredentials = true } = options;
  
  console.log(`Iniciando requisição API: ${method} ${url}`);
  
  // Cabeçalhos padrão
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers,
  };

  // Configuração da requisição
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: includeCredentials ? 'include' : 'same-origin',
    cache: 'no-store', // Desabilitar cache para sempre obter dados atualizados
  };

  // Incluir corpo da requisição se tiver dados
  if (data) {
    requestOptions.body = JSON.stringify(data);
  }

  // Implementar retry com backoff exponencial para erros, especialmente 429
  const MAX_RETRIES = 3;
  let retryCount = 0;

  while (true) {
    try {
      // Fazer a requisição
      const response = await fetch(url, requestOptions);
      const contentType = response.headers.get('content-type');
      console.log(`Resposta API: ${response.status} ${response.statusText}`);

      // Tratar erro de rate limit (429) com retry
      if (response.status === 429) {
        if (retryCount >= MAX_RETRIES) {
          throw new Error('Muitas requisições. Por favor, aguarde um momento e tente novamente.');
        }
        
        // Backoff exponencial: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Rate limit atingido. Tentativa ${retryCount + 1}/${MAX_RETRIES}. Aguardando ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
        continue;
      }

      // Tratar outros erros
      if (!response.ok) {
        // Verificar tipo de erro
        if (response.status === 401) {
          console.error('Erro 401: Usuário não autenticado ou sessão expirada');
          
          // Verificar se estamos na página de login para evitar loop de redirecionamento
          const isLoginPage = window.location.pathname.includes('/login') || 
                             window.location.pathname.includes('/supplier/login');
                             
          if (!isLoginPage) {
            console.log('Redirecionando para página de login devido a erro 401');
            
            // Verificar se é uma rota de fornecedor
            if (window.location.pathname.startsWith('/supplier')) {
              window.location.replace('/supplier/login');
            } else {
              window.location.replace('/login');
            }
          }
          
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        // Tentar obter mensagem de erro detalhada para outros erros
        let errorMessage = `Erro na requisição: ${response.status} ${response.statusText}`;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = typeof errorData.error === 'string' 
                ? errorData.error 
                : errorData.error.message || JSON.stringify(errorData.error);
            }
          } catch (e) {
            // Se não conseguir parsear JSON, usar mensagem padrão
          }
        }
        
        throw new Error(errorMessage);
      }

      // Processar resposta bem-sucedida
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      // Retorno para não-JSON
      return {};
      
    } catch (error) {
      // Retry para erros de rede ou 429, outros erros são repassados
      const errorMessage = error.message || 'Erro desconhecido';
      const isRateLimitError = errorMessage.includes('429') || 
                              errorMessage.includes('Muitas requisições');
      
      if (!isRateLimitError || retryCount >= MAX_RETRIES) {
        console.error(`Erro na requisição API ${method} ${url}:`, error);
        throw error;
      }
      
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`Erro na requisição. Tentativa ${retryCount + 1}/${MAX_RETRIES}. Aguardando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
  }
}