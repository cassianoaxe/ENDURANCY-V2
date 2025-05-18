/**
 * Application routes configuration component
 * 
 * This component centralizes route definitions and
 * provides a consistent way to register routes with
 * appropriate authentication and role-based protections.
 */
import React from 'react';
import { Route, Switch } from 'wouter';
import { UserRole } from '../../types/auth';
import ProtectedRoute from './ProtectedRoute';
import { RouteConfig } from '../../types/navigation';

// Import page components as needed
import Login from '../../pages/Login';
import Dashboard from '../../pages/Dashboard';
import NotFound from '../../pages/NotFound';

/**
 * Application routes configuration
 */
const appRoutes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    requiresAuth: false
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    requiresAuth: true,
    allowedRoles: ['admin', 'organization']
  },
  {
    path: '/pre-cadastros',
    name: 'Pré-cadastros',
    requiresAuth: true,
    allowedRoles: ['admin', 'organization']
  },
  {
    path: '/organization',
    name: 'Organização',
    requiresAuth: true,
    allowedRoles: ['admin', 'organization'],
    children: [
      {
        path: '/organization/dashboard',
        name: 'Dashboard da Organização',
        requiresAuth: true,
        allowedRoles: ['admin', 'organization']
      }
    ]
  },
  {
    path: '/unauthorized',
    name: 'Não autorizado',
    requiresAuth: false
  }
];

/**
 * Map of route paths to component modules
 */
const routeComponentMap: Record<string, React.ComponentType<any>> = {
  '/login': Login,
  '/dashboard': Dashboard,
  // Add more route-component mappings here
};

/**
 * Renders all application routes based on configuration
 */
const AppRoutes: React.FC = () => {
  /**
   * Recursively render routes, including nested children
   * @param routes Route configurations to render
   * @returns Array of Route components
   */
  const renderRoutes = (routes: RouteConfig[]): React.ReactNode[] => {
    return routes.flatMap(route => {
      const Component = routeComponentMap[route.path];
      
      // Skip routes without components
      if (!Component) {
        console.warn(`No component mapped for route: ${route.path}`);
        return [];
      }
      
      let routeElement;
      
      if (route.requiresAuth) {
        // Protected route
        routeElement = (
          <Route key={route.path} path={route.path}>
            <ProtectedRoute
              component={Component}
              path={route.path}
              allowedRoles={route.allowedRoles as UserRole[]}
            />
          </Route>
        );
      } else {
        // Public route
        routeElement = (
          <Route key={route.path} path={route.path} component={Component} />
        );
      }
      
      // Generate child routes if present
      const childRoutes = route.children ? renderRoutes(route.children) : [];
      
      return [routeElement, ...childRoutes];
    });
  };
  
  return (
    <Switch>
      {renderRoutes(appRoutes)}
      
      {/* 404 page as fallback */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default AppRoutes;