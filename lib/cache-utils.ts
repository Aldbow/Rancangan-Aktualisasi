// Utility functions for client-side caching

// Cache with expiration
class ExpiringCache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  set(key: string, data: any, ttl: number = 300000) { // Default 5 minutes
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create a global instance
export const expiringCache = new ExpiringCache();

// Utility functions for localStorage with expiration
export const storage = {
  setWithExpiry(key: string, value: any, ttl: number = 300000) {
    const item = {
      value: value,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  getWithExpiry(key: string) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  },

  remove(key: string) {
    localStorage.removeItem(key);
  }
};

// Service worker registration for caching (optional)
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Cache warming function
export async function warmCache(urls: string[]) {
  const promises = urls.map(url => {
    return fetch(url, { cache: 'force-cache' })
      .then(response => response.text())
      .catch(err => {
        console.warn(`Failed to warm cache for ${url}:`, err);
        return null;
      });
  });

  return Promise.all(promises);
}