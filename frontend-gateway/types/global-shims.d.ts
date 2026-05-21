// Broad, permissive shims to help the TypeScript checker in this workspace.
// These are intentionally permissive to reduce noise while we iteratively fix real issues.

declare module "lucide-preact" {
  const _default: any;
  export = _default;
  export default _default;
}

declare module "preact" {
  export type ComponentType<P = any> = (props: P) => any;
  export namespace JSX {
    interface IntrinsicElements {
      [elem: string]: any;
    }
    interface IntrinsicAttributes {
      [key: string]: any;
    }
    interface HTMLAttributes<T = any> {
      [key: string]: any;
    }
    interface Element {}
    interface ElementChildrenAttribute { children: {} }
  }
}

declare module "preact/hooks" {
  export function useState<T>(initialState?: T | (() => T)):
    [T, (next: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps?: any[]): T;
  export function useRef<T>(initial?: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(cb: T, deps?: any[]): T;
  export function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useContext<T = any>(ctx: any): T;
}

// Allow importing CSS or static assets in TS files without type errors
declare module "*.css" { const content: any; export default content; }
declare module "*.svg" { const content: any; export default content; }
