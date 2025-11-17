/**
 * Performance optimization utilities
 * Provides helpers for lazy loading, memoization, and performance monitoring
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Enhanced lazy loading with retry logic
 * Automatically retries failed chunk loads up to 3 times
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (attemptsLeft: number) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (attemptsLeft === 0) {
              reject(error);
              return;
            }
            setTimeout(() => {
              attemptImport(attemptsLeft - 1);
            }, interval);
          });
      };
      attemptImport(retries);
    });
  });
}

/**
 * Preload a lazy component
 * Useful for prefetching components that will be needed soon
 */
export function preloadComponent(
  importFunc: () => Promise<any>
): void {
  importFunc();
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request Idle Callback polyfill for browsers that don't support it
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(cb, 1);

/**
 * Cancel Idle Callback polyfill
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : (id: number) => clearTimeout(id);

/**
 * Run expensive operations during idle time
 */
export function runWhenIdle(callback: () => void, options?: IdleRequestOptions): number {
  return requestIdleCallback(callback, options);
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string, callback: () => void): void {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
  } else {
    callback();
  }
}

/**
 * Check if element is in viewport (for lazy loading)
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Optimized event listener with passive option
 */
export function addPassiveEventListener(
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions
): void {
  target.addEventListener(type, listener, {
    passive: true,
    ...options,
  });
}

/**
 * Memoize expensive function calls
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Clear all caches (useful for memory management)
 */
export function clearAllCaches(): void {
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): { used: number; total: number; percentage: number } | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
  return null;
}

/**
 * Optimize images for performance
 */
export function optimizeImage(src: string, width?: number, height?: number): string {
  // Add any image optimization logic here
  // For now, just return the source
  return src;
}

/**
 * Prefetch resources
 */
export function prefetchResource(href: string, as: string = 'fetch'): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = as;
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Preconnect to external domains
 */
export function preconnect(href: string): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  document.head.appendChild(link);
}
