import { type ComponentType } from "preact";
import { Suspense, lazy } from "preact/compat";
import { useState, useEffect } from "preact/hooks";

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ComponentType<any>;
  props?: Record<string, any>;
}

// Lazy loading utility for heavy components
export const lazyLoad = (
  loader: () => Promise<{ default: ComponentType<any> }>,
) => {
  return lazy(loader);
};

// Suspense wrapper for lazy components
export const LazyBoundary = ({
  children,
  fallback,
}: {
  children: any;
  fallback?: any;
}) => (
  <Suspense fallback={fallback || <div className="p-4 animate-pulse" />}>
    {children}
  </Suspense>
);

// Intersection Observer hook for viewport detection
export const useIntersection = (ref: { current: Element | null }) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (!("IntersectionObserver" in window)) return true;
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
};

// Request animation frame throttle
export const throttleRAF = (callback: () => void) => {
  let rafId: number;
  return () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(callback);
  };
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
) => {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
};
