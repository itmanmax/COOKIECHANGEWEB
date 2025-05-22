"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2, Plus, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"

interface JsonEditorProps {
  value: any
  onChange: (value: any) => void
}

// 定义预订项的接口
interface ReservationItem {
  username: string;
  password: string;
  time: string[];
  roomid: string;
  seatid: string[];
  daysofweek: string[];
  [key: string]: any;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const TIME_OPTIONS = [
  "08:00", "08:30",
  "09:00", "09:30",
  "10:00", "10:30",
  "11:00", "11:30",
  "12:00", "12:30",
  "13:00", "13:30",
  "14:00", "14:30",
  "15:00", "15:30",
  "16:00", "16:30",
  "17:00", "17:30",
  "18:00", "18:30",
  "19:00", "19:30",
  "20:00", "20:30",
  "21:00", "21:30",
  "22:00",
]

export function JsonEditor({ value, onChange }: JsonEditorProps) {
  const [activeTab, setActiveTab] = useState("reserve")
  const { t } = useLanguage()

  const handleReserveChange = (reserve: ReservationItem[]) => {
    const formattedReserve = reserve.flatMap(item => {
      if (!item.daysofweek || item.daysofweek.length <= 1) {
        return [item];
      }
      
      return item.daysofweek.map((day: string) => ({
        ...item,
        daysofweek: [day]
      }));
    });
    
    onChange({ ...value, reserve: formattedReserve });
  }

  const getReserveData = () => {
    const originalReserve = value?.reserve || [];
    
    const mergedReserve: ReservationItem[] = [];
    const groupedItems: {[key: string]: ReservationItem} = {};
    
    originalReserve.forEach((item: ReservationItem) => {
      const key = `${item.username}-${item.password}-${item.roomid}-${item.time.join(',')}-${item.seatid.join(',')}`;
      
      if (!groupedItems[key]) {
        groupedItems[key] = {
          ...item,
          daysofweek: [...item.daysofweek]
        };
        mergedReserve.push(groupedItems[key]);
      } else {
        item.daysofweek.forEach((day: string) => {
          if (!groupedItems[key].daysofweek.includes(day)) {
            groupedItems[key].daysofweek.push(day);
          }
        });
      }
    });
    
    return mergedReserve;
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 dark:bg-gray-700">
          <TabsTrigger value="reserve">{t("reservation-data")}</TabsTrigger>
          <TabsTrigger value="other">{t("other-properties")}</TabsTrigger>
        </TabsList>

        <TabsContent value="reserve" className="mt-0">
          <ReservationEditor value={getReserveData()} onChange={handleReserveChange} />
        </TabsContent>

        <TabsContent value="other" className="mt-0">
          <OtherPropertiesEditor value={value} onChange={onChange} excludeKeys={["reserve"]} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ReservationEditorProps {
  value: ReservationItem[]
  onChange: (value: ReservationItem[]) => void
}

function ReservationEditor({ value, onChange }: ReservationEditorProps) {
  const { t } = useLanguage()

  const addReservation = () => {
    onChange([
      ...value,
      {
        username: "",
        password: "",
        time: ["09:00", "22:00"],
        roomid: "",
        seatid: [""],
        daysofweek: ["Monday"],
      },
    ])
  }

  const updateReservation = (index: number, updatedReservation: any) => {
    const newReservations = [...value]
    newReservations[index] = updatedReservation
    onChange(newReservations)
  }

  const removeReservation = (index: number) => {
    const newReservations = [...value]
    newReservations.splice(index, 1)
    onChange(newReservations)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium flex items-center">
          <span className="mr-1">📅</span> {t("reservation-schedule")}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addReservation}
          className="text-[#0071e3] dark:text-[#5ac8fa] border-[#0071e3]/30 dark:border-[#5ac8fa]/30 hover:bg-[#0071e3]/10 dark:hover:bg-[#5ac8fa]/10"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {t("add-reservation")}
        </Button>
      </div>

      <AnimatePresence>
        {value.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 bg-[#f5f5f7] dark:bg-gray-900 rounded-lg"
          >
            <p className="text-gray-500 dark:text-gray-400">{t("no-reservations")}</p>
            <Button variant="link" onClick={addReservation} className="text-[#0071e3] dark:text-[#5ac8fa] mt-2">
              {t("add-first-reservation")}
            </Button>
          </motion.div>
        ) : (
          value.map((reservation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ReservationItem
                reservation={reservation}
                onChange={(updated) => updateReservation(index, updated)}
                onRemove={() => removeReservation(index)}
                index={index}
              />
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}

interface ReservationItemProps {
  reservation: ReservationItem
  onChange: (updated: ReservationItem) => void
  onRemove: () => void
  index: number
}

function ReservationItem({ reservation, onChange, onRemove, index }: ReservationItemProps) {
  const { t } = useLanguage()

  const updateField = (field: string, value: any) => {
    onChange({ ...reservation, [field]: value })
  }

  const addSeatId = () => {
    const seatid = [...reservation.seatid, ""]
    updateField("seatid", seatid)
  }

  const updateSeatId = (index: number, value: string) => {
    const seatid = [...reservation.seatid]
    seatid[index] = value
    updateField("seatid", seatid)
  }

  const removeSeatId = (index: number) => {
    const seatid = [...reservation.seatid]
    seatid.splice(index, 1)
    updateField("seatid", seatid)
  }

  const toggleDay = (day: string) => {
    const daysofweek = [...reservation.daysofweek]
    const index = daysofweek.indexOf(day)

    if (index >= 0) {
      daysofweek.splice(index, 1)
    } else {
      daysofweek.push(day)
    }

    updateField("daysofweek", daysofweek)
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center">
          <span className="mr-1">🗓️</span> {t("reservation")} {index + 1}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`username-${index}`} className="text-sm">
              {t("username")}
            </Label>
            <Input
              id={`username-${index}`}
              value={reservation.username}
              onChange={(e) => updateField("username", e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor={`password-${index}`} className="text-sm">
              {t("password-field")}
            </Label>
            <Input
              id={`password-${index}`}
              type="password"
              value={reservation.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`roomid-${index}`} className="text-sm">
              {t("room-id")}
            </Label>
            <Input
              id={`roomid-${index}`}
              value={reservation.roomid}
              onChange={(e) => updateField("roomid", e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <Label className="text-sm">{t("time-range")}</Label>
            <div className="flex items-center gap-2 mt-1">
              <Select
                value={reservation.time[0]}
                onValueChange={(value) => updateField("time", [value, reservation.time[1]])}
              >
                <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700">
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>to</span>
              <Select
                value={reservation.time[1]}
                onValueChange={(value) => updateField("time", [reservation.time[0], value])}
              >
                <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700">
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm">{t("seat-ids")}</Label>
          <div className="space-y-2 mt-1">
            {reservation.seatid.map((seat: string, seatIndex: number) => (
              <div key={seatIndex} className="flex items-center gap-2">
                <Input
                  value={seat}
                  onChange={(e) => updateSeatId(seatIndex, e.target.value)}
                  placeholder="Seat ID"
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSeatId(seatIndex)}
                  disabled={reservation.seatid.length <= 1}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addSeatId}
              className="mt-2 dark:border-gray-600 dark:text-gray-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("add-seat")}
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-sm">{t("days-of-week")}</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day}
                type="button"
                variant={reservation.daysofweek.includes(day) ? "default" : "outline"}
                size="sm"
                className={
                  reservation.daysofweek.includes(day)
                    ? "bg-[#0071e3] hover:bg-[#0077ED] text-white dark:bg-[#0077ED] dark:hover:bg-[#0071e3]"
                    : "dark:border-gray-600 dark:text-gray-300"
                }
                onClick={() => toggleDay(day)}
              >
                {day.substring(0, 3)}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface OtherPropertiesEditorProps {
  value: any
  onChange: (value: any) => void
  excludeKeys: string[]
}

function OtherPropertiesEditor({ value, onChange, excludeKeys }: OtherPropertiesEditorProps) {
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")
  const { t } = useLanguage()

  const addProperty = () => {
    if (!newKey.trim()) return

    try {
      let parsedValue
      try {
        parsedValue = JSON.parse(newValue)
      } catch {
        parsedValue = newValue
      }

      onChange({
        ...value,
        [newKey]: parsedValue,
      })

      setNewKey("")
      setNewValue("")
    } catch (error) {
      console.error("Error adding property:", error)
    }
  }

  const updateProperty = (key: string, newValue: string) => {
    try {
      let parsedValue
      try {
        parsedValue = JSON.parse(newValue)
      } catch {
        parsedValue = newValue
      }

      const newObj = { ...value }
      newObj[key] = parsedValue
      onChange(newObj)
    } catch (error) {
      console.error("Error updating property:", error)
    }
  }

  const removeProperty = (key: string) => {
    const newObj = { ...value }
    delete newObj[key]
    onChange(newObj)
  }

  const getEditableProperties = () => {
    return Object.keys(value || {}).filter((key) => !excludeKeys.includes(key))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium flex items-center">
          <span className="mr-1">🔧</span> {t("other-properties")}
        </h3>
      </div>

      <div className="space-y-3">
        {getEditableProperties().map((key) => (
          <div key={key} className="flex items-start gap-2">
            <div className="flex-1">
              <Label className="text-sm">{key}</Label>
              <Input
                value={typeof value[key] === "object" ? JSON.stringify(value[key]) : String(value[key])}
                onChange={(e) => updateProperty(key, e.target.value)}
                className="mt-1 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeProperty(key)}
              className="mt-6 h-8 w-8 p-0 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="new-key" className="text-sm">
                {t("new-property-key")}
              </Label>
              <Input
                id="new-key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="key"
                className="mt-1 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="new-value" className="text-sm">
                {t("value")}
              </Label>
              <Input
                id="new-value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="value"
                className="mt-1 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addProperty}
              disabled={!newKey.trim()}
              className="mb-0.5 dark:border-gray-600 dark:text-gray-300"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
