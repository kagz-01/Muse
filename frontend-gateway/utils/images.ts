// Image optimization utilities for performance

interface ImageCache {
  [url: string]: {
    data: string;
    timestamp: number;
  };
}

const imageCache: ImageCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Generate optimized image URL with size parameters
export const optimizeImageUrl = (
  url: string,
  width: number,
  quality: number = 85,
): string => {
  if (!url) return "";

  // Add CDN-style parameters if it's a data URL or external image
  if (url.startsWith("http") && !url.includes("?")) {
    const params = new URLSearchParams({
      w: String(width),
      q: String(quality),
    });
    return `${url}?${params.toString()}`;
  }

  return url;
};

// Preload images for better performance
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// Cache buster for updated images
export const getCachebustedUrl = (url: string): string => {
  const cached = imageCache[url];
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const cacheBuster = Date.now();
  const bustedUrl = url + (url.includes("?") ? "&" : "?") +
    `_cb=${cacheBuster}`;

  imageCache[url] = {
    data: bustedUrl,
    timestamp: now,
  };

  return bustedUrl;
};

// Blurhash or placeholder while loading
export const getPlaceholder = (type: "avatar" | "image" | "card"): string => {
  const placeholders = {
    avatar:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23444' width='100' height='100'/%3E%3C/svg%3E",
    image:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23333' width='400' height='300'/%3E%3C/svg%3E",
    card:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect fill='%23222' width='300' height='200'/%3E%3C/svg%3E",
  };
  return placeholders[type];
};
