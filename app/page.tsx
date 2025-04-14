"use client"

import { useState, useEffect } from "react"
import { DataDashboard } from "@/components/data-dashboard"
import { LoginScreen } from "@/components/login-screen"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user was previously authenticated in this session
  useEffect(() => {
    const authStatus = sessionStorage.getItem("isAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
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

  return (
    <ThemeProvider>
      <LanguageProvider>
        <main className="min-h-screen bg-[#f5f5f7] dark:bg-gray-900 transition-colors duration-300">
          {isAuthenticated ? <DataDashboard /> : <LoginScreen onLogin={handleLogin} />}
        </main>
      </LanguageProvider>
    </ThemeProvider>
  )
}
