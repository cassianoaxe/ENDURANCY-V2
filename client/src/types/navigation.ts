/**
 * Navigation related type definitions
 */

/**
 * Interface for common route configuration
 */
export interface RouteConfig {
  /** Route path (e.g., '/dashboard') */
  path: string;
  /** Display name for the route (used in menus, breadcrumbs) */
  name: string;
  /** Optional icon identifier */
  icon?: string;
  /** Whether route requires authentication */
  requiresAuth?: boolean;
  /** Roles that can access this route (undefined = all roles) */
  allowedRoles?: string[];
  /** Whether route should be hidden from menus */
  hidden?: boolean;
  /** Order in navigation menus (lower = higher priority) */
  order?: number;
  /** Child routes */
  children?: RouteConfig[];
}

/**
 * Interface for breadcrumb generation
 */
export interface Breadcrumb {
  /** Display name */
  name: string;
  /** URL path */
  path: string;
  /** Whether this is the active/current page */
  isActive: boolean;
}

/**
 * Interface for menu items in navigation components
 */
export interface MenuItem {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** URL path */
  path: string;
  /** Icon identifier */
  icon?: string;
  /** Whether item is currently active */
  isActive?: boolean;
  /** Whether item is expanded (for collapsible menus) */
  isExpanded?: boolean;
  /** Child menu items */
  children?: MenuItem[];
  /** Required permissions to see this item */
  requiredPermissions?: string[];
  /** Badge text to display (e.g., "New") */
  badge?: string;
  /** Badge color/style */
  badgeColor?: string;
  /** Custom attributes */
  attributes?: Record<string, any>;
}

/**
 * Navigation history entry
 */
export interface NavigationHistoryEntry {
  /** URL path */
  path: string;
  /** Page title */
  title: string;
  /** Timestamp when navigated to this page */
  timestamp: number;
}

/**
 * Navigation event data
 */
export interface NavigationEvent {
  /** Previous route */
  from: string | null;
  /** New route */
  to: string;
  /** Whether navigation was triggered by back/forward buttons */
  isHistoryNavigation: boolean;
  /** Timestamp when navigation occurred */
  timestamp: number;
}