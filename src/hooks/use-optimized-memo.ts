/**
 * Optimized React hooks for better performance
 */

import { useCallback, useEffect, useRef, useMemo, DependencyList } from 'react';
import { debounce, throttle } from '../utils/performance';

/**
 * Optimized useCallback that only changes when dependencies deeply change
 */
export function useDeepCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  const ref = useRef<T>(callback);
  const depsRef = useRef(deps);

  // Update ref if dependencies have deeply changed
  if (!deepEqual(depsRef.current, deps)) {
    ref.current = callback;
    depsRef.current = deps;
  }

  return useCallback(ref.current, []);
}

/**
 * Deep equality check
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: DependencyList = []
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(
    () =>
      debounce((...args: any[]) => {
        callbackRef.current(...args);
      }, delay) as T,
    [delay, ...deps]
  );
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: DependencyList = []
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(
    () =>
      throttle((...args: any[]) => {
        callbackRef.current(...args);
      }, limit) as T,
    [limit, ...deps]
  );
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Optimized useState that batches updates
 */
export function useBatchedState<T>(
  initialState: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useMemo(() => {
    return [initialState, setState];
  }, []);

  const batchedSetState = useCallback((value: T | ((prev: T) => T)) => {
    // React 18 automatically batches updates
    setState(value);
  }, []);

  return [state as T, batchedSetState];
}

/**
 * Hook to detect if component is mounted
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useMemo(() => [null, setEntry], []);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options.threshold, options.root, options.rootMargin]);

  return entry as IntersectionObserverEntry | null;
}

/**
 * Media query hook with performance optimization
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useMemo(() => {
    if (typeof window === 'undefined') return [false, setMatches];
    return [window.matchMedia(query).matches, setMatches];
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches as boolean;
}

/**
 * Window size hook with debouncing
 */
export function useWindowSize(debounceMs: number = 150) {
  const [size, setSize] = useMemo(() => {
    if (typeof window === 'undefined') {
      return [{ width: 0, height: 0 }, setSize];
    }
    return [
      { width: window.innerWidth, height: window.innerHeight },
      setSize,
    ];
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = debounce(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, debounceMs);

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [debounceMs]);

  return size as { width: number; height: number };
}

/**
 * Optimized effect that only runs when dependencies deeply change
 */
export function useDeepEffect(
  effect: React.EffectCallback,
  deps: DependencyList
): void {
  const ref = useRef<DependencyList>(deps);
  const signalRef = useRef<number>(0);

  if (!deepEqual(ref.current, deps)) {
    ref.current = deps;
    signalRef.current += 1;
  }

  useEffect(effect, [signalRef.current]);
}
