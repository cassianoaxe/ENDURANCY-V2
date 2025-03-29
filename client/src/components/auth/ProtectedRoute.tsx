import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'org_admin' | 'doctor' | 'patient'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'org_admin', 'doctor', 'patient']
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirecionar para login se não estiver autenticado
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new Event('popstate'));
    }
  }, [isLoading, isAuthenticated]);

  const userHasRequiredRole = React.useMemo(() => {
    if (!user) return false;
    return allowedRoles.includes(user.role as any);
  }, [user, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && !userHasRequiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertTriangle className="h-16 w-16 text-yellow-500" />
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          onClick={() => {
            // Redirecionar com base no papel do usuário
            let redirectPath = '/dashboard';
            
            if (user?.role === 'admin') {
              redirectPath = '/dashboard';
            } else if (user?.role === 'org_admin') {
              redirectPath = '/organization/dashboard';
            } else if (user?.role === 'doctor') {
              redirectPath = '/doctor/dashboard';
            } else if (user?.role === 'patient') {
              redirectPath = '/patient/dashboard';
            }
            
            window.history.pushState({}, '', redirectPath);
            window.dispatchEvent(new Event('popstate'));
          }}
        >
          Ir para sua página inicial
        </button>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;