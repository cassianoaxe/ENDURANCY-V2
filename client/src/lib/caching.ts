/**
 * Este arquivo contém utilitários para otimizar o desempenho
 * e reduzir o número de chamadas de API desnecessárias
 */

// Função para armazenar em cache dados de autenticação
export function cacheAuthData(userData: any) {
  // Armazena dados no localStorage com um timestamp
  const authCache = {
    data: userData,
    timestamp: Date.now()
  };
  localStorage.setItem('auth_cache', JSON.stringify(authCache));
}

// Função para obter dados de autenticação em cache
export function getCachedAuthData() {
  // Obtém dados do cache com verificação de idade
  try {
    const cached = localStorage.getItem('auth_cache');
    if (!cached) return null;
    
    const authCache = JSON.parse(cached);
    const ageInMilliseconds = Date.now() - authCache.timestamp;
    
    // Considera o cache válido por 5 minutos
    const maxAgeInMilliseconds = 5 * 60 * 1000;
    
    if (ageInMilliseconds > maxAgeInMilliseconds) {
      // Cache expirado, remove
      localStorage.removeItem('auth_cache');
      return null;
    }
    
    return authCache.data;
  } catch (error) {
    console.error('Erro ao ler cache de autenticação:', error);
    localStorage.removeItem('auth_cache');
    return null;
  }
}

// Limpa o cache de autenticação
export function clearAuthCache() {
  localStorage.removeItem('auth_cache');
}