"use client"

import { useState, useEffect } from "react"
import { DataDashboard } from "@/components/dashboard/data-dashboard"
import { LoginScreen } from "@/components/auth/login-screen"
import { UserSelectionScreen } from "@/components/auth/user-selection-screen"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // 检查用户是否已在此会话中通过身份验证
  useEffect(() => {
    const authStatus = sessionStorage.getItem("isAuthenticated")
    const userId = sessionStorage.getItem("selectedUserId")
    
    if (authStatus === "true") {
      setIsAuthenticated(true)
      if (userId) {
        setSelectedUserId(userId)
      }
    }
  }, [])

  const handleLogin = (password: string) => {
    if (password === "123456") {
      setIsAuthenticated(true)
      sessionStorage.setItem("isAuthenticated", "true")
      return true
    }
    return false
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId)
    sessionStorage.setItem("selectedUserId", userId)
  }

  const handleBackToUsers = () => {
    setSelectedUserId(null)
    sessionStorage.removeItem("selectedUserId")
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <main className="min-h-screen bg-[#f5f5f7] dark:bg-gray-900 transition-colors duration-300">
          {!isAuthenticated ? (
            <LoginScreen onLogin={handleLogin} />
          ) : selectedUserId ? (
            <DataDashboard userId={selectedUserId} onBackToUsers={handleBackToUsers} />
          ) : (
            <UserSelectionScreen onSelectUser={handleSelectUser} />
          )}
        </main>
      </LanguageProvider>
    </ThemeProvider>
  )
}
