import "@/styles/globals.css"
import { LanguageProvider } from "@/components/language-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { StagewiseToolbar } from '@stagewise/toolbar-next'
import { Toaster } from "@/components/ui/toaster"
import { NotificationBanner } from "@/components/ui/notification-banner"

export const metadata = {
  title: "数据管理系统",
  description: "一个现代化的数据管理和监控系统",
  icons: {
    icon: "/favicon.ico"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const stagewiseConfig = {
    plugins: []
  }
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        {process.env.NODE_ENV === 'development' && (
          <StagewiseToolbar config={stagewiseConfig} />
        )}
        <ThemeProvider>
          <LanguageProvider>
            <div className="min-h-screen flex flex-col">
              <div className="sticky top-0 z-50 bg-white dark:bg-gray-950 shadow-sm">
                <div className="container mx-auto px-4 py-2">
                  <NotificationBanner />
                </div>
              </div>
              <div className="flex-1 container mx-auto px-4 py-4">
                {children}
              </div>
            </div>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
