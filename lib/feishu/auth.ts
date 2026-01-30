// 飞书认证服务 - 自动刷新访问令牌

interface TokenResponse {
  code: number;
  msg: string;
  tenant_access_token?: string;
  expire?: number;
}

interface FeishuConfig {
  appId: string;
  appSecret: string;
}

// 令牌管理器
class FeishuTokenManager {
  private token: string | null = null;
  private expireTime = 0;
  private config: FeishuConfig | null = null;
  private refreshPromise: Promise<string> | null = null;

  // 初始化配置
  initFromEnv(): boolean {
    const appId = Deno.env.get("FEISHU_APP_ID");
    const appSecret = Deno.env.get("FEISHU_APP_SECRET");
    
    if (!appId || !appSecret) {
      console.log("未配置 FEISHU_APP_ID 或 FEISHU_APP_SECRET");
      return false;
    }
    
    this.config = { appId, appSecret };
    return true;
  }

  // 获取有效令牌（自动刷新）
  async getToken(): Promise<string | null> {
    // 如果令牌还有效（提前5分钟刷新）
    if (this.token && Date.now() < this.expireTime - 5 * 60 * 1000) {
      return this.token;
    }
    
    // 如果正在刷新，等待刷新完成
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    
    // 开始刷新
    this.refreshPromise = this.refreshToken();
    
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  // 刷新令牌
  private async refreshToken(): Promise<string> {
    if (!this.config) {
      throw new Error("飞书配置未初始化");
    }
    
    try {
      console.log("正在刷新飞书访问令牌...");
      
      const response = await fetch(
        "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            app_id: this.config.appId,
            app_secret: this.config.appSecret,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: TokenResponse = await response.json();
      
      if (data.code !== 0) {
        throw new Error(`飞书API错误: ${data.msg}`);
      }
      
      if (!data.tenant_access_token) {
        throw new Error("未获取到访问令牌");
      }
      
      this.token = data.tenant_access_token;
      // 设置过期时间（毫秒）
      this.expireTime = Date.now() + (data.expire || 7200) * 1000;
      
      console.log(`令牌刷新成功，有效期至: ${new Date(this.expireTime).toLocaleString()}`);
      
      return this.token;
    } catch (error) {
      console.error("刷新令牌失败:", error);
      throw error;
    }
  }

  // 强制刷新
  async forceRefresh(): Promise<string> {
    this.token = null;
    this.expireTime = 0;
    return this.refreshToken();
  }

  // 获取令牌状态
  getStatus(): {
    hasToken: boolean;
    expireTime: number;
    isExpired: boolean;
  } {
    return {
      hasToken: this.token !== null,
      expireTime: this.expireTime,
      isExpired: Date.now() >= this.expireTime,
    };
  }
}

// 单例实例
export const feishuAuth = new FeishuTokenManager();
