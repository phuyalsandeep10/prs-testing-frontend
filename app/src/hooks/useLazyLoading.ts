import { useState, useEffect, useCallback, useMemo } from 'react';
import { PAGINATION } from '@/lib/constants';

interface UseLazyLoadingOptions {
  pageSize?: number;
  enableVirtualization?: boolean;
  preloadPages?: number;
}

interface UseLazyLoadingReturn<T> {
  // Data state
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Pagination info
  currentPage: number;
  totalPages: number;
  totalItems: number;
  
  // Actions
  loadMore: () => void;
  loadPage: (page: number) => void;
  refresh: () => void;
  reset: () => void;
}

/**
 * Hook for lazy loading large datasets with pagination and virtualization support
 * @param fetchFn - Function to fetch data for a specific page
 * @param options - Configuration options
 * @returns Object with data state and loading actions
 */
export function useLazyLoading<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{
    data: T[];
    total: number;
    hasMore: boolean;
  }>,
  options: UseLazyLoadingOptions = {}
): UseLazyLoadingReturn<T> {
  const {
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    enableVirtualization = false,
    preloadPages = 1,
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());

  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.ceil(totalItems / pageSize), 
    [totalItems, pageSize]
  );

  /**
   * Load data for a specific page
   */
  const loadPage = useCallback(async (page: number, append = false) => {
    if (loadedPages.has(page) && !append) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page, pageSize);
      
      setItems(prev => {
        if (append) {
          // Append new items for infinite scroll
          return [...prev, ...result.data];
        } else {
          // Replace items for page-based loading
          const newItems = [...prev];
          const startIndex = (page - 1) * pageSize;
          
          // Insert new items at the correct position
          result.data.forEach((item, index) => {
            newItems[startIndex + index] = item;
          });
          
          return newItems;
        }
      });

      setTotalItems(result.total);
      setHasMore(result.hasMore);
      setLoadedPages(prev => new Set([...prev, page]));
      
      // Preload next pages if enabled
      if (preloadPages > 0 && result.hasMore) {
        for (let i = 1; i <= preloadPages; i++) {
          const nextPage = page + i;
          if (!loadedPages.has(nextPage) && nextPage <= Math.ceil(result.total / pageSize)) {
            setTimeout(() => loadPage(nextPage), 100 * i); // Stagger requests
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Lazy loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, pageSize, loadedPages, preloadPages]);

  /**
   * Load more items (infinite scroll)
   */
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadPage(nextPage, true);
    }
  }, [hasMore, isLoading, currentPage, loadPage]);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    setItems([]);
    setLoadedPages(new Set());
    setCurrentPage(1);
    setError(null);
    loadPage(1);
  }, [loadPage]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(1);
    setTotalItems(0);
    setHasMore(true);
    setIsLoading(false);
    setError(null);
    setLoadedPages(new Set());
  }, []);

  // Load initial data
  useEffect(() => {
    loadPage(1);
  }, []);

  return {
    // Data state
    items,
    hasMore,
    isLoading,
    error,
    
    // Pagination info
    currentPage,
    totalPages,
    totalItems,
    
    // Actions
    loadMore,
    loadPage: (page: number) => {
      setCurrentPage(page);
      loadPage(page);
    },
    refresh,
    reset,
  };
}

/**
 * Hook for virtual scrolling with large datasets
 * @param items - Array of all items
 * @param containerHeight - Height of the scroll container
 * @param itemHeight - Height of each item
 * @returns Object with visible items and scroll properties
 */
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = useMemo(() => 
    items.slice(visibleStart, visibleEnd).map((item, index) => ({
      item,
      index: visibleStart + index,
    })),
    [items, visibleStart, visibleEnd]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

/**
 * Hook for implementing intersection observer for infinite scroll
 * @param callback - Function to call when intersection occurs
 * @param options - Intersection observer options
 * @returns Ref to attach to the trigger element
 */
export function useInfiniteScroll(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const [node, setNode] = useState<Element | null>(null);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, callback, options]);

  return setNode;
} 