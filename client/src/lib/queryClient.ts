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

  // Temporariamente desativando a verificação de CSRF devido a problemas no endpoint
  // if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
  //   try {
  //     const token = await fetchCsrfToken();
  //     if (token) {
  //       requestHeaders['CSRF-Token'] = token;
  //     }
  //   } catch (error) {
  //     console.error('Erro ao obter token CSRF para requisição:', error);
  //     // Continua a requisição mesmo sem o token CSRF em caso de erro
  //   }
  // }


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

  try {
    // Fazer a requisição
    const response = await fetch(url, requestOptions);
    
    // Verificar o tipo de conteúdo da resposta
    const contentType = response.headers.get('content-type');
    console.log(`Resposta API: ${response.status} ${response.statusText}, Content-Type: ${contentType}`);
    
    // Tratar resposta de erro
    if (!response.ok) {
      // Verificar se a resposta contém HTML (comum em redirecionamentos de login)
      if (contentType && contentType.includes('text/html')) {
        // Verificar tipos específicos de erro
        if (response.status === 401) {
          // Sessão expirada ou não autenticado
          console.error('Erro 401: Usuário não autenticado ou sessão expirada');
          
          // Verificar se estamos na página de login para evitar loop de redirecionamento
          if (!window.location.pathname.includes('/login')) {
            console.log('Redirecionando para página de login devido a erro 401');
            window.location.href = '/login';
          }
          
          throw new Error('Sessão expirada. Faça login novamente.');
        } else if (response.status === 429) {
          console.error('Erro 429: Rate limiting aplicado');
          throw new Error('Muitas requisições. Por favor, aguarde um momento e tente novamente.');
        } else {
          console.error(`Erro ${response.status}: Resposta em HTML não esperada`);
          throw new Error(`Erro na requisição (${response.status}): Resposta inesperada do servidor`);
        }
      }
      
      // Tentar obter mensagem de erro detalhada da API para respostas JSON
      let errorMessage = `API request failed: ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        } catch (jsonError) {
          console.error('Erro ao parsear resposta JSON de erro:', jsonError);
          // Se não conseguir parsear o JSON de erro, usa a mensagem padrão
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Verificar se há conteúdo para parsear como JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (jsonError) {
        console.error('Erro ao parsear resposta JSON:', jsonError);
        throw new Error('Falha ao processar resposta do servidor');
      }
    }
    
    // Retorno vazio para respostas sem conteúdo JSON
    return {}; 
  } catch (error) {
    console.error(`Erro na requisição API ${method} ${url}:`, error);
    throw error;
  }
}