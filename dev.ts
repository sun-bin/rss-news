#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

// 可选：加载环境变量（不强制要求）
try {
  await import("$std/dotenv/load.ts");
} catch {
  // 环境变量文件不存在时忽略
}

await dev(import.meta.url, "./main.ts", config);
