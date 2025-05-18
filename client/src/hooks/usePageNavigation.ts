/**
 * Custom hook for optimized page navigation
 * 
 * This hook combines various navigation optimizations:
 * 1. Smooth transitions between pages
 * 2. Resource prefetching for faster subsequent loads
 * 3. Scroll management for better UX
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { applyPageTransition, scrollToTop } from '../utils/navigationUtils';
import { prefetchResourcesForRoute, prefetchResourcesForVisibleLinks, pruneUnusedCache } from '../utils/prefetchUtils';

/**
 * Options for the usePageNavigation hook
 */
interface UsePageNavigationOptions {
  /** Whether to scroll to top on page change */
  scrollToTop?: boolean;
  /** Whether to apply fade transition */
  fadeTransition?: boolean;
  /** Whether to prefetch resources for next pages */
  prefetchResources?: boolean;
  /** Whether to clean up unused cache periodically */
  pruneCache?: boolean;
}

/**
 * Hook that implements optimizations for faster navigation between pages
 */
export default function usePageNavigation({
  scrollToTop: shouldScrollToTop = true,
  fadeTransition = true,
  prefetchResources = true,
  pruneCache = true
}: UsePageNavigationOptions = {}) {
  const [location] = useLocation();
  const prevLocation = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  // Effects to run on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // Set up cache cleanup if enabled
      if (pruneCache) {
        const intervalId = setInterval(() => {
          pruneUnusedCache();
        }, 5 * 60 * 1000); // Every 5 minutes
        
        return () => clearInterval(intervalId);
      }
    }
  }, [pruneCache]);

  // Effects to run on location change
  useEffect(() => {
    // Skip the first render since it's not a navigation
    if (prevLocation.current !== null) {
      // Apply transition effect if enabled
      if (fadeTransition) {
        applyPageTransition();
      }
      
      // Scroll to top if enabled
      if (shouldScrollToTop) {
        scrollToTop();
      }
      
      // Prefetch resources for current page if enabled
      if (prefetchResources) {
        // Wait for the transition to complete before prefetching
        setTimeout(() => {
          prefetchResourcesForRoute(location).catch(() => {
            // Silently ignore prefetch errors
          });
          
          // Also look for links to prefetch on the new page
          prefetchResourcesForVisibleLinks();
        }, 300);
      }
    }
    
    // Update previous location for next change
    prevLocation.current = location;
  }, [location, fadeTransition, shouldScrollToTop, prefetchResources]);

  // No values to return - this hook is just for side effects
  return null;
}