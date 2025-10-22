'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/overview', icon: '📊', gradient: 'from-blue-500 to-indigo-500' },
  { name: 'Study Materials', href: '/materials', icon: '📚', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Study Planner', href: '/planner', icon: '🎯', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Flashcards', href: '/flashcards', icon: '🧠', gradient: 'from-cyan-500 to-blue-500' },
  { name: 'Quizzes', href: '/quizzes', icon: '❓', gradient: 'from-orange-500 to-red-500' },
  { name: 'Progress', href: '/progress', icon: '📈', gradient: 'from-teal-500 to-green-500' },
  { name: 'AI Insights', href: '/insights', icon: '💡', gradient: 'from-yellow-500 to-orange-500' },
  { name: 'AI Assistant', href: '/ai-assistant', icon: '🤖', gradient: 'from-indigo-500 to-purple-500' },
  { name: 'Settings', href: '/settings', icon: '⚙️', gradient: 'from-gray-500 to-slate-500' },
]

export default function Sidebar() {
  const pathname = usePathname()
  
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors duration-200">
        {/* Logo with animated gradient */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center space-x-3 w-full">
            <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-3 transition-all duration-300 neon-glow">
              <span className="text-white font-bold text-xl">🎓</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Study AI</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Your Learning Companion</span>
            </div>
          </div>
        </div>
        
        {/* Navigation with enhanced hover effects */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`
                    relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]` 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-gray-900 dark:hover:text-white hover:shadow-md'
                    }
                    overflow-hidden
                  `}
                >
                  {/* Shine effect on hover */}
                  <div className={`absolute inset-0 ${!isActive ? 'shimmer-card' : ''}`}></div>
                  
                  <span className={`
                    relative z-10 mr-3 text-lg transform group-hover:scale-125 transition-transform duration-300
                    ${isActive ? 'drop-shadow-lg' : ''}
                  `}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 flex-1">{item.name}</span>
                  
                  {isActive && (
                    <span className="relative z-10 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse animation-delay-150"></span>
                    </span>
                  )}
                  
                  {!isActive && (
                    <span className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </Link>
                
                {/* Tooltip on hover (optional) */}
                {!isActive && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl">
                    {item.name}
                    <div className="absolute left-0 top-1/2 -ml-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        
        {/* Enhanced Footer with Profile */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-base font-semibold">👤</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse shadow-lg shadow-green-500/50"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Student</p>
              <p className="text-xs text-green-600 dark:text-green-400 truncate flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                Online
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}