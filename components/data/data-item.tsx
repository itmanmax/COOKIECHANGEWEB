"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { format, differenceInDays } from "date-fns"
import { ChevronDown, Edit, Trash2, Calendar, Clock, Eye, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { DataEntry } from "@/components/dashboard/data-dashboard"
import { EditDataModal } from "@/components/modals/edit-data-modal"
import { DeleteConfirmDialog } from "@/components/modals/delete-confirm-dialog"
import { ViewJsonModal } from "@/components/modals/view-json-modal"
import { ViewCookieModal } from "@/components/modals/view-cookie-modal"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { daysBetween } from "@/lib/notification"

// 默认警戒天数
const DEFAULT_NOTICE_DAYS = parseInt(process.env.NEXT_PUBLIC_NOTICE_DAYS || '14', 10);

interface DataItemProps {
  data: DataEntry
  onUpdate: (updatedData: DataEntry) => void
  onDelete: (id: string) => void
}

export function DataItem({ data, onUpdate, onDelete }: DataItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false)
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false)
  const { t } = useLanguage()

  // 计算距离上次更新的天数
  const lastUpdateDate = data.updated_at ? new Date(data.updated_at) : new Date(data.created_at);
  const daysSinceUpdate = daysBetween(lastUpdateDate, new Date());
  const isNearingNotice = daysSinceUpdate >= DEFAULT_NOTICE_DAYS - 3;
  const isPastNotice = daysSinceUpdate >= DEFAULT_NOTICE_DAYS;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-300 dark:bg-gray-800 dark:text-white",
        isPastNotice ? "border-red-400 dark:border-red-600" : isNearingNotice ? "border-yellow-400 dark:border-yellow-600" : "border-gray-200 dark:border-gray-700"
      )}>
        <CardHeader className="p-4 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-[#f5f5f7] dark:bg-gray-700 text-[#0071e3] dark:text-[#5ac8fa] border-[#0071e3]/20 dark:border-[#5ac8fa]/20 font-medium"
              >
                🏷️ {data.id}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> {t("created")}: {format(new Date(data.created_at), "MMM d, yyyy")}
              </span>
              {data.updated_at && (
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> {t("updated")}: {format(new Date(data.updated_at), "MMM d, yyyy")}
                </span>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className={cn(
                      "text-sm flex items-center rounded-md px-2 py-1",
                      isPastNotice 
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                        : isNearingNotice 
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" 
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    )}>
                      {isPastNotice && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {daysSinceUpdate} 天
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>距离上次更新已经过去 {daysSinceUpdate} 天</p>
                    {isPastNotice && <p className="text-red-500">已超过提醒期限 ({DEFAULT_NOTICE_DAYS} 天)</p>}
                    {isNearingNotice && !isPastNotice && <p className="text-yellow-500">即将到达提醒期限</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-[#0071e3] dark:text-gray-400 dark:hover:text-[#5ac8fa]"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-gray-500 dark:text-gray-400 transition-transform duration-300",
                  isExpanded && "rotate-180",
                )}
                onClick={toggleExpand}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-4 pt-0">
            <Separator /> 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="mr-1">📊</span> {t("json-data")}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#0071e3] dark:text-[#5ac8fa] border-[#0071e3]/30 dark:border-[#5ac8fa]/30 hover:bg-[#0071e3]/10 dark:hover:bg-[#5ac8fa]/10"
                    onClick={() => setIsJsonModalOpen(true)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {t("view-full")}
                  </Button>
                </div>
                <div className="bg-[#f5f5f7] dark:bg-gray-900 rounded-lg p-4 overflow-auto max-h-[150px]">
                  <pre className="text-sm whitespace-pre-wrap dark:text-gray-300 font-mono">
                    {JSON.stringify(data.testjson, null, 2).substring(0, 200)}
                    {JSON.stringify(data.testjson, null, 2).length > 200 && "..."}
                  </pre>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="mr-1">🍪</span> {t("cookie-data")}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#0071e3] dark:text-[#5ac8fa] border-[#0071e3]/30 dark:border-[#5ac8fa]/30 hover:bg-[#0071e3]/10 dark:hover:bg-[#5ac8fa]/10"
                    onClick={() => setIsCookieModalOpen(true)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {t("view-full")}
                  </Button>
                </div>
                <div className="bg-[#f5f5f7] dark:bg-gray-900 rounded-lg p-4 overflow-auto max-h-[150px]">
                  <pre className="text-sm whitespace-pre-wrap dark:text-gray-300">
                    {data.cookie.substring(0, 200)}
                    {data.cookie.length > 200 && "..."}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {isExpanded && (
          <CardFooter className="p-4 pt-0 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-[#0071e3] dark:text-[#5ac8fa] border-[#0071e3]/30 dark:border-[#5ac8fa]/30 hover:bg-[#0071e3]/10 dark:hover:bg-[#5ac8fa]/10"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t("edit-data-btn")}
            </Button>
          </CardFooter>
        )}
      </Card>

      <EditDataModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        data={data}
        onDataUpdated={onUpdate}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        dataId={data.id}
        onConfirmDelete={onDelete}
      />

      <ViewJsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        data={data.testjson}
        dataId={data.id}
      />

      <ViewCookieModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
        data={data.cookie}
        dataId={data.id}
      />
    </motion.div>
  )
}
