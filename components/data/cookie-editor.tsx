"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface CookieEditorProps {
  value: string
  onChange: (value: string) => void
}

export function CookieEditor({ value, onChange }: CookieEditorProps) {
  const [isDragging, setIsDragging] = useState(false)
  const { t } = useLanguage()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      onChange(content)
    }
    reader.readAsText(file)

    // Reset the input value so the same file can be uploaded again
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      onChange(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="cookie-data" className="text-sm font-medium flex items-center">
        <span className="mr-1">🍪</span> {t("cookie-data")}
      </Label>

      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging
            ? "border-[#0071e3] bg-[#0071e3]/5 dark:border-[#5ac8fa] dark:bg-[#5ac8fa]/5"
            : "border-gray-200 dark:border-gray-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-4">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("drag-drop")}</p>
          <p className="text-xs text-gray-400 mb-3">{t("or")}</p>
          <Button
            variant="outline"
            size="sm"
            className="relative dark:border-gray-600 dark:text-gray-300"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            {t("choose-file")}
            <input id="file-upload" type="file" accept=".txt" className="sr-only" onChange={handleFileUpload} />
          </Button>
        </div>
      </div>

      <Textarea
        id="cookie-data"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("cookie-placeholder")}
        className="min-h-[100px] mt-2 dark:bg-gray-700 dark:border-gray-600"
      />
    </div>
  )
}
