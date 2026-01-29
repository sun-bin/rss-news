// 文章类型定义
export interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  publishedAt: Date;
  category: string;
  tags?: string[];
  source: {
    name: string;
    url: string;
    icon?: string;
  };
  image?: string;
  content?: string;
}

// RSS源类型
export interface RSSSource {
  id: string;
  name: string;
  url: string;
  category: string;
  language: string;
  enabled: boolean;
  lastUpdated?: Date;
}

// 缓存的文章类型
export interface CachedArticle {
  article: Article;
  cachedAt: Date;
  ttl: number;
}
