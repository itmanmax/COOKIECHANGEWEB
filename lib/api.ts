import appConfigData from "../app.config.json"; // 导入配置文件

const API_BASE_URL = "https://editdata.maxtral.online"
const AUTH_TOKEN = "041129"

// 获取配置信息
export async function fetchConfig() {
  try {
    const response = await fetch('/api/get-config', { 
      cache: 'no-store', // 禁用缓存
      next: { revalidate: 0 } // 确保每次都获取最新配置
    });
    if (!response.ok) {
      throw new Error(`获取配置失败: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取配置时出错:', error);
    // 返回默认配置 - 移除了 updateTypes 和 updateMode
    return {
      notification: {
        enabled: true,
        noticeDays: 14,
        qqNumber: '未设置',
        qmsgKeySet: '未设置'
      }
    };
  }
}

// 获取所有可用的更新类型
export async function getUpdateTypes() {
  try {
    // 直接从导入的配置中获取类型
    const updateTypes = Object.keys(appConfigData.updateAPI);
    // 将 updateMode 作为默认类型，如果它有效的话
    const defaultType = updateTypes.includes(appConfigData.updateMode) ? appConfigData.updateMode : (updateTypes.length > 0 ? updateTypes[0] : null);
    return { types: updateTypes, defaultType: defaultType };
  } catch (error) {
    console.error('获取更新类型时出错:', error);
    return { types: [], defaultType: null };
  }
}

// 调用特定类型的更新API
export async function updateDataByType(type: string) {
  try {
    const apiUrlsConfig = appConfigData.updateAPI[type as keyof typeof appConfigData.updateAPI];
    if (!apiUrlsConfig || apiUrlsConfig.length === 0) {
      throw new Error(`未找到类型 '${type}' 的 API 配置或 URL 列表为空`);
    }

    const results = [];
    let success = false;

    for (let i = 0; i < apiUrlsConfig.length; i++) {
      const originalUrl = apiUrlsConfig[i];
      let requestUrl = originalUrl;

      // 对所有 HTTP/HTTPS URL 都使用代理
      if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
        // 使用通用代理 /api/http-proxy?url=原始URL
        requestUrl = `/api/http-proxy?url=${encodeURIComponent(originalUrl)}`;
        console.log(`[API Lib] ${originalUrl.startsWith('https://') ? 'HTTPS' : 'HTTP'} URL检测到。使用通用代理: ${requestUrl}`);
      } else {
        console.warn(`[API Lib] 类型 '${type}'，索引 '${i}' 的URL格式无效: ${originalUrl}。跳过。`);
        results.push({ url: originalUrl, status: 'error', error: 'Invalid URL format' });
        continue;
      }

      try {
        console.log(`正在调用 API: ${requestUrl} (类型: ${type}, 原始: ${originalUrl})`);
        const response = await fetch(requestUrl, {
          method: 'GET', // 默认使用 GET 方法
          headers: {
            'User-Agent': 'data-management-app',
            'Accept': 'application/json, text/plain, */*',
            ...(typeof window !== 'undefined' ? { 'Origin': window.location.origin } : {})
          },
          cache: 'no-store',
          next: { revalidate: 0 }
        });

        if (response.ok) {
          const resultData = await response.json();
          console.log(`API ${requestUrl} 调用成功，响应:`, resultData);
          results.push({ url: originalUrl, proxiedUrl: requestUrl, status: 'success', data: resultData });
          success = true;
        } else {
          const errorText = await response.text();
          console.error(`API ${requestUrl} 调用失败: ${response.status} ${response.statusText}`, errorText);
          results.push({ url: originalUrl, proxiedUrl: requestUrl, status: 'failed', error: `${response.status} ${response.statusText}`, responseBody: errorText });
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error(`调用 API ${requestUrl} 时发生网络错误或解析错误:`, errorMessage);
        results.push({ url: originalUrl, proxiedUrl: requestUrl, status: 'error', error: errorMessage });
      }
    }

    return { success, results };
  } catch (error) {
    console.error(`更新${type}数据时出错:`, error);
    throw error;
  }
}

// 调用统一更新API (用于兼容旧代码)
export async function updateDataByConfig() {
  try {
    // 先获取默认的更新类型
    const { defaultType } = await getUpdateTypes();
    if (!defaultType) {
      throw new Error('未找到默认更新类型');
    }
    // 使用默认类型调用更新API
    return await updateDataByType(defaultType);
  } catch (error) {
    console.error('更新数据时出错:', error);
    throw error;
  }
}

export async function fetchDataList() {
  const response = await fetch(`${API_BASE_URL}/admin/list`, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch data list: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data
}

export async function fetchDataById(id: string) {
  console.log(`正在获取用户数据，ID: ${id}, URL: ${API_BASE_URL}/api/${AUTH_TOKEN}/${id}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/${AUTH_TOKEN}/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });

    console.log(`获取用户数据响应状态: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`获取用户数据失败: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`获取用户数据失败: ${response.statusText} (${response.status})`);
    }

    const result = await response.json();
    console.log(`获取用户数据成功:`, result);
    return result;
  } catch (error) {
    console.error(`获取用户数据时出现异常:`, error);
    throw error;
  }
}

export async function createData(data: {
  data_id: string
  testjson: any
  cookie: string
}) {
  console.log("API createData 调用开始，参数:", data);
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("API响应状态:", response.status, response.statusText);
    
    if (!response.ok) {
      console.error("API调用失败:", response.status, response.statusText);
      throw new Error(`创建数据失败: ${response.statusText} (${response.status})`);
    }

    const result = await response.json();
    console.log("API调用成功，返回结果:", result);
    return result;
  } catch (error) {
    console.error("API调用出现异常:", error);
    throw error;
  }
}

export async function updateData(
  id: string,
  data: {
    testjson: any
    cookie: string
  },
) {
  console.log("API updateData 调用开始，ID:", id, "参数:", JSON.stringify(data).substring(0, 100) + "...");
  
  if (!id) {
    console.error("更新数据失败：提供的ID为空");
    throw new Error("无法更新数据：ID不能为空");
  }
  
  try {
    const url = `${API_BASE_URL}/admin/update/${id}`;
    console.log("请求URL:", url);
    
    // 准备请求体
    const requestBody = JSON.stringify(data);
    console.log("请求体长度:", requestBody.length, "字节");
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    console.log("更新API响应状态:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("更新API调用失败:", response.status, response.statusText, "错误详情:", errorText);
      throw new Error(`更新数据失败: ${response.statusText} (${response.status}) - ${errorText}`);
    }

    const result = await response.json();
    console.log("更新API调用成功，返回结果:", result);
    return result;
  } catch (error) {
    console.error("更新API调用出现异常:", error);
    throw error;
  }
}

export async function deleteData(id: string) {
  console.log("API deleteData 调用开始，ID:", id);
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    console.log("删除API响应状态:", response.status, response.statusText);
    
    if (!response.ok) {
      console.error("删除API调用失败:", response.status, response.statusText);
      throw new Error(`删除数据失败: ${response.statusText} (${response.status})`);
    }

    const result = await response.json();
    console.log("删除API调用成功，返回结果:", result);
    return result;
  } catch (error) {
    console.error("删除API调用出现异常:", error);
    throw error;
  }
}
