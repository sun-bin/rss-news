// 新闻分类配置
export interface Category {
  slug: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: 'technology',
    name: '科技',
    icon: '💻',
    color: '#0066cc',
    description: '科技资讯与创新'
  },
  {
    slug: 'world',
    name: '国际',
    icon: '🌍',
    color: '#34c759',
    description: '国际新闻与时事'
  },
  {
    slug: 'business',
    name: '商业',
    icon: '💼',
    color: '#ff9500',
    description: '商业财经与市场'
  },
  {
    slug: 'science',
    name: '科学',
    icon: '🔬',
    color: '#af52de',
    description: '科学研究与发现'
  },
  {
    slug: 'sports',
    name: '体育',
    icon: '⚽',
    color: '#ff3b30',
    description: '体育新闻与赛事'
  },
  {
    slug: 'general',
    name: '综合',
    icon: '📰',
    color: '#8e8e93',
    description: '综合新闻资讯'
  }
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(cat => cat.slug === slug);
}