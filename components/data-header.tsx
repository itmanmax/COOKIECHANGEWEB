"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Globe, RefreshCw, Bell, Info } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"

export function DataHeader() {
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { toast } = useToast()
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState({
    max: false,
    zzw: false
  })

  // 获取环境变量
  const qqNumber = process.env.NEXT_PUBLIC_QQ_NUMBER || '未设置'
  const qmsgKey = process.env.NEXT_PUBLIC_QMSG_KEY || '未设置'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 调用MAX更新接口
  const callMaxUpdateAPI = async () => {
    try {
      setIsLoading(prev => ({ ...prev, max: true }))
      // 使用本地API路由作为代理，避免CORS问题
      const response = await fetch('/api/update-max')
      
      if (!response.ok) {
        throw new Error('更新失败')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "MAX更新成功",
          description: data.message || "MAX数据已成功更新",
        })
      } else {
        throw new Error(data.message || '更新失败')
      }
    } catch (error) {
      console.error('MAX更新错误:', error)
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "MAX数据更新失败，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsLoading(prev => ({ ...prev, max: false }))
    }
  }

  // 调用ZZW更新接口
  const callZZWUpdateAPI = async () => {
    try {
      setIsLoading(prev => ({ ...prev, zzw: true }))
      // 使用本地API路由作为代理，避免CORS问题
      const response = await fetch('/api/update-zzw')
      
      if (!response.ok) {
        throw new Error('更新失败')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "ZZW更新成功",
          description: data.message || "ZZW数据已成功更新",
        })
      } else {
        throw new Error(data.message || '更新失败')
      }
    } catch (error) {
      console.error('ZZW更新错误:', error)
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "ZZW数据更新失败，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsLoading(prev => ({ ...prev, zzw: false }))
    }
  }

  return (
    <motion.div
      className={`sticky top-0 z-10 backdrop-blur-lg mb-8 py-6 -mx-4 px-4 transition-all duration-300 ${
        scrolled ? "bg-white/80 dark:bg-gray-900/80 shadow-sm" : "bg-transparent"
      }`}
      animate={{
        height: scrolled ? 70 : 100,
        paddingTop: scrolled ? 16 : 24,
        paddingBottom: scrolled ? 16 : 24,
      }}
    >
      <div className="container mx-auto max-w-5xl flex justify-between items-center">
        <div className="flex items-center gap-3 flex-wrap">
          <motion.h1
            className="text-3xl font-semibold bg-gradient-to-r from-[#0071e3] to-[#5ac8fa] dark:from-[#0077ED] dark:to-[#5ac8fa] bg-clip-text text-transparent flex items-center"
            animate={{
              fontSize: scrolled ? "1.75rem" : "2rem",
            }}
          >
            <span className="mr-2">✨</span> {t("data-management")}
          </motion.h1>

          {/* 通知信息按钮 */}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2 h-8 px-2 text-xs border-[#0071e3]/30 dark:border-[#5ac8fa]/30 text-[#0071e3] dark:text-[#5ac8fa]"
            onClick={() => setInfoDialogOpen(true)}
          >
            <Info className="h-3.5 w-3.5 mr-1" /> 通知设置
          </Button>

          {/* MAX更新按钮 */}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 text-xs border-green-500/30 text-green-600 dark:text-green-400"
            onClick={callMaxUpdateAPI}
            disabled={isLoading.max}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading.max ? 'animate-spin' : ''}`} /> 
            {isLoading.max ? '更新中...' : 'MAX更新'}
          </Button>

          {/* ZZW更新按钮 */}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 text-xs border-purple-500/30 text-purple-600 dark:text-purple-400"
            onClick={callZZWUpdateAPI}
            disabled={isLoading.zzw}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading.zzw ? 'animate-spin' : ''}`} /> 
            {isLoading.zzw ? '更新中...' : 'ZZW更新'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                <Globe className="h-4 w-4" />
                <span className="sr-only">Toggle language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                🇺🇸 {t("english")}
                {language === "en" && <span className="ml-2">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("zh")}>
                🇨🇳 {t("chinese")}
                {language === "zh" && <span className="ml-2">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9 rounded-full"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* QQ通知信息对话框 */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-[#0071e3] dark:text-[#5ac8fa]" /> 
              通知设置信息
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              当前配置的QQ通知相关信息
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="font-medium text-sm">QQ号码：</span>
              <span className="col-span-2 bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm break-all">
                {qqNumber}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="font-medium text-sm">消息密钥：</span>
              <span className="col-span-2 bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm break-all">
                {qmsgKey.substring(0, 6)}...{qmsgKey.substring(qmsgKey.length - 6)}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="font-medium text-sm">提醒天数：</span>
              <span className="col-span-2 bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm">
                {process.env.NEXT_PUBLIC_NOTICE_DAYS || '14'} 天
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="default">关闭</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
