/**
 * Utilitários de navegação para gerenciar redirecionamentos baseados em papel do usuário
 */

type UserRole = 'admin' | 'org_admin' | 'association_admin' | 'company_admin' | 
  'doctor' | 'dentist' | 'vet' | 'patient' | 'pharmacist' | 
  'laboratory' | 'researcher' | 'supplier';

// Mapeamento de papéis de usuário para suas páginas de dashboard
const ROLE_DASHBOARD_MAP: Record<UserRole, string> = {
  admin: '/dashboard',
  org_admin: '/organization/dashboard',
  association_admin: '/association/dashboard',
  company_admin: '/company/dashboard',
  doctor: '/doctor/dashboard',
  dentist: '/dentist/dashboard',
  vet: '/vet/dashboard',
  patient: '/patient/dashboard',
  pharmacist: '/pharmacist/dashboard',
  laboratory: '/laboratory/dashboard',
  researcher: '/researcher/dashboard',
  supplier: '/supplier/dashboard'
};

// Lista de rotas públicas que não requerem autenticação
export const PUBLIC_PATHS = [
  '/', 
  '/login', 
  '/organization-registration', 
  '/forgot-password', 
  '/accept-invitation', 
  '/payment', 
  '/payment-test', 
  '/pagamento/confirmar', 
  '/pagamento/confirmacao', 
  '/patient-login', 
  '/patient/login', 
  '/patient/dashboard', 
  '/patient/produtos', 
  '/patient/prescricoes/nova', 
  '/patient/pedidos/rastreamento', 
  '/patient/pagamentos', 
  '/patient/checkout', 
  '/cadastrodemedicos', 
  '/sitemap', 
  '/transparencia-test', 
  '/organization/transparencia', 
  '/supplier/login', 
  '/supplier/register', 
  '/supplier/register-success', 
  '/expedicao/mapa-fullscreen', 
  '/expedicao/mapa-bi', 
  '/landing/afiliados', 
  '/roadmap', 
  '/pre-cadastro', 
  '/pre-cadastro-sucesso'
];

/**
 * Verifica se uma rota é pública (não requer autenticação)
 * @param path Caminho da rota a verificar
 * @returns true se a rota for pública
 */
export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
}

/**
 * Obtém a URL do dashboard para o papel de usuário especificado
 * @param role Papel do usuário
 * @returns URL para o dashboard desse papel
 */
export function getDashboardUrl(role: UserRole): string {
  return ROLE_DASHBOARD_MAP[role] || '/dashboard';
}

/**
 * Executa o redirecionamento para a URL especificada
 * @param url URL para redirecionar
 * @param replace Se verdadeiro, substitui a entrada atual no histórico
 */
export function redirect(url: string, replace: boolean = true): void {
  setTimeout(() => {
    try {
      if (replace) {
        window.location.replace(url);
      } else {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Erro ao redirecionar:", error);
      window.location.href = url;
    }
  }, 100);
}