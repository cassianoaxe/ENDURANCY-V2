import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '../../lib/queryClient';
import { prefetchResourcesForRoute, prefetchResourcesForVisibleLinks, pruneUnusedCache } from '../../utils/prefetchUtils';

interface PageTransitionWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component that applies smooth transitions between pages
 * and improves loading experience with resource prefetching
 */
const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [content, setContent] = useState<ReactNode>(children);

  // Reference to check if this is the first render
  const isFirstRender = useRef(true);
  
  // Effect to set up prefetching on first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      // Prefetch resources for initial route
      prefetchResourcesForRoute(location).catch(() => {
        // Silently ignore prefetch errors
      });
      
      // Set up observer to prefetch resources for visible links
      setTimeout(() => {
        prefetchResourcesForVisibleLinks();
      }, 1000);
      
      // Set up periodic cache cleanup for unused resources
      const intervalId = setInterval(pruneUnusedCache, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [location]);
  
  // Effect to handle page transitions
  useEffect(() => {
    // When location changes, start transition
    setIsTransitioning(true);
    
    // Small delay to make fade animation perceptible
    const timer = setTimeout(() => {
      // Update content with new page elements
      setContent(children);
      
      // Complete transition after a moment to allow rendering
      requestAnimationFrame(() => {
        setIsTransitioning(false);
        
        // Prefetch resources for the new location after transition
        prefetchResourcesForRoute(location).catch(() => {
          // Silently ignore prefetch errors
        });
      });
    }, 80); // Short delay to not significantly impact navigation
    
    return () => clearTimeout(timer);
  }, [location, children]);

  // Smoothly scroll to top when navigating between pages
  useEffect(() => {
    if (!isTransitioning) {
      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // After page rendering, observe new links for prefetching
      setTimeout(() => {
        prefetchResourcesForVisibleLinks();
      }, 500);
    }
  }, [isTransitioning]);

  return (
    <div 
      className={`
        transition-opacity duration-150 ease-in-out
        ${isTransitioning ? 'opacity-95' : 'opacity-100'}
        ${className}
      `}
      style={{
        willChange: 'opacity',
        backfaceVisibility: 'hidden',
      }}
    >
      {content}
    </div>
  );
};

export default PageTransitionWrapper;