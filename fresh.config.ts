import { defineConfig } from "$fresh/server.ts";

export default defineConfig({
  // 静态文件配置
  staticDir: "./static",
  // 构建配置
  build: {
    // 确保静态文件被包含
    outDir: "./dist",
  },
});
