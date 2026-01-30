// 带缓存的数据聚合服务
import type { Article } from "../../types/article.ts";
import { fetchAllRSS } from "../rss/fetcher.ts";
import { RSS_FEEDS } from "../../config/feeds.ts";
import { fetchFeishuArticlesWithToken } from "../feishu/client.ts";

// 全局缓存
interface CacheData {
  articles: Article[];
  sources: {
    rss: number;
    feishu: number;
  };
  timestamp: number;
}

// 缓存配置
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// 内存缓存
let globalCache: CacheData | null = null;
let lastFetchTime = 0;
let isFetching = false;
let fetchPromise: Promise<CacheData> | null = null;

// 获取缓存的聚合数据
export async function getCachedArticles(): Promise<CacheData> {
  const now = Date.now();
  
  // 如果有有效缓存，直接返回
  if (globalCache && now - lastFetchTime < CACHE_TTL) {
    console.log("使用缓存数据，年龄:", Math.round((now - lastFetchTime) / 1000), "秒");
    return globalCache;
  }
  
  // 如果正在获取中，等待获取完成
  if (isFetching && fetchPromise) {
    console.log("等待正在进行的获取...");
    return fetchPromise;
  }
  
  // 开始新的获取
  isFetching = true;
  fetchPromise = fetchAndCacheArticles();
  
  try {
    const result = await fetchPromise;
    return result;
  } finally {
    isFetching = false;
    fetchPromise = null;
  }
}

// 获取并缓存文章
async function fetchAndCacheArticles(): Promise<CacheData> {
  console.log("开始获取新数据...");
  const startTime = Date.now();
  
  try {
    // 并行获取 RSS 和飞书数据
    const [rssArticles, feishuArticles] = await Promise.all([
      fetchRSSWithTimeout(),
      fetchFeishuWithTimeout(),
    ]);
    
    // 合并文章列表
    const allArticles = [...rssArticles, ...feishuArticles];
    
    // 按发布时间排序（最新的在前）
    allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    
    const result: CacheData = {
      articles: allArticles,
      sources: {
        rss: rssArticles.length,
        feishu: feishuArticles.length,
      },
      timestamp: Date.now(),
    };
    
    // 更新缓存
    globalCache = result;
    lastFetchTime = Date.now();
    
    const duration = Date.now() - startTime;
    console.log(`数据获取完成: ${duration}ms, RSS ${rssArticles.length} 条, 飞书 ${feishuArticles.length} 条`);
    
    return result;
  } catch (error) {
    console.error("获取数据失败:", error);
    // 如果有旧缓存，返回旧缓存
    if (globalCache) {
      console.log("返回过期缓存数据");
      return globalCache;
    }
    // 否则返回空数据
    return {
      articles: [],
      sources: { rss: 0, feishu: 0 },
      timestamp: Date.now(),
    };
  }
}

// 带超时的 RSS 获取
async function fetchRSSWithTimeout(): Promise<Article[]> {
  try {
    // 设置 8 秒超时
    const timeoutPromise = new Promise<Article[]>((_, reject) => {
      setTimeout(() => reject(new Error("RSS 获取超时")), 8000);
    });
    
    return await Promise.race([
      fetchAllRSS(RSS_FEEDS),
      timeoutPromise,
    ]);
  } catch (error) {
    console.error("RSS 获取失败或超时:", error);
    return [];
  }
}

// 带超时的飞书数据获取
async function fetchFeishuWithTimeout(): Promise<Article[]> {
  try {
    const appToken = Deno.env.get("FEISHU_APP_TOKEN");
    if (!appToken) {
      return [];
    }
    
    const timeoutPromise = new Promise<Article[]>((_, reject) => {
      setTimeout(() => reject(new Error("飞书获取超时")), 5000);
    });
    
    const personalToken = Deno.env.get("FEISHU_PERSONAL_TOKEN");
    
    return await Promise.race([
      fetchFeishuArticlesWithToken(appToken, personalToken),
      timeoutPromise,
    ]);
  } catch (error) {
    console.error("飞书获取失败或超时:", error);
    return [];
  }
}

// 按分类获取缓存数据
export async function getCachedArticlesByCategory(category: string): Promise<CacheData> {
  const allData = await getCachedArticles();
  
  const filteredArticles = allData.articles.filter(
    (article) => article.category === category
  );
  
  // 计算该分类的来源统计
  const rssCount = filteredArticles.filter(
    (a) => !a.id.startsWith("feishu")
  ).length;
  const feishuCount = filteredArticles.filter(
    (a) => a.id.startsWith("feishu")
  ).length;
  
  return {
    articles: filteredArticles,
    sources: {
      rss: rssCount,
      feishu: feishuCount,
    },
    timestamp: allData.timestamp,
  };
}

// 强制刷新缓存
export async function refreshCache(): Promise<CacheData> {
  globalCache = null;
  lastFetchTime = 0;
  return getCachedArticles();
}

// 获取缓存状态
export function getCacheStatus(): {
  hasCache: boolean;
  age: number;
  isFetching: boolean;
} {
  return {
    hasCache: globalCache !== null,
    age: lastFetchTime ? Date.now() - lastFetchTime : 0,
    isFetching,
  };
}
