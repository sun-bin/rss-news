import { Handlers, PageProps } from "$fresh/server.ts";
import type { Article } from "../types/article.ts";
import { CATEGORIES } from "../config/categories.ts";
import { RSS_FEEDS } from "../config/feeds.ts";
import { fetchAllRSS } from "../lib/rss/fetcher.ts";

interface Data {
  articles: Article[];
  stats: {
    total: number;
    byCategory: Record<string, number>;
  };
  error?: string;
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

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    try {
      // 抓取所有 RSS 源
      const articles = await fetchAllRSS(RSS_FEEDS);
      
      // 统计各分类文章数量
      const byCategory: Record<string, number> = {};
      articles.forEach(article => {
        byCategory[article.category] = (byCategory[article.category] || 0) + 1;
      });

      return ctx.render({
        articles,
        stats: {
          total: articles.length,
          byCategory
        }
      });
    } catch (error) {
      console.error("抓取 RSS 失败:", error);
      return ctx.render({
        articles: [],
        stats: { total: 0, byCategory: {} },
        error: "抓取新闻失败，请稍后重试"
      });
    }
  }
};

export default function Home({ data }: PageProps<Data>) {
  const { articles, stats, error } = data;

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
          <a href="/" style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 21px; font-weight: 600; color: #1d1d1f; text-decoration: none;">洞察</a>
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
          <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: clamp(40px, 6vw, 64px); font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 16px; color: #1d1d1f;">新闻速递</h1>
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
      <section style="background: #f5f5f7; padding: 40px 24px 80px;">
        <div style="max-width: 1200px; margin: 0 auto;">
          {error ? (
            <div style="text-align: center; padding: 80px 20px; background: #ffffff; border-radius: 16px;">
              <div style="font-size: 64px; margin-bottom: 24px;">⚠️</div>
              <h3 style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 24px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px;">出错了</h3>
              <p style="font-size: 17px; color: #6e6e73;">{error}</p>
            </div>
          ) : articles.length === 0 ? (
            <div style="text-align: center; padding: 80px 20px; background: #ffffff; border-radius: 16px;">
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
