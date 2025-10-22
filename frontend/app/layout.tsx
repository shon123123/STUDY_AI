'use client'

import './globals.css'
import { useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Apply dark mode on initial load and persist across navigation
    const darkMode = localStorage.getItem('darkMode') === 'true'
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Listen for storage changes (when dark mode is toggled in another component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darkMode') {
        if (e.newValue === 'true') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event when dark mode changes in same window
    const handleDarkModeChange = (e: CustomEvent) => {
      if (e.detail.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    window.addEventListener('darkModeChange' as any, handleDarkModeChange as any)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('darkModeChange' as any, handleDarkModeChange as any)
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.getItem('darkMode') === 'true') {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          `
        }} />
      </head>
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {children}
      </body>
    </html>
  )
}