import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Runs an async fetcher on mount (and whenever deps change), tracking loading/error/data. */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[], errorMessage?: string) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher();
      if (mountedRef.current) setState({ data, error: null, loading: false });
    } catch (err) {
      if (mountedRef.current) {
        setState({
          data: null,
          error: errorMessage || (err instanceof Error ? err.message : 'Failed to load data.'),
          loading: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    run();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { ...state, refetch: run };
}
