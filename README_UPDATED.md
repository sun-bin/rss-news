# 🍎 RSS 新闻聚合器 - 苹果官网风格

基于 Fresh (Deno) 的现代化 RSS 新闻聚合展示应用，采用苹果官网卡片风格设计，完全兼容 Deno Deploy 部署。

## ✨ 苹果官网风格特性

### 🎨 设计系统
- **顶级苹果风格**: 完全参考 Apple.com 2024 设计规范
- **SF Pro 字体**: 使用苹果官方字体系统
- **苹果色彩**: 采用苹果官方色彩系统
- **精致动画**: 苹果级交互动画和过渡效果

### 📱 响应式设计
- **自适应布局**: 4列 → 3列 → 2列 → 1列智能响应
- **完美移动端**: 专为移动设备优化的触摸体验
- **深色模式**: 支持系统深色模式切换
- **高对比度**: 符合无障碍设计标准

### ⚡ 性能优化
- **苹果级动画**: 使用 CSS3 硬件加速
- **平滑滚动**: 优化的滚动体验
- **懒加载**: 智能的内容加载策略
- **高性能**: 优化的渲染性能

## 🚀 技术栈

- **框架**: Fresh (Deno)
- **UI**: Preact + TypeScript
- **样式**: 纯 CSS (苹果官网风格)
- **缓存**: 多级缓存策略
- **部署**: Deno Deploy 兼容

## 📦 项目结构

```
rss-news/
├── routes/                    # 路由文件
│   ├── _app.tsx              # 应用根组件
│   └── index.tsx             # 首页路由
├── static/styles/            # 静态样式
│   └── modern.css           # 苹果官网风格样式
├── config/                   # 配置文件
│   ├── categories.ts        # 新闻分类配置
│   └── feeds.ts            # RSS源配置
├── lib/                     # 业务逻辑
│   └── cache/              # 缓存策略
├── types/                   # 类型定义
│   └── article.ts         # 文章类型
├── main.ts                 # 应用入口
├── deno.json              # Deno配置
└── fresh.config.ts         # Fresh配置
```

## 🎯 核心功能

### 📰 RSS 聚合
- 多源 RSS/Atom 支持
- 智能文章分类
- 自动标签提取
- 实时内容更新

### 🏷️ 分类系统
- **科技** 💻 - 技术资讯与创新
- **国际** 🌍 - 国际新闻与时事
- **商业** 💼 - 商业财经与市场
- **科学** 🔬 - 科学研究与发现
- **体育** ⚽ - 体育新闻与赛事
- **综合** 📰 - 综合新闻资讯

### 💾 缓存策略
- **内存缓存**: 快速访问热点数据
- **TTL管理**: 智能过期清理
- **多级缓存**: 三层缓存架构

## 🔧 本地开发

### 环境要求
- Deno 1.0+
- 现代浏览器

### 启动项目
```bash
# 安装依赖
deno install

# 启动开发服务器
deno task start

# 构建项目
deno task build

# 预览构建结果
deno task preview
```

### 开发任务
```bash
# 代码检查
deno task check

# 格式化代码
deno fmt

# 类型检查
deno check **/*.ts **/*.tsx
```

## 🌐 Deno Deploy 部署

### 快速部署
```bash
# 安装 Deno Deploy CLI
deno install -g https://deno.land/x/deploy/deploy.ts

# 部署到 Deno Deploy
deno deploy --project=your-project-name
```

### 环境变量
```env
# 应用配置
APP_NAME=RSS News Aggregator
APP_URL=https://your-domain.deno.dev

# 缓存配置
MEMORY_CACHE_TTL=600000
KV_CACHE_TTL=3600000
REFRESH_INTERVAL=900000

# RSS 抓取配置
RSS_FETCH_TIMEOUT=10000
RSS_MAX_ARTICLES=100
```

## 🎨 苹果官网设计规范

### 色彩系统
```css
:root {
  --apple-white: #ffffff;
  --apple-bg: #f5f5f7;
  --apple-text: #1d1d1f;
  --apple-text-secondary: #6e6e73;
  --apple-blue: #0066cc;
  --apple-divider: #d2d2d7;
}
```

### 字体系统
```css
:root {
  --font-apple-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  --font-apple-text: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}
```

### 动画时间
```css
:root {
  --duration-fast: 0.15s;
  --duration-normal: 0.3s;
  --duration-slow: 0.5s;
}
```

## 📱 响应式断点

- **大屏**: 1200px+ (4列布局)
- **平板横屏**: 900px-1199px (3列布局)
- **平板竖屏**: 600px-899px (2列布局)
- **手机**: <600px (1列布局)

## ♿ 无障碍特性

- **高对比度支持**: `prefers-contrast: high`
- **减少动画**: `prefers-reduced-motion: reduce`
- **键盘导航**: 完整的焦点管理
- **屏幕阅读器**: 语义化 HTML 结构

## 🔄 RSS 源配置

项目支持多种主流新闻源：

### 默认 RSS 源
- **TechCrunch**: 科技新闻
- **Reuters**: 国际新闻
- **Bloomberg**: 财经新闻
- **Nature**: 科学期刊
- **ESPN**: 体育新闻
- **BBC News**: 英国广播
- **CNN**: 美国有线电视

### 添加新源
```typescript
// config/feeds.ts
{
  id: 'unique-id',
  name: 'Source Name',
  url: 'https://example.com/rss.xml',
  category: 'technology',
  language: 'en',
  enabled: true,
}
```

## 🛠️ 开发指南

### 添加新页面
```typescript
// routes/new-page.tsx
import { PageProps } from "$fresh/server.ts";

export default function NewPage({ data }: PageProps) {
  return (
    <div>
      {/* 页面内容 */}
    </div>
  );
}
```

### 创建组件
```typescript
// components/NewsCard.tsx
import type { Article } from "../types/article.ts";

interface Props {
  article: Article;
}

export function NewsCard({ article }: Props) {
  return (
    <a href={article.link} className="card">
      {/* 卡片内容 */}
    </a>
  );
}
```

## 📈 性能监控

### 缓存统计
- 内存使用情况
- 缓存命中率
- 过期清理统计

### 页面性能
- 首屏加载时间
- 交互响应时间
- 动画流畅度

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- [Fresh Framework](https://fresh.deno.dev/)
- [Deno Deploy](https://deno.com/deploy)
- [Apple Design Guidelines](https://developer.apple.com/design/)

---

**🍎 享受苹果级的开发体验！**