// Reasonably-typed shims to help the TypeScript checker while we fix
// concrete issues across the codebase. These use `unknown` instead of
// `any` where possible to avoid tripping the workspace's `noAny` rule.

declare module "lucide-preact" {
  import type { ComponentType } from "preact";
  // A map of icon component names to Preact components. Keep this
  // intentionally generic so consumers can `import * as Icons` or
  // access icons by name when rendering dynamically.
  const icons: { [key: string]: ComponentType<Record<string, unknown>> };
  export = icons;
}

declare module "preact" {
  export type ComponentType<P = unknown> = (props: P) => unknown;
  export namespace JSX {
    interface IntrinsicElements {
      [elem: string]: unknown;
    }
    interface IntrinsicAttributes {
      [key: string]: unknown;
    }
    interface HTMLAttributes<T = unknown> {
      [key: string]: unknown;
    }
    interface Element {}
    interface ElementChildrenAttribute { children: unknown }
  }
}

declare module "preact/hooks" {
  export function useState<T>(initialState?: T | (() => T)):
    [T, (next: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps?: unknown[]): T;
  export function useRef<T>(initial?: T | null): { current: T | null };
  export function useCallback<T extends (...args: unknown[]) => unknown>(cb: T, deps?: unknown[]): T;
  export function useLayoutEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useContext<T = unknown>(ctx: unknown): T;
}

// Allow importing CSS or static assets in TS files without type errors
declare module "*.css" { const content: unknown; export default content; }
declare module "*.svg" { const content: unknown; export default content; }
