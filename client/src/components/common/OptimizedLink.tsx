/**
 * Optimized link component that enhances the default Link with prefetching capabilities
 */
import React, { useCallback, MouseEvent } from 'react';
import { Link } from 'wouter';
import { prefetchResourcesForRoute } from '../../utils/prefetchUtils';
import { applyPageTransition } from '../../utils/navigationUtils';

interface OptimizedLinkProps {
  /** Link destination */
  href: string;
  /** Whether to apply transition effect on click */
  withTransition?: boolean;
  /** Whether to prefetch resources on hover */
  prefetch?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Link contents */
  children: React.ReactNode;
  /** Additional props */
  [key: string]: any;
}

/**
 * Enhanced link component that improves navigation with prefetching and transitions
 */
const OptimizedLink: React.FC<OptimizedLinkProps> = ({
  href,
  withTransition = true,
  prefetch = true,
  className = '',
  children,
  ...props
}) => {
  // Handle mouse hover to prefetch resources
  const handleMouseEnter = useCallback(() => {
    if (prefetch && href.startsWith('/')) {
      // Prefetch resources for faster navigation
      prefetchResourcesForRoute(href).catch(() => {
        // Silently ignore prefetch errors
      });
    }
  }, [href, prefetch]);
  
  // Handle click for transition effects
  const handleClick = useCallback((e: MouseEvent) => {
    // Skip for external links, modified clicks, or when transitions disabled
    if (
      !withTransition ||
      !href.startsWith('/') ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      e.shiftKey
    ) {
      return;
    }
    
    // Apply transition effect
    applyPageTransition();
    
    // Allow default link behavior to continue
  }, [href, withTransition]);
  
  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default OptimizedLink;