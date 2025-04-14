"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUp, ChevronsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface JsonViewerProps {
  data: any
  level?: number
  initialExpandAll?: boolean
  prefix?: string
}

// 递归获取所有对象的键
const getAllKeys = (data: any, prefix = ''): Record<string, boolean> => {
  if (typeof data !== 'object' || data === null) {
    return {};
  }
  
  let keys: Record<string, boolean> = {};
  
  // 记录当前路径
  if (prefix) {
    keys[prefix] = true;
  }
  
  if (Array.isArray(data)) {
    // 为数组元素创建路径
    data.forEach((item, index) => {
      const itemKey = prefix ? `${prefix}.${index}` : `${index}`;
      keys[itemKey] = true;
      
      if (typeof item === 'object' && item !== null) {
        const nestedKeys = getAllKeys(item, itemKey);
        keys = { ...keys, ...nestedKeys };
      }
    });
  } else {
    // 为对象属性创建路径
    Object.keys(data).forEach(key => {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      keys[currentKey] = true;
      
      if (typeof data[key] === 'object' && data[key] !== null) {
        const nestedKeys = getAllKeys(data[key], currentKey);
        keys = { ...keys, ...nestedKeys };
      }
    });
  }
  
  return keys;
};

export function JsonViewer({ data, level = 0, initialExpandAll = true, prefix }: JsonViewerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [isAllExpanded, setIsAllExpanded] = useState(initialExpandAll)

  // 初始化时根据 initialExpandAll 设置展开状态
  useEffect(() => {
    if (initialExpandAll) {
      const allKeys = getAllKeys(data);
      setExpanded(allKeys);
      setIsAllExpanded(true);
    } else {
      setExpanded({});
      setIsAllExpanded(false);
    }
  }, [data, initialExpandAll]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpanded({});
    } else {
      setExpanded(getAllKeys(data));
    }
    setIsAllExpanded(!isAllExpanded);
  }

  if (typeof data !== "object" || data === null) {
    return (
      <span
        className={cn(
          "font-mono text-sm",
          typeof data === "string"
            ? "text-green-600 dark:text-green-400"
            : typeof data === "number"
              ? "text-blue-600 dark:text-blue-400"
              : typeof data === "boolean"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-600 dark:text-gray-400",
        )}
      >
        {JSON.stringify(data)}
      </span>
    )
  }

  const isArray = Array.isArray(data)
  const keys = Object.keys(data)

  if (keys.length === 0) {
    return <span className="font-mono text-sm">{isArray ? "[]" : "{}"}</span>
  }

  // 只在最顶层显示折叠/展开按钮
  const renderExpandCollapseButton = level === 0 && (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleAll}
      className="mb-4 flex items-center gap-1"
    >
      {isAllExpanded ? (
        <>
          <ChevronsUp className="h-4 w-4" /> 
          <span>折叠全部</span>
        </>
      ) : (
        <>
          <ChevronsDown className="h-4 w-4" /> 
          <span>展开全部</span>
        </>
      )}
    </Button>
  );

  return (
    <div className={level === 0 ? "" : "pl-4"}>
      {level === 0 && renderExpandCollapseButton}
      <span className="font-mono text-sm">{isArray ? "[" : "{"}</span>
      {keys.map((key, index) => {
        const value = data[key]
        const isObject = typeof value === "object" && value !== null
        // 构建完整的嵌套路径
        const fullPath = Array.isArray(data) 
          ? (prefix ? `${prefix}.${index}` : `${index}`) 
          : (prefix ? `${prefix}.${key}` : key);
        const isExpanded = expanded[fullPath];

        return (
          <div key={Array.isArray(data) ? index : key} className="ml-2">
            <div className="flex items-start">
              {isObject && (
                <button onClick={() => toggleExpand(fullPath)} className="mr-1 mt-1 focus:outline-none">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              )}
              <div className="flex-1">
                <span className="font-mono text-sm">
                  {!isArray && (
                    <>
                      <span className="text-red-600 dark:text-red-400">"{key}"</span>
                      <span className="text-gray-600 dark:text-gray-400">: </span>
                    </>
                  )}
                  {isObject ? (
                    <>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Array.isArray(value) ? `Array(${value.length})` : "Object"}
                      </span>
                      {!isExpanded && (
                        <span className="text-gray-400 dark:text-gray-500 ml-1">
                          {Array.isArray(value) ? "[...]" : "{...}"}
                        </span>
                      )}
                    </>
                  ) : (
                    <JsonViewer data={value} level={level + 1} initialExpandAll={initialExpandAll} prefix={fullPath} />
                  )}
                </span>
                {isExpanded && isObject && (
                  <div className="mt-1">
                    <JsonViewer 
                      data={value} 
                      level={level + 1} 
                      initialExpandAll={initialExpandAll}
                    />
                  </div>
                )}
              </div>
            </div>
            {index < keys.length - 1 && <span className="text-gray-600 dark:text-gray-400">,</span>}
          </div>
        )
      })}
      <span className="font-mono text-sm">{isArray ? "]" : "}"}</span>
    </div>
  )
}
