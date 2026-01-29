// RSS源配置 - 中文源
import type { RSSSource } from "../types/article.ts";

export const RSS_FEEDS: RSSSource[] = [
  {
    id: 'ifanr',
    name: '爱范儿',
    url: 'https://www.ifanr.com/feed',
    category: 'technology',
    language: 'zh',
    enabled: true,
  },
  {
    id: '36kr',
    name: '36氪',
    url: 'https://36kr.com/feed',
    category: 'technology',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'sspai',
    name: '少数派',
    url: 'https://sspai.com/feed',
    category: 'technology',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'geekpark',
    name: '极客公园',
    url: 'https://www.geekpark.net/rss',
    category: 'technology',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'solidot',
    name: 'Solidot',
    url: 'https://www.solidot.org/index.rss',
    category: 'technology',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'cnbeta',
    name: 'cnBeta',
    url: 'https://www.cnbeta.com/backend.php',
    category: 'technology',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'zaobao',
    name: '联合早报',
    url: 'https://www.zaobao.com/news/world/rss',
    category: 'world',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'bbc-chinese',
    name: 'BBC中文',
    url: 'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml',
    category: 'world',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'caixin',
    name: '财新网',
    url: 'https://www.caixin.com/search/rss.xml',
    category: 'business',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'jiemian',
    name: '界面新闻',
    url: 'https://www.jiemian.com/rss/',
    category: 'business',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'huxiu',
    name: '虎嗅',
    url: 'https://www.huxiu.com/rss/',
    category: 'business',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'guokr',
    name: '果壳',
    url: 'https://www.guokr.com/rss/',
    category: 'science',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'dgtle',
    name: '数字尾巴',
    url: 'https://www.dgtle.com/rss/',
    category: 'technology',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'ithome',
    name: 'IT之家',
    url: 'https://www.ithome.com/rss/',
    category: 'technology',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'sina-tech',
    name: '新浪科技',
    url: 'https://tech.sina.com.cn/rss/rollnews.xml',
    category: 'technology',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'sina-sports',
    name: '新浪体育',
    url: 'https://sports.sina.com.cn/rss/rollnews.xml',
    category: 'sports',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'netease-sports',
    name: '网易体育',
    url: 'https://sports.163.com/special/00051K7F/rss_sportslq.xml',
    category: 'sports',
    language: 'zh',
    enabled: true,
  },
  {
    id: 'thepaper',
    name: '澎湃新闻',
    url: 'https://www.thepaper.cn/rss/',
    category: 'world',
    language: 'zh',
    enabled: true,
  },
];

export function getFeedsByCategory(category: string): RSSSource[] {
  return RSS_FEEDS.filter(feed => feed.category === category && feed.enabled);
}

export function getEnabledFeeds(): RSSSource[] {
  return RSS_FEEDS.filter(feed => feed.enabled);
}
