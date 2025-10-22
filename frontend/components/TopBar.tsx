'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/overview': 'Dashboard',
  '/materials': 'Study Materials',
  '/flashcards': 'Smart Flashcards',
  '/quizzes': 'Quizzes',
  '/progress': 'Learning Progress',
  '/planner': 'Study Planner',
  '/insights': 'AI Insights',
  '/ai-assistant': 'AI Assistant',
  '/settings': 'Settings',
}

export default function TopBar() {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  
  const pageTitle = PAGE_TITLES[pathname] || 'Dashboard'
  
  return (
    <div className="sticky top-0 z-30 md:pl-64">
      <div className="flex h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-gray-800 transition-all duration-200">
        <div className="flex-1 flex justify-between items-center">
          {/* Page Title with gradient - aligned with sidebar content */}
          <div className="flex items-center space-x-3 pl-8">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {pageTitle}
            </h1>
          </div>

          {/* Enhanced Search */}
          <div className="flex-1 flex justify-center max-w-xl mx-8">
            <div className="w-full">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-gray-500 group-hover:scale-110 transition-transform duration-200">🔍</span>
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent sm:text-sm transition-all duration-200 hover:shadow-md"
                  placeholder="Search documents, quizzes, flashcards..."
                  type="search"
                />
                {/* Search shortcut hint */}
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs font-sans">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3 pr-6">
            {/* Create button with gradient */}
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center space-x-2">
              <span>✨</span>
              <span>Create</span>
            </button>
            
            {/* Notifications with badge */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
              >
                <span className="sr-only">View notifications</span>
                <div className="w-6 h-6 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-200">
                  🔔
                </div>
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-lg shadow-red-500/50"></span>
                </span>
              </button>
              
              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">📚</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Document processed</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Your document is ready for review</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">✅</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Quiz completed</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Great job! You scored 85%</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group">
              <span className="sr-only">View messages</span>
              <div className="w-6 h-6 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-200">
                💬
              </div>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-900 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-semibold">👤</span>
                </div>
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Profile dropdown menu */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Student</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">student@example.com</p>
                  </div>
                  <div className="py-2">
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      👤 Profile
                    </a>
                    <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      ⚙️ Settings
                    </a>
                    <a href="/help" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      ❓ Help
                    </a>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      🚪 Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}