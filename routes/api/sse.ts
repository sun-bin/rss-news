// SSE (Server-Sent Events) 实时更新 API
import { Handlers } from "$fresh/server.ts";
import { getCachedArticles, refreshCache, getCacheStatus } from "../../lib/data/cachedAggregator.ts";

// 存储所有连接的客户端
const clients = new Set<ReadableStreamDefaultController<Uint8Array>>();

// 广播消息给所有客户端
function broadcast(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`data: ${message}\n\n`);
  
  clients.forEach((client) => {
    try {
      client.enqueue(data);
    } catch {
      // 客户端已断开，会在下次发送时清理
    }
  });
}

// 检查更新并广播
async function checkAndBroadcast() {
  try {
    const status = getCacheStatus();
    
    // 如果缓存超过3分钟，尝试刷新
    if (status.age > 3 * 60 * 1000 && !status.isFetching) {
      console.log("检测到缓存过期，自动刷新...");
      const data = await refreshCache();
      
      broadcast(JSON.stringify({
        type: "update",
        timestamp: Date.now(),
        stats: {
          total: data.articles.length,
          sources: data.sources,
        },
      }));
    }
  } catch (error) {
    console.error("自动刷新失败:", error);
  }
}

// 启动定时检查（每30秒检查一次）
setInterval(checkAndBroadcast, 30000);

export const handler: Handlers = {
  async GET(_req, ctx) {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        // 添加客户端
        clients.add(controller);
        console.log(`SSE客户端连接，当前连接数: ${clients.size}`);
        
        // 发送初始数据
        const encoder = new TextEncoder();
        getCachedArticles().then((data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "init",
            timestamp: Date.now(),
            stats: {
              total: data.articles.length,
              sources: data.sources,
            },
          })}\n\n`));
        });
        
        // 发送心跳保持连接
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`:heartbeat\n\n`));
          } catch {
            clearInterval(heartbeat);
            clients.delete(controller);
          }
        }, 30000);
        
        // 清理函数
        return () => {
          clearInterval(heartbeat);
          clients.delete(controller);
          console.log(`SSE客户端断开，当前连接数: ${clients.size}`);
        };
      },
      cancel(controller) {
        clients.delete(controller);
        console.log(`SSE客户端取消，当前连接数: ${clients.size}`);
      },
    });
    
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};

// 手动触发更新广播（供其他模块调用）
export function notifyUpdate() {
  broadcast(JSON.stringify({
    type: "update",
    timestamp: Date.now(),
    message: "数据已更新",
  }));
}
