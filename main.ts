/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { App, fsRoutes, staticFiles } from "https://deno.land/x/fresh@1.7.3/mod.ts";
import config from "./fresh.config.ts";

// 创建 Fresh 应用
const app = new App({
  ...config,
});

// 添加静态文件服务
app.use(staticFiles());

// 自动加载路由
await fsRoutes(app, {
  dir: "./routes",
  loadRoute: (path) => import(`./routes${path}`),
});

// 启动服务器
console.log("🚀 Starting RSS News Aggregator...");
await app.listen({ port: 8000 });
