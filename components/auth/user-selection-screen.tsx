"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { Users, ArrowRight } from "lucide-react"
import { fetchDataList } from "@/lib/api"
import { DataEntry } from "@/components/dashboard/data-dashboard"

interface UserSelectionScreenProps {
  onSelectUser: (userId: string) => void
}

export function UserSelectionScreen({ onSelectUser }: UserSelectionScreenProps) {
  const [users, setUsers] = useState<DataEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchDataList()
        setUsers(data)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  const getUserDisplayName = (user: DataEntry) => {
    // 直接使用ID，与数据仪表盘显示方式保持一致
    return user.id
  }

  // 根据用户ID前缀，设置不同的图标
  const getUserIcon = (userId: string) => {
    if (userId.startsWith('lzy')) return '🏷️'
    if (userId.startsWith('zhn')) return '🏷️'
    if (userId.startsWith('zzw')) return '🏷️'
    if (userId.startsWith('max')) return '🔧'
    return '📝'
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-[#f5f5f7] to-[#e5e5ea] dark:from-gray-900 dark:to-gray-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-lg border-0 dark:bg-gray-800 dark:text-white">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-[#0071e3] dark:bg-[#0077ED] rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">{t("select-user")}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1 dark:text-gray-400">
              {t("select-user-description")}
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground dark:text-gray-400">{t("no-users-found")}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {users.map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    className="w-full justify-between items-center hover:bg-primary/10 dark:border-gray-700"
                    onClick={() => onSelectUser(user.id)}
                  >
                    <span className="truncate">
                      <span className="mr-1">{getUserIcon(user.id)}</span> {getUserDisplayName(user)}
                    </span>
                    <ArrowRight className="h-4 w-4 ml-2 text-primary" />
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => window.sessionStorage.removeItem("isAuthenticated")}
              className="text-muted-foreground"
            >
              {t("logout")}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
} 