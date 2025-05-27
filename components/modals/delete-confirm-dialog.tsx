"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { deleteData } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"
import { X } from "lucide-react"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  dataId: string
  onConfirmDelete: (id: string) => void
}

export function DeleteConfirmDialog({ isOpen, onClose, dataId, onConfirmDelete }: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleDelete = async () => {
    console.log("删除按钮被点击，正在删除ID:", dataId);
    
    try {
      setIsDeleting(true)
      await deleteData(dataId)

      toast({
        title: "数据删除成功",
        description: `已删除ID为: ${dataId} 的数据`,
      })

      console.log("删除操作成功完成")
      onConfirmDelete(dataId)
      onClose()
    } catch (error) {
      console.error("删除数据失败:", error)
      toast({
        title: "删除数据失败",
        description: "无法删除数据，请重试。" + (error instanceof Error ? error.message : ''),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="dark:bg-gray-800 dark:text-white w-[90%] max-w-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        <AlertDialogHeader className="pt-8 pb-4 items-center text-center">
          <AlertDialogTitle className="flex items-center justify-center text-center">
            <span className="mr-2">⚠️</span> {t("are-you-sure")}
          </AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-400 text-center">
            {t("delete-confirm")} <span className="font-semibold">{dataId}</span>. {t("cannot-undo")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 flex-1 max-w-[120px] m-0">
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            className="bg-red-500 hover:bg-red-600 text-white flex-1 max-w-[120px] m-0"
            disabled={isDeleting}
          >
            {isDeleting ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
