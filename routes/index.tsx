import { Handlers, PageProps } from "$fresh/server.ts";
import type { Article } from "../types/article.ts";
import { CATEGORIES } from "../config/categories.ts";

interface Data {
  articles: Article[];
  stats: {
    total: number;
    byCategory: Record<string, number>;
  };
}

// 清理RSS链接中的CDATA和其他格式
function cleanLink(link: string): string {
  if (!link) return "#";
  
  // 移除 CDATA 标记
  let cleaned = link.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "");
  
  // 移除空白字符
  cleaned = cleaned.trim();
  
  // 确保链接以 http:// 或 https:// 开头
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    if (cleaned.startsWith("//")) {
      cleaned = "https:" + cleaned;
    } else if (cleaned.startsWith("/")) {
      cleaned = "#";
    } else if (!cleaned || cleaned === "null" || cleaned === "undefined") {
      cleaned = "#";
    }
  }
  
  return cleaned;
}

// 模拟数据 - 使用真实存在的链接
const mockArticles: Article[] = [
  {
    id: "1",
    title: "Apple 发布全新 M4 芯片，性能提升显著",
    description: "苹果公司今日发布了全新的 M4 芯片，采用先进的 3nm 工艺，在性能和能效方面都有显著提升...",
    link: "https://www.apple.com/newsroom/",
    publishedAt: new Date(),
    category: "technology",
    source: { name: "Apple Newsroom", url: "https://www.apple.com/newsroom/" }
  },
  {
    id: "2",
    title: "全球气候变化峰会达成重要共识",
    description: "在最新的气候变化峰会上，各国代表就减排目标达成重要共识，承诺在2030年前实现碳排放大幅减少...",
    link: "https://www.un.org/climatechange",
    publishedAt: new Date(Date.now() - 3600000),
    category: "world",
    source: { name: "UN Climate Change", url: "https://www.un.org/climatechange" }
  },
  {
    id: "3",
    title: "全球股市创年度新高，投资者信心增强",
    description: "受利好消息影响，全球主要股市今日集体上涨，创下年度新高，市场投资者信心明显增强...",
    link: "https://www.bloomberg.com/markets",
    publishedAt: new Date(Date.now() - 7200000),
    category: "business",
    source: { name: "Bloomberg Markets", url: "https://www.bloomberg.com/markets" }
  },
  {
    id: "4",
    title: "科学家发现新型抗癌药物，临床试验效果显著",
    description: "一项最新的医学研究表明，新型抗癌药物在临床试验中展现出显著的治疗效果...",
    link: "https://www.nature.com/subjects/medicine",
    publishedAt: new Date(Date.now() - 10800000),
    category: "science",
    source: { name: "Nature Medicine", url: "https://www.nature.com/subjects/medicine" }
  },
  {
    id: "5",
    title: "世界杯决赛精彩回顾：冠军诞生时刻",
    description: "昨晚的世界杯决赛精彩纷呈，双方球队展开激烈角逐，最终冠军在点球大战中诞生...",
    link: "https://www.fifa.com/worldcup",
    publishedAt: new Date(Date.now() - 14400000),
    category: "sports",
    source: { name: "FIFA World Cup", url: "https://www.fifa.com/worldcup" }
  },
  {
    id: "6",
    title: "人工智能在医疗领域的最新突破",
    description: "AI技术在医疗诊断领域取得重大突破，新算法能够更准确地识别早期疾病迹象...",
    link: "https://www.who.int/health-topics/digital-health",
    publishedAt: new Date(Date.now() - 18000000),
    category: "technology",
    source: { name: "WHO Digital Health", url: "https://www.who.int/health-topics/digital-health" }
  }
];

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const byCategory: Record<string, number> = {};
    mockArticles.forEach(article => {
      byCategory[article.category] = (byCategory[article.category] || 0) + 1;
    });

    return ctx.render({
      articles: mockArticles,
      stats: {
        total: mockArticles.length,
        byCategory
      }
    });
  }
};

export default function Home({ data }: PageProps<Data>) {
  const { articles, stats } = data;

  const getCategoryName = (slug: string): string => {
    const cat = CATEGORIES.find(c => c.slug === slug);
    return cat?.name || "综合";
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "刚刚";
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  return (
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif; background: #f5f5f7; color: #1d1d1f; margin: 0; padding: 0;">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; }
      `}</style>
      
      {/* 导航栏 */}
      <nav style="background: rgba(255, 255, 255, 0.8); backdrop-filter: saturate(180%) blur(20px); position: fixed; top: 0; left: 0; right: 0; z-index: 9999; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 52px; display: flex; align-items: center; justify-content: space-between;">
          <a href="/" style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 21px; font-weight: 600; color: #1d1d1f; text-decoration: none;">News</a>
          <ul style="display: flex; gap: 32px; list-style: none; margin: 0; padding: 0;">
            <li><a href="/" style="font-size: 14px; color: #1d1d1f; text-decoration: none; opacity: 0.8; transition: opacity 0.3s;">首页</a></li>
            <li><a href="#tech" style="font-size: 14px; color: #1d1d1f; text-decoration: none; opacity: 0.8; transition: opacity 0.3s;">科技</a></li>
            <li><a href="#world" style="font-size: 14px; color: #1d1d1f; text-decoration: none; opacity: 0.8; transition: opacity 0.3s;">国际</a></li>
            <li><a href="#business" style="font-size: 14px; color: #1d1d1f; text-decoration: none; opacity: 0.8; transition: opacity 0.3s;">商业</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero区域 */}
      <section style="background: #ffffff; padding: 120px 24px 60px; text-align: center;">
        <div style="max-width: 800px; margin: 0 auto;">
          <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: clamp(40px, 6vw, 64px); font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 16px; color: #1d1d1f;">新闻中心</h1>
          <p style="font-size: 21px; color: #6e6e73; margin-bottom: 40px;">汇聚全球资讯，洞察世界脉搏</p>
          <div style="display: flex; justify-content: center; gap: 60px;">
            <div style="text-align: center;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 40px; font-weight: 600; color: #1d1d1f; margin-bottom: 4px;">{stats.total}</div>
              <div style="font-size: 14px; color: #6e6e73;">今日文章</div>
            </div>
            <div style="text-align: center;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 40px; font-weight: 600; color: #1d1d1f; margin-bottom: 4px;">{CATEGORIES.length}</div>
              <div style="font-size: 14px; color: #6e6e73;">分类频道</div>
            </div>
            <div style="text-align: center;">
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 40px; font-weight: 600; color: #1d1d1f; margin-bottom: 4px;">24/7</div>
              <div style="font-size: 14px; color: #6e6e73;">实时更新</div>
            </div>
          </div>
        </div>
      </section>

      {/* 分类标签 */}
      <section style="background: #ffffff; padding: 0 24px 40px; text-align: center;">
        <div style="display: inline-flex; gap: 8px; padding: 6px; background: #f5f5f7; border-radius: 100px;">
          <a href="/" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; font-size: 14px; color: #1d1d1f; text-decoration: none; border-radius: 100px; background: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
            <span>全部</span>
            <span style="font-size: 12px; color: #6e6e73; background: #f5f5f7; padding: 2px 8px; border-radius: 100px;">{stats.total}</span>
          </a>
          {CATEGORIES.filter(c => c.slug !== "general").map(cat => (
            <a href={`/category/${cat.slug}`} style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; font-size: 14px; color: #1d1d1f; text-decoration: none; border-radius: 100px; transition: all 0.3s;" key={cat.slug}>
              <span>{cat.name}</span>
              <span style="font-size: 12px; color: #6e6e73; background: #f5f5f7; padding: 2px 8px; border-radius: 100px;">{stats.byCategory[cat.slug] || 0}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 内容区域 */}
      <section style="background: #f5f5f7; padding: 60px 24px 80px;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 48px;">
            <h2 style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 32px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px;">最新资讯</h2>
            <p style="font-size: 17px; color: #6e6e73;">精选全球热门新闻，实时更新</p>
          </div>

          {articles.length === 0 ? (
            <div style="text-align: center; padding: 80px 20px;">
              <div style="font-size: 64px; margin-bottom: 24px;">📰</div>
              <h3 style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 24px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px;">暂无文章</h3>
              <p style="font-size: 17px; color: #6e6e73;">正在抓取最新资讯，请稍后再试</p>
            </div>
          ) : (
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px;">
              {articles.map((article) => (
                <a
                  href={cleanLink(article.link)}
                  style="background: #ffffff; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; text-decoration: none; color: inherit; transition: all 0.3s; border: 1px solid transparent; height: 100%;"
                  key={article.id}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #0071e3; margin-bottom: 12px; padding: 4px 10px; background: rgba(0, 113, 227, 0.08); border-radius: 6px; width: fit-content;">{getCategoryName(article.category)}</span>
                  <h3 style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 19px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; color: #1d1d1f; margin-bottom: 12px; transition: color 0.3s;">{article.title}</h3>
                  <p style="font-size: 15px; line-height: 1.5; color: #6e6e73; margin-bottom: 20px; flex-grow: 1;">{article.description}</p>
                  <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid #e8e8ed;">
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #86868b;">
                      <span>{article.source.name}</span>
                      <span style="width: 3px; height: 3px; background: #86868b; border-radius: 50%;"></span>
                      <span>{formatTime(article.publishedAt)}</span>
                    </div>
                    <div style="width: 28px; height: 28px; background: #f5f5f7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #0071e3; font-size: 12px;">→</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style="background: #ffffff; padding: 40px 24px; border-top: 1px solid #e8e8ed;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <p style="font-size: 13px; color: #6e6e73; margin: 0;">© 2026 News Center. All rights reserved.</p>
          <ul style="display: flex; gap: 24px; list-style: none; margin: 0; padding: 0;">
            <li><a href="#" style="font-size: 13px; color: #6e6e73; text-decoration: none; transition: color 0.3s;">关于我们</a></li>
            <li><a href="#" style="font-size: 13px; color: #6e6e73; text-decoration: none; transition: color 0.3s;">隐私政策</a></li>
            <li><a href="#" style="font-size: 13px; color: #6e6e73; text-decoration: none; transition: color 0.3s;">联系方式</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
