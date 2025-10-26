'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  DocumentTextIcon,
  CalendarIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Study Materials', href: '/materials', icon: DocumentTextIcon },
  { name: 'Study Planner', href: '/planner', icon: CalendarIcon },
  { name: 'Flashcards', href: '/flashcards', icon: AcademicCapIcon },
  { name: 'Quizzes', href: '/quizzes', icon: ClipboardDocumentListIcon },
  { name: 'Progress', href: '/progress', icon: ChartBarIcon },
  { name: 'AI Insights', href: '/ai-insights', icon: LightBulbIcon },
  { name: 'AI Assistant', href: '/assistant', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Study AI</h1>
                <p className="text-xs text-gray-400">Your Learning Companion</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}
                  `} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-success-500 to-primary-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">S</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Student</p>
                <p className="text-xs text-gray-400 truncate">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}