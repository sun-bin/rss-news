// RSS 抓取服务
import type { Article, RSSSource } from "../../types/article.ts";

// 解析 RSS XML
function parseRSS(xml: string, source: RSSSource): Article[] {
  const articles: Article[] = [];
  
  // 提取 item 元素
  const itemRegex = /<item[^>]*>[\s\S]*?<\/item>/gi;
  const items = xml.match(itemRegex) || [];
  
  for (const item of items.slice(0, 10)) { // 每个源最多取10条
    try {
      // 提取标题
      const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const title = titleMatch ? cleanText(titleMatch[1]) : '无标题';
      
      // 提取链接
      const linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const link = linkMatch ? cleanText(linkMatch[1]) : source.url;
      
      // 提取描述
      const descMatch = item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
      let description = descMatch ? cleanText(descMatch[1]) : '';
      // 去除 HTML 标签
      description = description.replace(/<[^>]+>/g, '').slice(0, 200);
      
      // 提取发布时间
      const dateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
                       item.match(/<published[^>]*>([\s\S]*?)<\/published>/i);
      const publishedAt = dateMatch ? new Date(dateMatch[1]) : new Date();
      
      // 生成唯一 ID
      const id = `${source.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      articles.push({
        id,
        title,
        description: description || '暂无描述',
        link,
        publishedAt,
        category: source.category,
        source: {
          name: source.name,
          url: source.url,
        },
      });
    } catch (error) {
      console.error(`解析 RSS 项目失败:`, error);
    }
  }
  
  return articles;
}

// 清理文本
function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// 抓取单个 RSS 源
async function fetchRSS(source: RSSSource): Promise<Article[]> {
  try {
    console.log(`正在抓取: ${source.name}`);
    
    // 使用 Promise.race 实现超时
    const fetchPromise = fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
      },
    });
    
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 8000);
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const xml = await response.text();
    const articles = parseRSS(xml, source);
    
    console.log(`✓ ${source.name}: ${articles.length} 篇`);
    return articles;
  } catch (error) {
    console.error(`✗ ${source.name}:`, (error as Error).message);
    return [];
  }
}

// 抓取所有 RSS 源
export async function fetchAllRSS(sources: RSSSource[]): Promise<Article[]> {
  console.log(`开始抓取 ${sources.length} 个 RSS 源...`);
  const startTime = Date.now();
  
  // 并行抓取所有源，但限制并发数
  const batchSize = 5; // 每批5个
  const allArticles: Article[] = [];
  
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(source => fetchRSS(source))
    );
    
    for (const articles of results) {
      allArticles.push(...articles);
    }
    
    // 批次间小延迟，避免并发过大
    if (i + batchSize < sources.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // 按发布时间排序（最新的在前）
  allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  
  const duration = Date.now() - startTime;
  console.log(`抓取完成: ${allArticles.length} 篇文章, 耗时 ${duration}ms`);
  
  return allArticles;
}

// 按分类抓取 RSS
export async function fetchRSSByCategory(
  sources: RSSSource[],
  category: string
): Promise<Article[]> {
  const filteredSources = sources.filter(s => s.category === category);
  return fetchAllRSS(filteredSources);
}
