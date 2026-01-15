// 缓存策略实现
import type { Article, CachedArticle } from "../../types/article.ts";

export class CacheStrategy {
  private memoryCache = new Map<string, CachedArticle>();
  private readonly MEMORY_TTL = 10 * 60 * 1000; // 10分钟

  async get(key: string): Promise<Article | null> {
    // 先从内存缓存获取
    const cached = this.memoryCache.get(key);
    if (cached) {
      if (Date.now() - cached.cachedAt.getTime() < cached.ttl) {
        return cached.article;
      } else {
        this.memoryCache.delete(key);
      }
    }
    return null;
  }

  async set(key: string, article: Article, ttl: number = this.MEMORY_TTL): Promise<void> {
    const cached: CachedArticle = {
      article,
      cachedAt: new Date(),
      ttl
    };
    this.memoryCache.set(key, cached);
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
  }

  startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, cached] of this.memoryCache.entries()) {
        if (now - cached.cachedAt.getTime() >= cached.ttl) {
          this.memoryCache.delete(key);
        }
      }
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }
}

export const cacheStrategy = new CacheStrategy();