"use client"

import { useEffect, useState } from "react"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/components/language-provider"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export function NotificationBanner() {
  const [notice, setNotice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    setIsLoading(true)
    fetch('/vercel.config.json')
      .then(response => response.json())
      .then(data => {
        if (data.notice) {
          setNotice(data.notice)
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error(t('loading-notice-error'), error)
        setError(t('loading-notice-error'))
        setIsLoading(false)
      })
  }, [t])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (isLoading || !notice || !isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800 mb-4 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <AlertDescription className="font-medium py-1">
                  {notice}
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                <span className="sr-only">关闭</span>
              </Button>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 