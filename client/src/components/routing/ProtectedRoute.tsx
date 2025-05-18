/**
 * Protected route component that handles authentication and authorization
 * 
 * This component wraps routes that should only be accessible to
 * authenticated users with specific roles.
 */
import React, { useEffect } from 'react';
import { useLocation, useRouter } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  /** Component to render if authorized */
  component: React.ComponentType<any>;
  /** Route path for debugging */
  path?: string;
  /** Roles allowed to access this route */
  allowedRoles?: UserRole[];
  /** Props to pass to the component */
  componentProps?: Record<string, any>;
  /** Path to redirect to if unauthorized */
  redirectPath?: string;
}

/**
 * Component that protects routes behind authentication and authorization
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  path,
  allowedRoles,
  componentProps = {},
  redirectPath = '/login'
}) => {
  const { authState } = useAuth();
  const [, navigate] = useRouter();
  const [location] = useLocation();

  // Destructure auth state for easier access
  const { isAuthenticated, loading, user } = authState;

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (loading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      // Preserve the current URL for redirecting back after login
      const returnUrl = encodeURIComponent(location);
      navigate(`${redirectPath}?returnUrl=${returnUrl}`, { replace: true });
      return;
    }

    // Check role-based authorization if roles are specified
    if (allowedRoles && allowedRoles.length > 0 && user) {
      const hasAllowedRole = allowedRoles.includes(user.role);
      
      if (!hasAllowedRole) {
        // User is authenticated but not authorized for this route
        console.warn(`User role ${user.role} not authorized for route: ${path || location}`);
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, loading, user, allowedRoles, location, navigate, redirectPath, path]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-lg text-gray-700">Verificando autenticação...</span>
      </div>
    );
  }

  // If authenticated and authorized, render the component
  if (isAuthenticated && (!allowedRoles || allowedRoles.includes(user?.role as UserRole))) {
    return <Component {...componentProps} />;
  }

  // Don't render anything while redirecting
  return null;
};

export default ProtectedRoute;