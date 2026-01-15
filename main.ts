/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";
import { initKV } from "$lib/cache/kv.ts";
import { startCacheCleanup } from "$lib/cache/memory.ts";
import { startBackgroundRefresh } from "./tasks/refresh_feeds.ts";

// 初始化
console.log("🚀 Starting RSS News Aggregator...\n");

// 初始化 KV
await initKV();

// 启动内存缓存清理
startCacheCleanup();

// 启动后台刷新任务
startBackgroundRefresh();

// 启动 Fresh 服务器
await start(manifest, config);
