import { Handlers, PageProps } from "$fresh/server.ts";
import type { Article } from "$types/article.ts";
import { getArticlesWithCache } from "$lib/cache/strategy.ts";
import { CATEGORIES } from "$config/categories.ts";
import type { Category } from "$types/category.ts";

interface Data {
  articles: Article[];
  categories: Category[];
  stats: {
    total: number;
    byCategory: Record<string, number>;
  };
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    try {
      const allArticles = await getArticlesWithCache();
      const byCategory: Record<string, number> = {};
      for (const article of allArticles) {
        byCategory[article.category] = (byCategory[article.category] || 0) + 1;
      }
      return ctx.render({
        articles: allArticles.slice(0, 100),
        categories: CATEGORIES,
        stats: { total: allArticles.length, byCategory },
      });
    } catch (error) {
      console.error("Error loading articles:", error);
      return ctx.render({
        articles: [],
        categories: CATEGORIES,
        stats: { total: 0, byCategory: {} },
      });
    }
  },
};

export default function Home({ data }: PageProps<Data>) {
  const { articles, categories, stats } = data;

  return (
    <div>
      {/* 导航栏 */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-title">新闻中心</div>
          <ul className="nav-links">
            <li>
              <a href="/" className="nav-link">全部</a>
            </li>
            <li>
              <a href="#tech" className="nav-link">科技</a>
            </li>
            <li>
              <a href="#world" className="nav-link">国际</a>
            </li>
            <li>
              <a href="#business" className="nav-link">商业</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero 区域 */}
      <div className="hero">
        <h1 className="hero-title">新闻</h1>
        <p className="hero-subtitle">今日 {stats.total} 篇精选文章</p>
      </div>

      {/* 分类标签 */}
      <div className="tabs">
        <div className="tabs-inner">
          <a href="/" className="tab active">
            <span>全部</span>
          </a>
          {categories.filter((c) => c.slug !== "general").map((cat) => (
            <a
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="tab"
            >
              <span>{cat.name}</span>
              <span className="tab-count">
                {stats.byCategory[cat.slug] || 0}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="content">
        <div className="content-inner">
          {articles.length === 0
            ? (
              <div className="empty">
                <div className="empty-icon">📰</div>
                <h2 className="empty-title">正在加载</h2>
                <p className="empty-text">
                  首次启动需要抓取新闻源，请稍候片刻
                </p>
              </div>
            )
            : (
              <>
                <h2 className="section-title">最新资讯</h2>
                <div className="grid">
                  {articles.map((article, index) => (
                    <a
                      key={article.id}
                      href={article.link}
                      target="_blank"
                      rel="noopener"
                      className="card fade-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className="card-icon">
                        {getCategoryIcon(article.category)}
                      </div>
                      <div className="card-category">
                        {getCategoryName(article.category)}
                      </div>
                      <h3 className="card-title">
                        {truncate(article.title, 60)}
                      </h3>
                      <p className="card-desc">
                        {truncate(article.description, 80)}
                      </p>
                      <div className="card-meta">
                        <span>{article.source.name}</span>
                        <div className="card-meta-dot"></div>
                        <span>{formatRelativeTime(article.publishedAt)}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-text">使用 Fresh 和 Deno 构建</p>
          <p className="footer-text">© 2026 新闻聚合平台</p>
        </div>
      </footer>
    </div>
  );
}

// 辅助函数
function getCategoryName(slug: string): string {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  return cat ? cat.name : "综合";
}

function getCategoryIcon(slug: string): string {
  const iconMap: Record<string, string> = {
    technology: "💻",
    world: "🌍",
    business: "💼",
    science: "🔬",
    sports: "⚽",
    general: "📰",
  };
  return iconMap[slug] || "📰";
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return new Date(date).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  });
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}
