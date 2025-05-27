"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Globe, Bell, Info } from "lucide-react"
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
import { UpdateButtons } from "@/components/update-buttons"
import { fetchConfig } from "@/lib/api"

export function DataHeader() {
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { toast } = useToast()
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [notificationConfig, setNotificationConfig] = useState({
    enabled: true,
    noticeDays: 14,
    qmsgKey: '未设置',
    qqNumber: '未设置'
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 获取配置信息
  useEffect(() => {
    async function getConfigData() {
      try {
        const config = await fetchConfig()
        if (config.notification) {
          setNotificationConfig({
            enabled: config.notification.enabled,
            noticeDays: config.notification.noticeDays,
            qmsgKey: config.notification.qmsgKeySet || '未设置',
            qqNumber: config.notification.qqNumber || '未设置'
          })
        }
      } catch (error) {
        console.error('获取配置信息失败:', error)
        toast({
          title: "获取配置失败",
          description: "无法加载通知设置信息",
          variant: "destructive",
        })
      }
    }
    
    getConfigData()
  }, [toast])

  return (
    <motion.div
      className={`sticky top-0 z-10 backdrop-blur-lg mb-2 py-2 -mx-4 px-4 transition-all duration-300 ${
        scrolled ? "bg-white/80 dark:bg-gray-900/80 shadow-sm" : "bg-transparent"
      }`}
      animate={{
        height: scrolled ? 44 : 56,
        paddingTop: scrolled ? '8px' : '12px',
        paddingBottom: scrolled ? '8px' : '12px',
      }}
    >
      <div className="container mx-auto max-w-[1500px] flex justify-between items-center">
        {/* Left Section */}
        <div className="flex-1 flex items-center gap-4 flex-wrap justify-start">
          {/* Placeholder Logo - Replace with your actual logo */}
          <div className="text-xl font-bold text-[#0071e3] dark:text-[#5ac8fa]">
            ✨ 数据管理
          </div>
          {/* 通知信息按钮 */}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 px-2 text-xs border-[#0071e3]/30 dark:border-[#5ac8fa]/30 text-[#0071e3] dark:text-[#5ac8fa]"
            onClick={() => setInfoDialogOpen(true)}
          >
            <Info className="h-3 w-3 mr-1" /> 通知设置
          </Button>
        </div>

        {/* Center Section */}
        <div className="flex-initial">
          {/* 动态生成的更新按钮 */}
          <div className="transform scale-[1.5]">
            <UpdateButtons />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          {/* Language Dropdown and Theme Button were here, ensure they are retained */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                <Globe className="h-3.5 w-3.5" />
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
            className="h-8 w-8 rounded-full"
          >
            {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* QQ通知信息对话框 */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-1 text-[#0071e3] dark:text-[#5ac8fa]" /> 
              通知设置信息
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              当前配置的通知相关信息（从config.json读取）
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="font-medium text-sm">通知开关：</span>
              <span className={`col-span-2 bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm break-all ${notificationConfig.enabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {notificationConfig.enabled ? '已启用' : '已禁用'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="font-medium text-sm">QQ号码：</span>
              <span className="col-span-2 bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm break-all">
                {notificationConfig.qqNumber}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="font-medium text-sm">消息密钥：</span>
              <span className="col-span-2 bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm break-all">
                {notificationConfig.qmsgKey}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="font-medium text-sm">提醒天数：</span>
              <span className="col-span-2 bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm">
                {notificationConfig.noticeDays} 天
              </span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300 mt-4">
              <p>修改通知配置请直接编辑服务器上的 <code>config.json</code> 文件</p>
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
