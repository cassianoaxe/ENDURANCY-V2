/**
 * Este arquivo serve como um redirecionamento para @/contexts/AuthContext
 * Estamos padronizando para usar apenas um AuthContext em toda a aplicação
 * para evitar problemas com múltiplos contextos de autenticação
 */

export { useAuth, AuthProvider, AuthContext } from '@/contexts/AuthContext';