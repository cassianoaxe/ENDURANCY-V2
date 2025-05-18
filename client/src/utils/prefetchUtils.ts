/**
 * Resource prefetching utilities
 * 
 * This module provides functions to optimize page navigation by prefetching
 * resources that are likely to be needed on the next page.
 */
import { queryClient } from '../lib/queryClient';

/**
 * Maps routes to their commonly used API resources.
 * Each route prefix maps to a list of API endpoints that should be prefetched
 * when navigating to that route.
 */
const ROUTE_RESOURCES_MAP: Record<string, string[]> = {
  '/dashboard': [
    '/api/dashboard/stats', 
    '/api/notifications',
    '/api/modules'
  ],
  '/pre-cadastros': [
    '/api-diagnostic/pre-cadastros',
    '/api/plans'
  ],
  '/organization': [
    '/api/organization/stats',
    '/api/organization-modules',
    '/api/organization/users'
  ],
  '/patient': [
    '/api/patient/stats',
    '/api/patient/appointments'
  ],
  '/doctor': [
    '/api/doctor/stats',
    '/api/doctor/patients',
    '/api/doctor/appointments'
  ]
};

/**
 * Prefetches resources associated with a specific route
 * @param route Current route or route to navigate to
 * @returns Promise that resolves when resources are prefetched
 */
export async function prefetchResourcesForRoute(route: string): Promise<void> {
  // Find the best matching route key in the map
  const matchedRouteKey = Object.keys(ROUTE_RESOURCES_MAP).find(
    routeKey => route.startsWith(routeKey)
  );
  
  if (!matchedRouteKey) return;
  
  const resources = ROUTE_RESOURCES_MAP[matchedRouteKey];
  
  // Use Promise.allSettled to prevent failing if one endpoint is unavailable
  await Promise.allSettled(
    resources.map(endpoint => 
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        staleTime: 10 * 60 * 1000, // 10 minutes (consistent with queryClient config)
      })
    )
  );
}

/**
 * Detects navigation links in the viewport and prefetches resources
 * for possible destination routes to improve navigation experience
 */
export function prefetchResourcesForVisibleLinks(): void {
  if (!('IntersectionObserver' in window)) return;
  
  // Create an observer to detect visible links
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // For each link that becomes visible on screen
      if (entry.isIntersecting && entry.target instanceof HTMLAnchorElement) {
        const href = entry.target.getAttribute('href');
        
        // Ignore external links or links without href
        if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
        
        // Prefetch resources for the link route
        prefetchResourcesForRoute(href).catch(() => {
          // Silently ignore prefetch errors
        });
        
        // Stop observing this link after prefetching
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1 // Trigger when at least 10% of the element is visible
  });
  
  // Observe all internal navigation links
  document.querySelectorAll('a[href^="/"]').forEach(link => {
    observer.observe(link);
  });
}

/**
 * Cleans unused resource cache to optimize memory usage.
 * This function should only be called when the browser is idle.
 */
export function pruneUnusedCache(): void {
  // Check support for requestIdleCallback
  if (typeof window.requestIdleCallback !== 'function') return;
  
  // Execute cleanup when the browser is idle
  window.requestIdleCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        // Keep only active or recent queries
        const isActive = query.isActive();
        const isRecent = query.state.dataUpdatedAt > Date.now() - 60 * 60 * 1000; // 1 hour
        
        // Remove from cache only inactive and old queries
        return !isActive && !isRecent;
      }
    });
  });
}