// 飞书表格数据获取服务
import type { Article } from "../../types/article.ts";

// 飞书表格配置
const FEISHU_CONFIG = {
  // 从URL解析出的表格信息
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

// 从飞书表格获取数据
export async function fetchFeishuArticles(): Promise<Article[]> {
  try {
    // 飞书开放 API 端点
    // 注意：实际使用时需要配置 app_token 和 personal_access_token
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_CONFIG.baseId}/tables/${FEISHU_CONFIG.tableId}/records`;
    
    // 由于需要认证，这里先返回空数组
    // 实际使用时需要:
    // 1. 创建飞书应用获取 app_id 和 app_secret
    // 2. 获取 tenant_access_token
    // 3. 调用 API 获取数据
    
    console.log("飞书表格API需要配置访问令牌");
    console.log("表格地址:", `https://vcn8jv5kpxv3.feishu.cn/base/${FEISHU_CONFIG.baseId}?table=${FEISHU_CONFIG.tableId}&view=${FEISHU_CONFIG.viewId}`);
    
    // 临时：返回模拟数据展示结构
    return [];
  } catch (error) {
    console.error("获取飞书表格数据失败:", error);
    return [];
  }
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
      // 飞书日期字段可能是时间戳（毫秒）
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

// 使用 API Token 获取飞书数据（需要配置）
export async function fetchFeishuArticlesWithToken(
  appToken: string,
  personalToken?: string
): Promise<Article[]> {
  try {
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_CONFIG.baseId}/tables/${FEISHU_CONFIG.tableId}/records?view_id=${FEISHU_CONFIG.viewId}&page_size=500`;
    
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${appToken}`,
      "Content-Type": "application/json",
    };
    
    if (personalToken) {
      headers["X-User-Key"] = personalToken;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(`飞书API错误: ${data.msg}`);
    }
    
    const records: FeishuRecord[] = data.data?.items || [];
    
    return records
      .map(convertFeishuRecord)
      .filter((article): article is Article => article !== null);
  } catch (error) {
    console.error("获取飞书表格数据失败:", error);
    return [];
  }
}
