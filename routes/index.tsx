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

// 模拟数据
const mockArticles: Article[] = [
  {
    id: "1",
    title: "Apple 发布全新 M4 芯片，性能提升显著",
    description: "苹果公司今日发布了全新的 M4 芯片，采用先进的 3nm 工艺，在性能和能效方面都有显著提升...",
    link: "https://techcrunch.com/apple-m4-chip",
    publishedAt: new Date(),
    category: "technology",
    source: { name: "TechCrunch", url: "https://techcrunch.com" }
  },
  {
    id: "2",
    title: "全球气候变化峰会达成重要共识",
    description: "在最新的气候变化峰会上，各国代表就减排目标达成重要共识，承诺在2030年前实现碳排放大幅减少...",
    link: "https://reuters.com/climate-summit",
    publishedAt: new Date(Date.now() - 3600000),
    category: "world",
    source: { name: "Reuters", url: "https://reuters.com" }
  },
  {
    id: "3",
    title: "全球股市创年度新高，投资者信心增强",
    description: "受利好消息影响，全球主要股市今日集体上涨，创下年度新高，市场投资者信心明显增强...",
    link: "https://bloomberg.com/markets-record",
    publishedAt: new Date(Date.now() - 7200000),
    category: "business",
    source: { name: "Bloomberg", url: "https://bloomberg.com" }
  },
  {
    id: "4",
    title: "科学家发现新型抗癌药物，临床试验效果显著",
    description: "一项最新的医学研究表明，新型抗癌药物在临床试验中展现出显著的治疗效果...",
    link: "https://nature.com/cancer-drug",
    publishedAt: new Date(Date.now() - 10800000),
    category: "science",
    source: { name: "Nature", url: "https://nature.com" }
  },
  {
    id: "5",
    title: "世界杯决赛精彩回顾：冠军诞生时刻",
    description: "昨晚的世界杯决赛精彩纷呈，双方球队展开激烈角逐，最终冠军在点球大战中诞生...",
    link: "https://espn.com/world-cup-final",
    publishedAt: new Date(Date.now() - 14400000),
    category: "sports",
    source: { name: "ESPN", url: "https://espn.com" }
  },
  {
    id: "6",
    title: "人工智能在医疗领域的最新突破",
    description: "AI技术在医疗诊断领域取得重大突破，新算法能够更准确地识别早期疾病迹象...",
    link: "https://theverge.com/ai-medical",
    publishedAt: new Date(Date.now() - 18000000),
    category: "technology",
    source: { name: "The Verge", url: "https://theverge.com" }
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
    <div class="page">
      {/* 导航栏 */}
      <nav class="nav">
        <div class="nav-inner">
          <a href="/" class="nav-brand">News</a>
          <ul class="nav-menu">
            <li><a href="/" class="nav-link">首页</a></li>
            <li><a href="#tech" class="nav-link">科技</a></li>
            <li><a href="#world" class="nav-link">国际</a></li>
            <li><a href="#business" class="nav-link">商业</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero区域 */}
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">新闻中心</h1>
          <p class="hero-subtitle">汇聚全球资讯，洞察世界脉搏</p>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">{stats.total}</div>
              <div class="stat-label">今日文章</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{CATEGORIES.length}</div>
              <div class="stat-label">分类频道</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">24/7</div>
              <div class="stat-label">实时更新</div>
            </div>
          </div>
        </div>
      </section>

      {/* 分类标签 */}
      <section class="tabs-section">
        <div class="tabs-container">
          <div class="tabs">
            <a href="/" class="tab active">
              <span>全部</span>
              <span class="tab-count">{stats.total}</span>
            </a>
            {CATEGORIES.filter(c => c.slug !== "general").map(cat => (
              <a href={`/category/${cat.slug}`} class="tab" key={cat.slug}>
                <span>{cat.name}</span>
                <span class="tab-count">{stats.byCategory[cat.slug] || 0}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 内容区域 */}
      <section class="content">
        <div class="content-inner">
          <div class="section-header">
            <h2 class="section-title">最新资讯</h2>
            <p class="section-subtitle">精选全球热门新闻，实时更新</p>
          </div>

          {articles.length === 0 ? (
            <div class="empty-state">
              <div class="empty-icon">📰</div>
              <h3 class="empty-title">暂无文章</h3>
              <p class="empty-text">正在抓取最新资讯，请稍后再试</p>
            </div>
          ) : (
            <div class="grid">
              {articles.map((article) => (
                <a
                  href={cleanLink(article.link)}
                  class="card"
                  key={article.id}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span class="card-category">{getCategoryName(article.category)}</span>
                  <h3 class="card-title">{article.title}</h3>
                  <p class="card-desc">{article.description}</p>
                  <div class="card-footer">
                    <div class="card-meta">
                      <span>{article.source.name}</span>
                      <span class="card-meta-dot"></span>
                      <span>{formatTime(article.publishedAt)}</span>
                    </div>
                    <div class="card-arrow">→</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer class="footer">
        <div class="footer-inner">
          <p class="footer-text">© 2026 News Center. All rights reserved.</p>
          <ul class="footer-links">
            <li><a href="#" class="footer-link">关于我们</a></li>
            <li><a href="#" class="footer-link">隐私政策</a></li>
            <li><a href="#" class="footer-link">联系方式</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
