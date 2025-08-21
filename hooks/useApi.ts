import { ApiClientError } from '@/lib/api';
import { useCallback, useRef, useState } from 'react';

// API state interface
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// API call options
interface ApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

// Hook return type
interface UseApiReturn<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
}

/**
 * Custom hook for managing API calls with loading states and error handling
 */
export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options: ApiCallOptions = {}
): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      // Cancel previous request if it's still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const data = await apiCall(...args);
        
        setState(prev => ({
          ...prev,
          data,
          loading: false,
        }));

        options.onSuccess?.(data);
        return data;

      } catch (error) {
        // Don't set error if request was cancelled
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }

        const errorMessage = error instanceof ApiClientError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'An unexpected error occurred';

        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));

        options.onError?.(error as Error);
        return null;

      } finally {
        options.onFinally?.();
      }
    },
    [apiCall, options]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook for managing paginated API calls
 */
export function usePaginatedApi<T = any>(
  apiCall: (page: number, limit?: number, ...args: any[]) => Promise<{ data: T[]; pagination: any }>,
  initialLimit = 20
) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allData, setAllData] = useState<T[]>([]);
  
  const { execute, loading, error, reset } = useApi(apiCall);

  const loadPage = useCallback(
    async (pageNum: number, ...args: any[]) => {
      const result = await execute(pageNum, initialLimit, ...args);
      
      if (result) {
        const { data, pagination } = result;
        
        if (pageNum === 1) {
          setAllData(data);
        } else {
          setAllData(prev => [...prev, ...data]);
        }
        
        setHasMore(pagination.hasNext);
        setPage(pageNum);
      }
      
      return result;
    },
    [execute, initialLimit]
  );

  const loadNextPage = useCallback(
    async (...args: any[]) => {
      if (hasMore && !loading) {
        return loadPage(page + 1, ...args);
      }
    },
    [loadPage, page, hasMore, loading]
  );

  const refresh = useCallback(
    async (...args: any[]) => {
      setPage(1);
      setHasMore(true);
      setAllData([]);
      return loadPage(1, ...args);
    },
    [loadPage]
  );

  return {
    data: allData,
    loading,
    error,
    page,
    hasMore,
    loadPage,
    loadNextPage,
    refresh,
    reset,
  };
}

/**
 * Hook for managing search with debouncing
 */
export function useSearchApi<T = any>(
  apiCall: (query: string, ...args: any[]) => Promise<T>,
  debounceMs = 300
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const { execute, loading, error, data, reset } = useApi(apiCall);

  const search = useCallback(
    async (searchQuery: string, ...args: any[]) => {
      setQuery(searchQuery);
      
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for debounced search
      timeoutRef.current = setTimeout(() => {
        setDebouncedQuery(searchQuery);
        if (searchQuery.trim()) {
          execute(searchQuery, ...args);
        }
      }, debounceMs);
    },
    [execute, debounceMs]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    reset();
  }, [reset]);

  return {
    query,
    debouncedQuery,
    search,
    clearSearch,
    loading,
    error,
    data,
    reset,
  };
}
