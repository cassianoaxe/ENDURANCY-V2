// Arquivo de autenticação simplificado para corrigir problemas de navegação

// Função para redirecionar para a página de login sem recarregar a página
export function redirectToLogin() {
  window.location.href = '/login';
}

// Função para redirecionar para o dashboard da organização
export function redirectToOrgDashboard() {
  window.location.href = '/organization/dashboard';
}

// Função para fazer logout sem recarregar a página
export function doLogout() {
  // Limpar qualquer estado local se necessário
  localStorage.removeItem('hasSession');
  
  // Fazer logout no servidor
  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }).catch(err => console.error('Erro ao fazer logout:', err));
  
  // Redirecionar para a página de login
  redirectToLogin();
}