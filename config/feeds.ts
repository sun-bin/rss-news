// RSS源配置
import type { RSSSource } from "../types/article.ts";

export const RSS_FEEDS: RSSSource[] = [
  {
    id: 'tech-crunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'technology',
    language: 'en',
    enabled: true,
  },
  {
    id: 'the-verge',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'technology',
    language: 'en',
    enabled: true,
  },
  {
    id: 'reuters',
    name: 'Reuters',
    url: 'https://feeds.reuters.com/reuters/topNews',
    category: 'world',
    language: 'en',
    enabled: true,
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    category: 'business',
    language: 'en',
    enabled: true,
  },
  {
    id: 'nature',
    name: 'Nature',
    url: 'https://www.nature.com/nature.rss',
    category: 'science',
    language: 'en',
    enabled: true,
  },
  {
    id: 'espn',
    name: 'ESPN',
    url: 'https://www.espn.com/espn/rss/news/news',
    category: 'sports',
    language: 'en',
    enabled: true,
  },
  {
    id: 'bbc-news',
    name: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    category: 'world',
    language: 'en',
    enabled: true,
  },
  {
    id: 'cnn',
    name: 'CNN',
    url: 'http://rss.cnn.com/rss/edition.rss',
    category: 'general',
    language: 'en',
    enabled: true,
  }
];

export function getFeedsByCategory(category: string): RSSSource[] {
  return RSS_FEEDS.filter(feed => feed.category === category && feed.enabled);
}

export function getEnabledFeeds(): RSSSource[] {
  return RSS_FEEDS.filter(feed => feed.enabled);
}