/**
 * Navigation utilities for optimizing page transitions
 * 
 * This module provides functions to enhance navigation experience
 * with smooth transitions and optimized resource loading.
 */

/**
 * Smoothly scrolls to the top of the page
 * @param behavior Scroll behavior (smooth or auto)
 */
export function scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
  window.scrollTo({
    top: 0,
    behavior
  });
}

/**
 * Applies a fade transition to the document body
 * to create a smoother page transition effect
 */
export function applyPageTransition(): void {
  if (document.body) {
    // Apply transition
    document.body.style.transition = 'opacity 150ms ease-in-out';
    document.body.style.opacity = '0.95';
    
    // Restore opacity after a brief moment
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 120);
  }
}

/**
 * Type definition for route change handler functions
 */
export type RouteChangeHandler = (
  newRoute: string, 
  previousRoute: string | null
) => void;

/**
 * Store for route change handlers
 */
const routeChangeHandlers: RouteChangeHandler[] = [];

/**
 * Registers a handler function to be called when route changes
 * @param handler Function to call on route change
 * @returns Function to remove this handler
 */
export function onRouteChange(handler: RouteChangeHandler): () => void {
  routeChangeHandlers.push(handler);
  
  // Return cleanup function
  return () => {
    const index = routeChangeHandlers.indexOf(handler);
    if (index !== -1) {
      routeChangeHandlers.splice(index, 1);
    }
  };
}

/**
 * Notifies all registered handlers about a route change
 * @param newRoute The route being navigated to
 * @param previousRoute The route being navigated from
 */
export function notifyRouteChange(newRoute: string, previousRoute: string | null): void {
  for (const handler of routeChangeHandlers) {
    try {
      handler(newRoute, previousRoute);
    } catch (error) {
      console.error('Error in route change handler:', error);
    }
  }
}