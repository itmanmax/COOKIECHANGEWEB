const API_BASE_URL = "https://editdata.maxtral.online"
const AUTH_TOKEN = "041129"

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
  const response = await fetch(`${API_BASE_URL}/api/${AUTH_TOKEN}/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }

  return response.json()
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
  console.log("API updateData 调用开始，ID:", id, "参数:", data);
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/update/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("更新API响应状态:", response.status, response.statusText);
    
    if (!response.ok) {
      console.error("更新API调用失败:", response.status, response.statusText);
      throw new Error(`更新数据失败: ${response.statusText} (${response.status})`);
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
