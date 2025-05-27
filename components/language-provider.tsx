"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { translations } from "@/lib/translations"

type Language = "en" | "zh"

type LanguageProviderProps = {
  children: React.ReactNode
}

type LanguageProviderState = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const initialState: LanguageProviderState = {
  language: "zh",
  setLanguage: () => null,
  t: (key) => key,
}

const LanguageProviderContext = createContext<LanguageProviderState>(initialState)

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>("zh")

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") as Language | null
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: string): string => {
    const currentTranslations = translations[language] || {};
    return key in currentTranslations ? currentTranslations[key] : key;
  }

  return (
    <LanguageProviderContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageProviderContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
