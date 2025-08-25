import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface TableState {
  page: number;
  pageSize: number;
  search: string;
  filters: Record<string, any>;
}

interface UseTableStateSyncReturn {
  tableState: TableState;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: Record<string, any>) => void;
  resetFilters: () => void;
}

export function useTableStateSync(tableId: string): UseTableStateSyncReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params or defaults
  const [tableState, setTableState] = useState<TableState>({
    page: parseInt(searchParams.get('page') || '1', 10),
    pageSize: parseInt(searchParams.get('limit') || '10', 10),
    search: searchParams.get('search') || '',
    filters: {},
  });

  // Update URL when state changes
  const updateURL = useCallback((newState: Partial<TableState>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newState.page !== undefined) {
      if (newState.page === 1) {
        params.delete('page');
      } else {
        params.set('page', newState.page.toString());
      }
    }
    
    if (newState.pageSize !== undefined) {
      if (newState.pageSize === 10) {
        params.delete('limit');
      } else {
        params.set('limit', newState.pageSize.toString());
      }
    }
    
    if (newState.search !== undefined) {
      if (newState.search === '') {
        params.delete('search');
      } else {
        params.set('search', newState.search);
      }
    }
    
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newURL, { scroll: false });
  }, [searchParams, router]);

  const setSearch = useCallback((search: string) => {
    const newState = { ...tableState, search, page: 1 }; // Reset to page 1 when searching
    setTableState(newState);
    updateURL({ search, page: 1 });
  }, [tableState, updateURL]);

  const setPage = useCallback((page: number) => {
    const newState = { ...tableState, page };
    setTableState(newState);
    updateURL({ page });
  }, [tableState, updateURL]);

  const setPageSize = useCallback((pageSize: number) => {
    const newState = { ...tableState, pageSize, page: 1 }; // Reset to page 1 when changing page size
    setTableState(newState);
    updateURL({ pageSize, page: 1 });
  }, [tableState, updateURL]);

  const setFilters = useCallback((filters: Record<string, any>) => {
    const newState = { ...tableState, filters, page: 1 }; // Reset to page 1 when filtering
    setTableState(newState);
    updateURL({ page: 1 });
  }, [tableState, updateURL]);

  const resetFilters = useCallback(() => {
    const newState = {
      page: 1,
      pageSize: 10,
      search: '',
      filters: {},
    };
    setTableState(newState);
    updateURL(newState);
  }, [updateURL]);

  // Sync state with URL params when they change
  useEffect(() => {
    const newState = {
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('limit') || '10', 10),
      search: searchParams.get('search') || '',
      filters: tableState.filters, // Keep existing filters
    };
    
    // Only update if there's a meaningful change
    if (
      newState.page !== tableState.page ||
      newState.pageSize !== tableState.pageSize ||
      newState.search !== tableState.search
    ) {
      setTableState(newState);
    }
  }, [searchParams, tableState.filters, tableState.page, tableState.pageSize, tableState.search]);

  return {
    tableState,
    setSearch,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
  };
}