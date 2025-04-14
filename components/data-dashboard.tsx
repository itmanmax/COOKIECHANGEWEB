"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DataItem } from "@/components/data-item"
import { CreateDataModal } from "@/components/create-data-modal"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw, Database, Sparkles } from "lucide-react"
import { DataHeader } from "@/components/data-header"
import { useToast } from "@/hooks/use-toast"
import { fetchDataList } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"
import { checkAndSendUpdateNotice } from "@/lib/notification"

export interface DataEntry {
  id: string
  testjson: {
    reserve?: Array<{
      username: string
      password: string
      time: string[]
      roomid: string
      seatid: string[]
      daysofweek: string[]
    }>
    name?: string
    value?: number
    array?: number[]
  }
  cookie: string
  created_at: string
  updated_at?: string
}

export function DataDashboard() {
  const [dataList, setDataList] = useState<DataEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  const loadData = async () => {
    try {
      setIsRefreshing(true)
      const data = await fetchDataList()
      setDataList(data)
      
      // 检查每条数据的更新时间，如果超过指定天数则发送通知
      data.forEach((item: DataEntry) => {
        checkAndSendUpdateNotice(item.id, item.created_at, item.updated_at);
      });
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Could not fetch data list. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()

    // 设置定时器，每天检查一次数据更新情况
    const checkInterval = 24 * 60 * 60 * 1000; // 24小时
    const intervalId = setInterval(() => {
      console.log("定时检查数据更新情况...");
      loadData();
    }, checkInterval);

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, [])

  const handleDataCreated = (newData: DataEntry) => {
    setDataList((prev) => [newData, ...prev])
    setIsCreateModalOpen(false)
  }

  const handleDataUpdated = (updatedData: DataEntry) => {
    setDataList((prev) => prev.map((item) => (item.id === updatedData.id ? updatedData : item)))
  }

  const handleDataDeleted = (id: string) => {
    setDataList((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <DataHeader />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 flex items-center">
          <Database className="mr-2 h-5 w-5 text-[#0071e3] dark:text-[#0077ED]" />
          {t("data-entries")}
        </h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 dark:border-gray-700 dark:text-gray-300"
            onClick={loadData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {t("refresh")}
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0071e3] hover:bg-[#0077ED] text-white dark:bg-[#0077ED] dark:hover:bg-[#0071e3]"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {t("create-new")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : dataList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-[#0071e3] dark:text-[#0077ED]" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">{t("no-data")}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t("create-first-data")}</p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0071e3] hover:bg-[#0077ED] text-white dark:bg-[#0077ED] dark:hover:bg-[#0071e3]"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {t("create-new-entry")}
          </Button>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {dataList.map((item) => (
              <DataItem key={item.id} data={item} onUpdate={handleDataUpdated} onDelete={handleDataDeleted} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <CreateDataModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDataCreated={handleDataCreated}
      />
    </div>
  )
}
