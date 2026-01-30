import { Handlers, PageProps } from "$fresh/server.ts";
import type { Article } from "../../types/article.ts";
import { CATEGORIES } from "../../config/categories.ts";
import { aggregateArticlesByCategory } from "../../lib/data/aggregator.ts";

interface Data {
  articles: Article[];
  category: {
    slug: string;
    name: string;
  };
  stats: {
    total: number;
    sources: {
      rss: number;
      feishu: number;
    };
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
    const { slug } = ctx.params;
    
    // 查找分类
    const category = CATEGORIES.find(c => c.slug === slug);
    if (!category) {
      return ctx.render({
        articles: [],
        category: { slug, name: "未知分类" },
        stats: { total: 0, sources: { rss: 0, feishu: 0 } },
        error: "分类不存在"
      });
    }
    
    try {
      // 聚合该分类的 RSS 和飞书数据
      const { articles, sources } = await aggregateArticlesByCategory(slug);
      
      return ctx.render({
        articles,
        category: {
          slug: category.slug,
          name: category.name
        },
        stats: {
          total: articles.length,
          sources
        }
      });
    } catch (error) {
      console.error(`抓取分类 ${slug} 的新闻失败:`, error);
      return ctx.render({
        articles: [],
        category: {
          slug: category.slug,
          name: category.name
        },
        stats: { total: 0, sources: { rss: 0, feishu: 0 } },
        error: "抓取新闻失败，请稍后重试"
      });
    }
  }
};

export default function CategoryPage({ data }: PageProps<Data>) {
  const { articles, category, stats, error } = data;

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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      
      {/* 科技感头部 */}
      <header style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); position: relative; overflow: hidden;">
        {/* 背景网格效果 */}
        <div style="position: absolute; inset: 0; background-image: radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0); background-size: 40px 40px; opacity: 0.5;"></div>
        {/* 光晕效果 */}
        <div style="position: absolute; top: -50%; left: -20%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%); filter: blur(60px);"></div>
        <div style="position: absolute; bottom: -30%; right: -10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%); filter: blur(40px);"></div>
        
        {/* 导航栏 */}
        <nav style="position: relative; z-index: 10; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between;">
            <a href="/" style="display: flex; align-items: center; gap: 8px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: 20px; font-weight: 700; color: #ffffff; text-decoration: none;">
              <span style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">◆</span>
              洞察
            </a>
            <ul style="display: flex; gap: 8px; list-style: none; margin: 0; padding: 0;">
              <li><a href="/" style="padding: 8px 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); text-decoration: none; border-radius: 6px; transition: all 0.3s;">首页</a></li>
              <li><a href="/category/technology" style="padding: 8px 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); text-decoration: none; border-radius: 6px; transition: all 0.3s;">科技</a></li>
              <li><a href="/category/world" style="padding: 8px 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); text-decoration: none; border-radius: 6px; transition: all 0.3s;">国际</a></li>
              <li><a href="/category/business" style="padding: 8px 16px; font-size: 14px; color: rgba(255, 255, 255, 0.7); text-decoration: none; border-radius: 6px; transition: all 0.3s;">商业</a></li>
            </ul>
          </div>
        </nav>

        {/* Hero区域 */}
        <section style="position: relative; z-index: 10; padding: 48px 24px 32px; text-align: center;">
          <div style="max-width: 800px; margin: 0 auto;">
            {/* 实时状态指示器 */}
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 100px; margin-bottom: 24px;">
              <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite;"></span>
              <span style="font-size: 13px; color: rgba(255, 255, 255, 0.8);">实时更新中</span>
            </div>
            
            {/* 主标题 */}
            <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-size: clamp(32px, 5vw, 48px); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 12px; color: #ffffff;">
              {category.name}
            </h1>
            <p style="font-size: 16px; color: rgba(255, 255, 255, 0.6); margin-bottom: 32px;">{stats.total} 篇相关文章</p>
            
            {/* 数据来源统计 */}
            <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
              <div style="padding: 12px 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
                <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">{stats.sources.rss}</div>
                <div style="font-size: 11px; color: rgba(255, 255, 255, 0.5);">RSS源</div>
              </div>
              <div style="padding: 12px 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
                <div style="font-size: 20px; font-weight: 700; color: #8b5cf6;">{stats.sources.feishu}</div>
                <div style="font-size: 11px; color: rgba(255, 255, 255, 0.5);">飞书表格</div>
              </div>
            </div>
          </div>
        </section>
      </header>

      {/* 分类标签 */}
      <section style="background: #ffffff; padding: 0 24px 40px; text-align: center;">
        <div style="display: inline-flex; gap: 8px; padding: 6px; background: #f5f5f7; border-radius: 100px;">
          <a href="/" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; font-size: 14px; color: #1d1d1f; text-decoration: none; border-radius: 100px; transition: all 0.3s;">
            <span>全部</span>
          </a>
          {CATEGORIES.filter(c => c.slug !== "general").map(cat => (
            <a 
              href={`/category/${cat.slug}`} 
              style={`display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; font-size: 14px; color: #1d1d1f; text-decoration: none; border-radius: 100px; transition: all 0.3s; ${cat.slug === category.slug ? 'background: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);' : ''}`} 
              key={cat.slug}
            >
              <span>{cat.name}</span>
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
                  <span style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #0071e3; margin-bottom: 12px; padding: 4px 10px; background: rgba(0, 113, 227, 0.08); border-radius: 6px; width: fit-content;">{category.name}</span>
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
