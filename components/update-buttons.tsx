"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { getUpdateTypes, updateDataByType } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function UpdateButtons() {
  const [types, setTypes] = useState<string[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [loadingInit, setLoadingInit] = useState(true)
  const { toast } = useToast()

  // 获取所有更新类型
  useEffect(() => {
    async function fetchTypes() {
      try {
        const { types = [] } = await getUpdateTypes()
        setTypes(types)
      } catch (error) {
        console.error("获取更新类型失败:", error)
        toast({
          title: "获取更新类型失败",
          description: "无法获取可用的更新类型",
          variant: "destructive",
        })
      } finally {
        setLoadingInit(false)
      }
    }

    fetchTypes()
  }, [toast])

  // 处理更新
  const handleUpdate = async (type: string) => {
    setLoading((prev) => ({ ...prev, [type]: true }))

    try {
      const result = await updateDataByType(type)
      
      if (result.success) {
        toast({
          title: `${type.toUpperCase()} 更新成功`,
          description: `已成功调用 ${result.results.length} 个 API`,
        })
      } else {
        toast({
          title: `${type.toUpperCase()} 更新失败`,
          description: "所有 API 调用均失败",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`更新 ${type} 时出错:`, error)
      toast({
        title: `${type.toUpperCase()} 更新失败`,
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }))
    }
  }

  if (loadingInit) {
    return (
      <div className="flex gap-2">
        <Button
          disabled
          size="sm"
          variant="outline"
          className="text-xs border-gray-300 text-gray-500"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
          加载中...
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {types.length === 0 ? (
        <span className="text-sm text-gray-500">没有可用的更新类型</span>
      ) : (
        types.map((type) => (
          <Button
            key={type}
            size="sm"
            variant="outline"
            disabled={loading[type]}
            onClick={() => handleUpdate(type)}
            className="h-7 py-0 px-2 border-green-500/30 text-green-600 dark:text-green-400 hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw
              className={`h-3 w-3 mr-1 ${loading[type] ? "animate-spin" : ""}`}
            />
            {type.toUpperCase()} 更新
          </Button>
        ))
      )}
    </div>
  )
} 