"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DataItem } from "@/components/data/data-item"
import { CreateDataModal } from "@/components/modals/create-data-modal"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw, Database, Sparkles, ArrowLeft } from "lucide-react"
import { DataHeader } from "@/components/dashboard/data-header"
import { useToast } from "@/hooks/use-toast"
import { fetchDataList, fetchDataById } from "@/lib/api"
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

interface DataDashboardProps {
  userId: string
  onBackToUsers?: () => void
}

export function DataDashboard({ userId, onBackToUsers }: DataDashboardProps) {
  const [data, setData] = useState<DataEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  const loadData = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      console.log(`正在加载用户 ${userId} 的数据...`);
      
      const userData = await fetchDataById(userId);
      console.log(`获取到用户数据响应:`, userData);
      
      // 检查响应中是否有有效的数据
      if (userData) {
        if (userData.testjson || userData.cookie) {
          // 直接格式：API返回的数据对象本身就是我们需要的
          console.log(`设置用户数据(直接格式):`, userData);
          setData(userData);
          
          if (userData.id && userData.created_at) {
            // 检查数据更新状态并发送通知
            await checkAndSendUpdateNotice(
              userData.id, 
              userData.created_at, 
              userData.updated_at || userData.created_at
            );
          }
        } else if (userData.data && (userData.data.testjson || userData.data.cookie)) {
          // 嵌套格式：数据包装在data属性中
          console.log(`设置用户数据(嵌套格式):`, userData.data);
          setData(userData.data);
          
          if (userData.data.id && userData.data.created_at) {
            await checkAndSendUpdateNotice(
              userData.data.id, 
              userData.data.created_at, 
              userData.data.updated_at || userData.data.created_at
            );
          }
        } else {
          console.warn(`用户 ${userId} 响应格式正确但没有有效数据内容`);
          setData(null);
          toast({
            title: t("no-data-available"),
            description: t("user-has-no-data"),
            variant: "default",
          });
        }
      } else {
        console.warn(`用户 ${userId} 没有数据或响应格式不正确`);
        setData(null);
        toast({
          title: t("no-data-available"),
          description: t("user-has-no-data"),
          variant: "default",
        });
      }
    } catch (error) {
      console.error(`加载用户 ${userId} 数据时出错:`, error);
      toast({
        title: t("error-loading-data"),
        description: typeof error === 'object' && error !== null ? (error as Error).message : t("could-not-fetch-user-data"),
        variant: "destructive",
      });
      setData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData()

    const checkInterval = 24 * 60 * 60 * 1000; 
    const intervalId = setInterval(() => {
      if(data){
         console.log("定时检查数据更新情况...");
         checkAndSendUpdateNotice(data.id, data.created_at, data.updated_at);
      }
    }, checkInterval);

    return () => clearInterval(intervalId);
  }, [userId])

  const handleDataCreated = (newData: DataEntry) => {
    if(newData.id === userId){
      setData(newData)
    }
    setIsCreateModalOpen(false)
  }

  const handleDataUpdated = (updatedData: DataEntry) => {
    if (updatedData.id === userId) {
      setData(updatedData)
    }
  }

  const handleDataDeleted = (id: string) => {
    if (id === userId) {
      setData(null)
      if(onBackToUsers) onBackToUsers(); 
    }
  }
  
  const getUserDisplayName = () => {
    if (!data) return userId;
    if (data.testjson && data.testjson.reserve && data.testjson.reserve.length > 0) {
      return data.testjson.reserve[0].username;
    }
    if (data.testjson && data.testjson.name) {
      return data.testjson.name;
    }
    return data.id;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <DataHeader />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {onBackToUsers && (
            <Button variant="ghost" size="icon" onClick={onBackToUsers} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 flex items-center">
            <Database className="mr-2 h-5 w-5 text-[#0071e3] dark:text-[#0077ED]" />
            {t("user-dashboard")} {data ? `: ${getUserDisplayName()}` : ''}
          </h2>
        </div>
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : !data ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-[#0071e3] dark:text-[#0077ED]" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            {userId ? t("no-data-for-user") : t("no-data")} 
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {userId ? t("user-data-may-not-exist") : t("create-first-data")}
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <DataItem key={data.id} data={data} onUpdate={handleDataUpdated} onDelete={handleDataDeleted} />
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
