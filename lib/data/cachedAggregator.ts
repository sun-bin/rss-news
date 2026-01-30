// 带缓存的数据聚合服务
import type { Article } from "../../types/article.ts";
import { fetchAllRSS } from "../rss/fetcher.ts";
import { RSS_FEEDS } from "../../config/feeds.ts";

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

// 获取缓存的聚合数据（如果没有缓存会立即获取）
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
  
  // 立即开始新的获取（首次访问或缓存过期）
  console.log("缓存不存在或已过期，立即获取数据...");
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
    // 先获取 RSS 数据
    console.log("开始获取 RSS 数据...");
    const rssArticles = await fetchRSSWithTimeout();
    console.log(`RSS 获取完成: ${rssArticles.length} 篇文章`);
    
    // 再获取飞书数据
    console.log("开始获取飞书数据...");
    const feishuArticles = await fetchFeishuWithTimeout();
    console.log(`飞书获取完成: ${feishuArticles.length} 篇文章`);
    
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
    console.log(`数据获取完成: ${duration}ms, 总计 ${allArticles.length} 条`);
    
    return result;
  } catch (error) {
    console.error("获取数据失败:", error);
    
    // 如果有旧缓存，返回旧缓存（即使过期也比空的好）
    if (globalCache) {
      console.log("返回过期缓存数据");
      return globalCache;
    }
    
    // 如果连过期缓存都没有，返回空数据但标记为已获取
    console.log("无缓存可用，返回空数据");
    const emptyResult: CacheData = {
      articles: [],
      sources: { rss: 0, feishu: 0 },
      timestamp: Date.now(),
    };
    globalCache = emptyResult;
    lastFetchTime = Date.now();
    return emptyResult;
  }
}

// 带超时的 RSS 获取
async function fetchRSSWithTimeout(): Promise<Article[]> {
  try {
    console.log(`准备抓取 ${RSS_FEEDS.length} 个 RSS 源...`);
    
    // 设置 30 秒超时（给 RSS 足够时间）
    const timeoutPromise = new Promise<Article[]>((_, reject) => {
      setTimeout(() => reject(new Error("RSS 获取超时")), 30000);
    });
    
    const articles = await Promise.race([
      fetchAllRSS(RSS_FEEDS),
      timeoutPromise,
    ]);
    
    return articles;
  } catch (error) {
    console.error("RSS 获取失败或超时:", error);
    return [];
  }
}

// 带超时的飞书数据获取
async function fetchFeishuWithTimeout(): Promise<Article[]> {
  try {
    // 导入新的飞书客户端（使用自动刷新）
    const { fetchFeishuArticles } = await import("../feishu/client.ts");
    
    const timeoutPromise = new Promise<Article[]>((_, reject) => {
      setTimeout(() => reject(new Error("飞书获取超时")), 10000);
    });
    
    return await Promise.race([
      fetchFeishuArticles(),
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
