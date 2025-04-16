import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ApiRequestOptions {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  includeCredentials?: boolean;
}

// Armazenar o token CSRF após obtê-lo
let csrfToken: string | null = null;

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
    if (data.csrfToken) {
      csrfToken = data.csrfToken;
      return csrfToken;
    }
    
    throw new Error('Token CSRF não encontrado na resposta');
  } catch (error) {
    console.error('Erro ao obter token CSRF:', error);
    throw error;
  }
}

/**
 * Função utilitária para requisições à API com suporte a CSRF
 * @param url URL da requisição
 * @param options Opções da requisição
 * @returns Resposta JSON da API
 */
export async function apiRequest(url: string, options: ApiRequestOptions) {
  const { method, data, headers = {}, includeCredentials = true } = options;
  
  // Cabeçalhos padrão
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Para métodos que modificam estado, obter e incluir o token CSRF
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    try {
      const token = await fetchCsrfToken();
      requestHeaders['CSRF-Token'] = token;
    } catch (error) {
      console.error('Erro ao obter token CSRF para requisição:', error);
      // Continua a requisição mesmo sem o token CSRF em caso de erro
    }
  }

  // Configuração da requisição
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: includeCredentials ? 'include' : 'same-origin',
  };

  // Incluir corpo da requisição se tiver dados
  if (data) {
    requestOptions.body = JSON.stringify(data);
  }

  // Fazer a requisição
  const response = await fetch(url, requestOptions);
  
  // Tratar resposta de erro
  if (!response.ok) {
    // Tentar obter mensagem de erro detalhada da API
    let errorMessage = `API request failed: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // Se não conseguir parsear o JSON de erro, usa a mensagem padrão
    }
    
    throw new Error(errorMessage);
  }
  
  // Verificar se há conteúdo para parsear como JSON
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  // Retorno vazio para respostas sem conteúdo
  return {}; 
}