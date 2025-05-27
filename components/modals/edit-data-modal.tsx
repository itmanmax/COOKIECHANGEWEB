"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { DataEntry } from "@/components/dashboard/data-dashboard"
import { JsonEditor } from "@/components/data/json-editor"
import { CookieEditor } from "@/components/data/cookie-editor"
import { updateData } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"
import { X, Edit } from "lucide-react"
import { transformReservationFormat } from "@/lib/utils"

const daysOfWeekEnum = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
])

const reservationItemSchema = z.object({
  username: z.string().min(1, { message: "Reserve item must have a username" }),
  password: z.string().min(1, { message: "Reserve item must have a password" }),
  time: z
    .tuple([z.string(), z.string()], {
      invalid_type_error: "Time must be an array of two strings",
      required_error: "Time is required",
    })
    .refine(
      (times) => {
        const timeRegex = /^(?:[01]\\d|2[0-3]):[0-5]\\d$/
        return timeRegex.test(times[0]) && timeRegex.test(times[1])
      },
      { message: "Time must be in HH:MM format (e.g., '09:00')" }
    ),
  roomid: z.string().min(1, { message: "Reserve item must have a roomid" }),
  seatid: z
    .array(z.string().min(1, { message: "Seat ID cannot be empty" }))
    .min(1, { message: "Reserve item must have at least one seatid" }),
  daysofweek: z
    .array(daysOfWeekEnum, {
      invalid_type_error: "Day of week must be a valid day name",
      required_error: "Day of week is required",
    })
    .min(1, { message: "Each reserve item must specify at least one day of the week" }),
})

const testJsonSchema = z
  .object({
    reserve: z.array(reservationItemSchema),
  })
  .passthrough()

interface EditDataModalProps {
  isOpen: boolean
  onClose: () => void
  data: DataEntry | null
  onDataUpdated: (data: DataEntry) => void
}

export function EditDataModal({ isOpen, onClose, data, onDataUpdated }: EditDataModalProps) {
  const [jsonData, setJsonData] = useState<any>(data?.testjson || { reserve: [] })
  const [cookieData, setCookieData] = useState(data?.cookie || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    if (data) {
      setJsonData(data.testjson)
      setCookieData(data.cookie)
    } else {
      setJsonData({ reserve: [] });
      setCookieData("");
    }
  }, [data])

  const resetForm = () => {
    if (data) {
    setJsonData(data.testjson)
    setCookieData(data.cookie)
    } else {
        setJsonData({ reserve: [] });
        setCookieData("");
    }
  }

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = async () => {
    if (!data) {
      toast({ title: "Error", description: "No data to update.", variant: "destructive" });
      return;
    }
    console.log("更新按钮被点击...");
    
    try {
      setIsSubmitting(true);
      console.log("正在调用API更新数据...", data.id);
      
      await updateData(data.id, {
        testjson: jsonData,
        cookie: cookieData || "default_cookie",
      });
      
      console.log("API调用成功，数据已更新");

      const updatedDataEntry: DataEntry = {
        ...data,
        testjson: jsonData,
        cookie: cookieData,
        updated_at: new Date().toISOString(),
      };

      onDataUpdated(updatedDataEntry);

      toast({
        title: "数据更新成功",
        description: `已更新ID为: ${data.id} 的数据`,
      });

      onClose();
    } catch (error) {
      console.error("API调用失败:", error);
      toast({
        title: "更新数据失败",
        description: "无法更新数据，请重试。" + (error instanceof Error ? error.message : ''),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen || !data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-6xl p-0 overflow-hidden dark:bg-gray-800 dark:text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute left-4 top-4 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        <DialogHeader className="p-6 pb-2 pl-12">
          <DialogTitle className="flex items-center text-xl">
            <Edit className="mr-2 h-5 w-5 text-gray-500" />
            {t("edit-data-title")}{" "}
            <span className="text-[#0071e3] dark:text-[#5ac8fa] ml-1">{data.id}</span>
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-muted-foreground pt-1 pl-8">
            {t("edit-data-description")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 overflow-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 dark:bg-gray-700">
              <TabsTrigger value="visual">{t("visual-editor")}</TabsTrigger>
              <TabsTrigger value="raw">{t("raw-json")}</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="mt-0">
              <JsonEditor value={jsonData} onChange={setJsonData} />
            </TabsContent>

            <TabsContent value="raw" className="mt-0">
              <Label htmlFor="raw-json" className="text-sm font-medium">
                {t("json-data")}
              </Label>
              <Textarea
                id="raw-json"
                key={data.id}
                defaultValue={JSON.stringify(jsonData, null, 2)}
                onBlur={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setJsonData(parsed);
                  } catch (error) {
                    console.log("JSON解析错误，Textarea内容可能无效，但允许用户继续编辑");
                  }
                }}
                placeholder="输入JSON数据"
                className="font-mono text-sm mt-1 min-h-[200px] dark:bg-gray-700 dark:border-gray-600"
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <CookieEditor value={cookieData} onChange={setCookieData} />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleClose} className="dark:border-gray-600 dark:text-gray-300">
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#0071e3] hover:bg-[#0077ED] text-white dark:bg-[#0077ED] dark:hover:bg-[#0071e3]"
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? t("updating") : t("update-data")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
