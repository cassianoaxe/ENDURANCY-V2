/**
 * Utilitário simplificado para autenticação
 * Este arquivo não depende de contextos ou outros componentes
 * permitindo operações diretas sem efeitos colaterais
 */

/**
 * Faz logout diretamente, sem depender de contextos ou navegações complexas
 * @returns {Promise<void>}
 */
export async function fastLogout() {
  try {
    // 1. Fazemos a chamada para o servidor ANTES do redirecionamento
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log("Logout concluído no servidor");
    
    // 2. Limpamos qualquer dado local de sessão
    localStorage.removeItem('hasSession');
    sessionStorage.removeItem('loginRedirect');
    
    // 3. Redirecionamos diretamente para a página de login
    // Usando href que é mais direto e causa menos problemas
    window.location.href = '/fast-login';
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    // Mesmo em caso de erro, redirecionamos para garantir que o usuário saia
    window.location.href = '/fast-login';
  }
}

/**
 * Verifica se o usuário está autenticado (útil para verificações rápidas)
 * @returns {Promise<boolean>}
 */
export async function checkAuthentication() {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) return false;
    
    const userData = await response.json();
    return !!userData?.id;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
}