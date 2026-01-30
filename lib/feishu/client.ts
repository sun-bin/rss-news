// 飞书表格数据获取服务
import type { Article } from "../../types/article.ts";
import { feishuAuth } from "./auth.ts";

// 飞书表格配置
const FEISHU_CONFIG = {
  baseId: "JwkobygDAa6bEnsQU4UcMG6Angd",
  tableId: "tblGMChHj0PSrXZ6",
  viewId: "vewopfd3Ay",
};

// 飞书表格记录类型
interface FeishuRecord {
  record_id: string;
  fields: {
    标题?: string;
    描述?: string;
    链接?: string;
    分类?: string;
    来源?: string;
    发布时间?: string | number;
    [key: string]: unknown;
  };
}

// 初始化认证
feishuAuth.initFromEnv();

// 从飞书表格获取数据
export async function fetchFeishuArticles(): Promise<Article[]> {
  try {
    // 获取有效令牌（自动刷新）
    const token = await feishuAuth.getToken();
    
    if (!token) {
      console.log("无法获取飞书访问令牌，跳过飞书数据获取");
      console.log("请配置 FEISHU_APP_ID 和 FEISHU_APP_SECRET 环境变量");
      return [];
    }
    
    return await fetchFeishuWithToken(token);
  } catch (error) {
    console.error("获取飞书表格数据失败:", error);
    return [];
  }
}

// 使用令牌获取飞书数据
async function fetchFeishuWithToken(token: string): Promise<Article[]> {
  try {
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_CONFIG.baseId}/tables/${FEISHU_CONFIG.tableId}/records?view_id=${FEISHU_CONFIG.viewId}&page_size=500`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      // 如果 401 或 403，可能是令牌过期，尝试强制刷新
      if (response.status === 401 || response.status === 403) {
        console.log("令牌可能过期，尝试刷新...");
        const newToken = await feishuAuth.forceRefresh();
        
        // 重试一次
        const retryResponse = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!retryResponse.ok) {
          throw new Error(`重试失败 HTTP ${retryResponse.status}`);
        }
        
        const retryData = await retryResponse.json();
        return processRecords(retryData.data?.items || []);
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(`飞书API错误: ${data.msg}`);
    }
    
    const records: FeishuRecord[] = data.data?.items || [];
    console.log(`成功获取飞书表格数据: ${records.length} 条记录`);
    
    return processRecords(records);
  } catch (error) {
    console.error("获取飞书表格数据失败:", error);
    return [];
  }
}

// 处理记录
function processRecords(records: FeishuRecord[]): Article[] {
  return records
    .map(convertFeishuRecord)
    .filter((article): article is Article => article !== null);
}

// 转换飞书记录为文章格式
function convertFeishuRecord(record: FeishuRecord): Article | null {
  const fields = record.fields;
  
  if (!fields.标题) {
    return null;
  }
  
  // 解析分类
  let category = "general";
  if (fields.分类) {
    const categoryMap: Record<string, string> = {
      "科技": "technology",
      "国际": "world",
      "商业": "business",
      "科学": "science",
      "体育": "sports",
    };
    category = categoryMap[fields.分类] || "general";
  }
  
  // 解析发布时间
  let publishedAt = new Date();
  if (fields.发布时间) {
    if (typeof fields.发布时间 === "number") {
      publishedAt = new Date(fields.发布时间);
    } else {
      publishedAt = new Date(fields.发布时间);
    }
  }
  
  return {
    id: `feishu-${record.record_id}`,
    title: fields.标题,
    description: fields.描述 || "",
    link: fields.链接 || "#",
    publishedAt,
    category,
    source: {
      name: fields.来源 || "飞书表格",
      url: "https://feishu.cn",
    },
  };
}

// 使用 API Token 获取飞书数据（向后兼容）
export async function fetchFeishuArticlesWithToken(
  appToken: string,
  personalToken?: string
): Promise<Article[]> {
  // 如果传入了令牌，直接使用（旧方式）
  if (appToken) {
    return fetchFeishuWithToken(appToken);
  }
  
  // 否则使用自动刷新方式
  return fetchFeishuArticles();
}
