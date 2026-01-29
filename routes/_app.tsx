import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RSS 新闻聚合器</title>
        <style dangerouslySetInnerHTML={{ __html: `
          /* 🍎 Apple.com 官网级设计 - 极简纯净风格 */
          :root {
            --apple-white: #ffffff;
            --apple-bg: #f5f5f7;
            --apple-text: #1d1d1f;
            --apple-text-secondary: #6e6e73;
            --apple-text-tertiary: #86868b;
            --apple-blue: #0071e3;
            --apple-divider: #d2d2d7;
            --apple-divider-light: #e8e8ed;
            --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif;
            --font-text: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
            --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
            --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
            --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-font-smoothing: antialiased;
          }

          html {
            scroll-behavior: smooth;
          }

          body {
            font-family: var(--font-text);
            background: var(--apple-white);
            color: var(--apple-text);
            font-size: 17px;
            line-height: 1.5;
            letter-spacing: -0.022em;
          }

          .nav {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: saturate(180%) blur(20px);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          }

          .nav-inner {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .nav-brand {
            font-family: var(--font-display);
            font-size: 21px;
            font-weight: 600;
            color: var(--apple-text);
            text-decoration: none;
          }

          .nav-menu {
            display: flex;
            gap: 32px;
            list-style: none;
          }

          .nav-link {
            font-size: 14px;
            color: var(--apple-text);
            text-decoration: none;
            opacity: 0.8;
            transition: opacity 0.3s;
          }

          .nav-link:hover {
            opacity: 1;
          }

          .hero {
            background: var(--apple-white);
            padding: 120px 24px 60px;
            text-align: center;
          }

          .hero-content {
            max-width: 800px;
            margin: 0 auto;
          }

          .hero-title {
            font-family: var(--font-display);
            font-size: clamp(40px, 6vw, 64px);
            font-weight: 700;
            line-height: 1.1;
            letter-spacing: -0.03em;
            margin-bottom: 16px;
            color: var(--apple-text);
          }

          .hero-subtitle {
            font-size: 21px;
            color: var(--apple-text-secondary);
            margin-bottom: 40px;
          }

          .hero-stats {
            display: flex;
            justify-content: center;
            gap: 60px;
          }

          .stat-item {
            text-align: center;
          }

          .stat-number {
            font-family: var(--font-display);
            font-size: 40px;
            font-weight: 600;
            color: var(--apple-text);
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: var(--apple-text-secondary);
          }

          .tabs-section {
            background: var(--apple-white);
            padding: 0 24px 40px;
            text-align: center;
          }

          .tabs {
            display: inline-flex;
            gap: 8px;
            padding: 6px;
            background: var(--apple-bg);
            border-radius: 100px;
          }

          .tab {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 20px;
            font-size: 14px;
            color: var(--apple-text);
            text-decoration: none;
            border-radius: 100px;
            transition: all 0.3s var(--ease-out);
          }

          .tab:hover {
            background: rgba(0, 0, 0, 0.04);
          }

          .tab.active {
            background: var(--apple-white);
            box-shadow: var(--shadow-sm);
          }

          .tab-count {
            font-size: 12px;
            color: var(--apple-text-secondary);
            background: var(--apple-bg);
            padding: 2px 8px;
            border-radius: 100px;
          }

          .content {
            background: var(--apple-bg);
            padding: 60px 24px 80px;
          }

          .content-inner {
            max-width: 1200px;
            margin: 0 auto;
          }

          .section-header {
            text-align: center;
            margin-bottom: 48px;
          }

          .section-title {
            font-family: var(--font-display);
            font-size: 32px;
            font-weight: 600;
            color: var(--apple-text);
            margin-bottom: 8px;
          }

          .section-subtitle {
            font-size: 17px;
            color: var(--apple-text-secondary);
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }

          .card {
            background: var(--apple-white);
            border-radius: 16px;
            padding: 28px;
            display: flex;
            flex-direction: column;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s var(--ease-out);
            border: 1px solid transparent;
            height: 100%;
          }

          .card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }

          .card-category {
            display: inline-block;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--apple-blue);
            margin-bottom: 12px;
            padding: 4px 10px;
            background: rgba(0, 113, 227, 0.08);
            border-radius: 6px;
            width: fit-content;
          }

          .card-title {
            font-family: var(--font-display);
            font-size: 19px;
            font-weight: 600;
            line-height: 1.35;
            letter-spacing: -0.01em;
            color: var(--apple-text);
            margin-bottom: 12px;
            transition: color 0.3s;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .card:hover .card-title {
            color: var(--apple-blue);
          }

          .card-desc {
            font-size: 15px;
            line-height: 1.5;
            color: var(--apple-text-secondary);
            margin-bottom: 20px;
            flex-grow: 1;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 16px;
            border-top: 1px solid var(--apple-divider-light);
          }

          .card-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: var(--apple-text-tertiary);
          }

          .card-meta-dot {
            width: 3px;
            height: 3px;
            background: var(--apple-text-tertiary);
            border-radius: 50%;
          }

          .card-arrow {
            width: 28px;
            height: 28px;
            background: var(--apple-bg);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--apple-blue);
            font-size: 12px;
            transition: all 0.3s var(--ease-out);
          }

          .card:hover .card-arrow {
            background: var(--apple-blue);
            color: white;
          }

          .footer {
            background: var(--apple-white);
            padding: 40px 24px;
            border-top: 1px solid var(--apple-divider-light);
          }

          .footer-inner {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .footer-text {
            font-size: 13px;
            color: var(--apple-text-secondary);
          }

          .footer-links {
            display: flex;
            gap: 24px;
            list-style: none;
          }

          .footer-link {
            font-size: 13px;
            color: var(--apple-text-secondary);
            text-decoration: none;
            transition: color 0.3s;
          }

          .footer-link:hover {
            color: var(--apple-text);
          }

          @media (max-width: 1024px) {
            .grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
          }

          @media (max-width: 768px) {
            .nav-menu {
              display: none;
            }
            
            .hero {
              padding: 100px 16px 40px;
            }
            
            .hero-title {
              font-size: 36px;
            }
            
            .hero-stats {
              gap: 24px;
            }
            
            .stat-number {
              font-size: 28px;
            }
            
            .tabs {
              flex-wrap: nowrap;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
              -ms-overflow-style: none;
              max-width: 100%;
              padding: 4px;
            }
            
            .tabs::-webkit-scrollbar {
              display: none;
            }
            
            .tab {
              padding: 8px 16px;
              font-size: 13px;
              white-space: nowrap;
              flex-shrink: 0;
            }
            
            .content {
              padding: 40px 16px 60px;
            }
            
            .grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }
            
            .card {
              padding: 20px;
            }
            
            .footer-inner {
              flex-direction: column;
              gap: 16px;
              text-align: center;
            }
          }
        `}} />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
