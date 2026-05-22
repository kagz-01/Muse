# Performance Optimization Guide

This document outlines the performance optimization strategies implemented in the Muse platform.

## Lazy Loading

### Component Lazy Loading
Components are lazy-loaded to reduce initial bundle size:

```typescript
import { lazyLoad, LazyBoundary } from "../utils/performance.ts";

const HeavyComponent = lazyLoad(() =>
  import("./HeavyComponent.tsx")
);

export default function Page() {
  return (
    <LazyBoundary fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </LazyBoundary>
  );
}
```

### Viewport Detection
Use intersection observer to lazy-load components when they come into view:

```typescript
import { useIntersection } from "../utils/performance.ts";

export default function LazyImage({ src }) {
  const ref = useRef(null);
  const isVisible = useIntersection(ref);

  return (
    <img
      ref={ref}
      src={isVisible ? src : undefined}
      loading="lazy"
    />
  );
}
```

## Image Optimization

### URL Optimization
Optimize image URLs with CDN parameters:

```typescript
import { optimizeImageUrl } from "../utils/images.ts";

const optimized = optimizeImageUrl(imageUrl, 400, 85);
// Returns: "https://example.com/image.jpg?w=400&q=85"
```

### Image Preloading
Preload critical images before rendering:

```typescript
import { preloadImage } from "../utils/images.ts";

useEffect(() => {
  preloadImage(heroImageUrl);
}, [heroImageUrl]);
```

### Cachebusting
Auto-refresh cached images:

```typescript
import { getCachebustedUrl } from "../utils/images.ts";

const freshUrl = getCachebustedUrl(imageUrl);
```

## API Response Caching

### Simple Caching
Cache API responses with automatic expiration:

```typescript
import { setCache, getCache } from "../utils/cache.ts";

// Set cache with 5 second TTL
setCache("user-data", userData, 5000);

// Get from cache (returns null if expired)
const cached = getCache("user-data");
```

### Cached Fetch
Automatically cache API responses:

```typescript
import { cachedFetch } from "../utils/cache.ts";

// Fetches once, then serves from cache for 5 seconds
const data = await cachedFetch("/api/users", 5000);
```

### Batch Requests
Efficiently fetch multiple URLs with caching:

```typescript
import { batchCachedFetch } from "../utils/cache.ts";

const results = await batchCachedFetch([
  "/api/users",
  "/api/posts",
  "/api/comments",
]);
```

## Animation Optimization

### RAF Throttling
Throttle animations using requestAnimationFrame:

```typescript
import { throttleRAF } from "../utils/performance.ts";

const handleScroll = throttleRAF(() => {
  // Expensive scroll handler
  updateLayout();
});

addEventListener("scroll", handleScroll);
```

### Debouncing
Debounce frequent events like input:

```typescript
import { debounce } from "../utils/performance.ts";

const handleSearch = debounce((query) => {
  // API call
  searchUsers(query);
}, 300);
```

## CSS Performance

### CSS Classes
Use CSS class names instead of inline styles for better performance:

```tsx
// ✗ Bad: Recreated on every render
<div style={{ backgroundColor: color }}>

// ✓ Good: Cached class
<div className="bg-primary">
```

### Tailwind Optimizations
- Use predefined size classes (sm, md, lg) instead of custom values
- Avoid dynamic class generation in render loops
- Use CSS variables for theme colors

## Memory Management

### Cache Cleanup
Clear cache when data becomes stale:

```typescript
import { clearCache, clearAllCache } from "../utils/cache.ts";

// Clear specific cache
clearCache("user-data");

// Clear all cache
clearAllCache();
```

### Signal Cleanup
Unsubscribe from signals in useEffect cleanup:

```typescript
import { useEffect } from "preact/hooks";

useEffect(() => {
  const handleChange = () => {
    // Signal changed
  };

  // Preact signals don't require manual unsubscribe,
  // but cleanup heavy operations
  return () => {
    // Cleanup
  };
}, []);
```

## Bundle Analysis

### Import Analysis
Keep imports lean and use code splitting:

```typescript
// ✓ Good: Named imports
import { signal } from "@preact/signals";

// ✗ Avoid: Importing entire library
import * as preact from "preact";
```

## Performance Metrics

### Key Metrics to Monitor
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s

### Measurement
Use performance API:

```typescript
if (typeof window !== "undefined" && "performance" in window) {
  const metrics = performance.getEntriesByType("navigation");
  console.log("Load metrics:", metrics);
}
```

## Best Practices

1. **Always use loading indicators** when fetching data
2. **Implement error boundaries** for component failures
3. **Cache API responses** to reduce network calls
4. **Use lazy loading** for images and components
5. **Debounce/throttle** expensive operations
6. **Monitor bundle size** and use code splitting
7. **Optimize images** before serving
8. **Use CDN** for static assets
9. **Enable gzip compression** on server
10. **Test on slow networks** and low-end devices
