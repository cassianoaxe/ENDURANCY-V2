/**
 * Utility functions to optimize initial application load
 * 
 * This module provides functions to improve the initial loading
 * experience by prioritizing critical resources and deferring
 * non-essential operations.
 */
import { queryClient } from '../lib/queryClient';

/**
 * List of critical resources that should be loaded immediately
 * on application start for the best user experience
 */
const CRITICAL_RESOURCES = [
  '/api/notifications',
  '/api/modules'
];

/**
 * Routes and their associated resource priorities for initial loading
 */
const ROUTE_RESOURCE_PRIORITIES: Record<string, string[][]> = {
  '/dashboard': [
    // Critical (priority 1) - load immediately
    ['/api/dashboard/stats'],
    // Important (priority 2) - load after critical resources
    ['/api/organizations'],
    // Optional (priority 3) - load when idle
    ['/api/plans']
  ],
  '/pre-cadastros': [
    // Critical (priority 1)
    ['/api-diagnostic/pre-cadastros'],
    // Important (priority 2)
    ['/api/plans'],
    // Optional (priority 3)
    []
  ],
  '/organization': [
    // Critical (priority 1)
    ['/api/organization/stats'],
    // Important (priority 2)
    ['/api/organization-modules', '/api/organization/users'],
    // Optional (priority 3)
    []
  ]
};

/**
 * Preloads critical resources needed for application startup
 * @returns Promise that resolves when critical resources are loaded
 */
export async function preloadCriticalResources(): Promise<void> {
  await Promise.allSettled(
    CRITICAL_RESOURCES.map(resource => 
      queryClient.prefetchQuery({
        queryKey: [resource],
        staleTime: 5 * 60 * 1000 // 5 minutes
      })
    )
  );
}

/**
 * Prioritizes resource loading for the specified route
 * @param route Current application route
 */
export function optimizeResourcesForRoute(route: string): void {
  // Find the closest matching route configuration
  const matchingRoute = Object.keys(ROUTE_RESOURCE_PRIORITIES).find(
    configRoute => route.startsWith(configRoute)
  );

  if (!matchingRoute) return;

  const priorities = ROUTE_RESOURCE_PRIORITIES[matchingRoute];

  // Load priority 1 (critical) resources immediately
  if (priorities[0]?.length) {
    Promise.allSettled(
      priorities[0].map(resource => 
        queryClient.prefetchQuery({
          queryKey: [resource],
          staleTime: 5 * 60 * 1000 // 5 minutes
        })
      )
    );
  }

  // Load priority 2 (important) resources with a small delay
  if (priorities[1]?.length) {
    setTimeout(() => {
      Promise.allSettled(
        priorities[1].map(resource => 
          queryClient.prefetchQuery({
            queryKey: [resource],
            staleTime: 5 * 60 * 1000 // 5 minutes
          })
        )
      );
    }, 300);
  }

  // Load priority 3 (optional) resources when browser is idle
  if (priorities[2]?.length && typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => {
      Promise.allSettled(
        priorities[2].map(resource => 
          queryClient.prefetchQuery({
            queryKey: [resource],
            staleTime: 5 * 60 * 1000 // 5 minutes
          })
        )
      );
    });
  }
}

/**
 * Defers non-critical operations until the page is fully loaded
 * @param callback Function to execute when the page is fully loaded
 */
export function deferNonCriticalOperations(callback: () => void): void {
  if (document.readyState === 'complete') {
    // Document already loaded, execute immediately but in next tick
    setTimeout(callback, 0);
  } else {
    // Wait for page to fully load before executing
    window.addEventListener('load', () => {
      setTimeout(callback, 100);
    });
  }
}