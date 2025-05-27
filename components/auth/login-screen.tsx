"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/language-provider"
import { Lock, Key } from "lucide-react"

interface LoginScreenProps {
  onLogin: (password: string) => boolean
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      const success = onLogin(password)
      if (!success) {
        setError(true)
        setPassword("")
      }
      setIsLoading(false)
    }, 800) // Simulate loading for better UX
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-[#f5f5f7] to-[#e5e5ea] dark:from-gray-900 dark:to-gray-800">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md shadow-lg border-0 dark:bg-gray-800 dark:text-white">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-[#0071e3] dark:bg-[#0077ED] rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">{t("welcome")} 👋</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-6 dark:text-gray-400">{t("enter-password")}</p>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError(false)
                      }}
                      placeholder="******"
                      className={`pr-10 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      autoComplete="off"
                    />
                    <Key className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {t("incorrect-password")}
                    </motion.p>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              className="w-full bg-[#0071e3] hover:bg-[#0077ED] dark:bg-[#0077ED] dark:hover:bg-[#0071e3]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("login")}...
                </div>
              ) : (
                t("login")
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
