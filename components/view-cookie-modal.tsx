"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"
import { X } from "lucide-react"

interface ViewCookieModalProps {
  isOpen: boolean
  onClose: () => void
  data: string
  dataId: string
}

export function ViewCookieModal({ isOpen, onClose, data, dataId }: ViewCookieModalProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen p-0 overflow-hidden dark:bg-gray-800 dark:text-white border-none">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </button>

        <DialogHeader className="p-8 pb-2">
          <DialogTitle className="text-2xl font-semibold flex items-center">
            <span className="mr-2">🍪</span> {t("cookie-data")} - {dataId}
          </DialogTitle>
          <DialogDescription className="text-left text-base text-muted-foreground pt-2">
            {t("view-cookie-desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 pt-4 overflow-auto h-[calc(100vh-150px)]">
          <div className="bg-[#f5f5f7] dark:bg-gray-900 rounded-lg p-6 overflow-auto h-full">
            <pre className="text-sm whitespace-pre-wrap dark:text-gray-300">{data}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
