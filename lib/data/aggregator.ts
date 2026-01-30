// 数据聚合服务 - 合并 RSS 和飞书表格数据
import type { Article } from "../../types/article.ts";
import { fetchAllRSS } from "../rss/fetcher.ts";
import { RSS_FEEDS } from "../../config/feeds.ts";
import { fetchFeishuArticlesWithToken } from "../feishu/client.ts";

// 聚合所有数据源
export async function aggregateArticles(): Promise<{
  articles: Article[];
  sources: {
    rss: number;
    feishu: number;
  };
}> {
  console.log("开始聚合数据...");
  
  // 并行获取 RSS 和飞书数据
  const [rssArticles, feishuArticles] = await Promise.all([
    fetchAllRSS(RSS_FEEDS),
    fetchFeishuData(),
  ]);
  
  // 合并文章列表
  const allArticles = [...rssArticles, ...feishuArticles];
  
  // 按发布时间排序（最新的在前）
  allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  
  console.log(`数据聚合完成: RSS ${rssArticles.length} 条, 飞书 ${feishuArticles.length} 条, 总计 ${allArticles.length} 条`);
  
  return {
    articles: allArticles,
    sources: {
      rss: rssArticles.length,
      feishu: feishuArticles.length,
    },
  };
}

// 按分类聚合数据
export async function aggregateArticlesByCategory(
  category: string
): Promise<{
  articles: Article[];
  sources: {
    rss: number;
    feishu: number;
  };
}> {
  console.log(`开始聚合分类 ${category} 的数据...`);
  
  // 获取该分类的 RSS 源
  const categoryFeeds = RSS_FEEDS.filter(
    (feed) => feed.category === category && feed.enabled
  );
  
  // 并行获取数据
  const [rssArticles, feishuArticles] = await Promise.all([
    fetchAllRSS(categoryFeeds),
    fetchFeishuDataByCategory(category),
  ]);
  
  // 合并并排序
  const allArticles = [...rssArticles, ...feishuArticles];
  allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  
  console.log(
    `分类 ${category} 聚合完成: RSS ${rssArticles.length} 条, 飞书 ${feishuArticles.length} 条`
  );
  
  return {
    articles: allArticles,
    sources: {
      rss: rssArticles.length,
      feishu: feishuArticles.length,
    },
  };
}

// 获取飞书数据（带缓存）
async function fetchFeishuData(): Promise<Article[]> {
  try {
    // 从环境变量获取令牌
    const appToken = Deno.env.get("FEISHU_APP_TOKEN");
    
    if (!appToken) {
      console.log("未配置 FEISHU_APP_TOKEN，跳过飞书数据获取");
      return [];
    }
    
    const personalToken = Deno.env.get("FEISHU_PERSONAL_TOKEN");
    
    return await fetchFeishuArticlesWithToken(appToken, personalToken);
  } catch (error) {
    console.error("获取飞书数据失败:", error);
    return [];
  }
}

// 按分类获取飞书数据
async function fetchFeishuDataByCategory(category: string): Promise<Article[]> {
  const allArticles = await fetchFeishuData();
  return allArticles.filter((article) => article.category === category);
}

// 手动导入的飞书数据（用于测试或临时导入）
export function importFeishuArticles(manualData: Array<{
  标题: string;
  描述?: string;
  链接?: string;
  分类?: string;
  来源?: string;
  发布时间?: string;
}>): Article[] {
  return manualData.map((item, index) => {
    const categoryMap: Record<string, string> = {
      "科技": "technology",
      "国际": "world",
      "商业": "business",
      "科学": "science",
      "体育": "sports",
    };
    
    return {
      id: `feishu-manual-${index}`,
      title: item.标题,
      description: item.描述 || "",
      link: item.链接 || "#",
      publishedAt: item.发布时间 ? new Date(item.发布时间) : new Date(),
      category: categoryMap[item.分类 || ""] || "general",
      source: {
        name: item.来源 || "飞书表格",
        url: "https://feishu.cn",
      },
    };
  });
}
