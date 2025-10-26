'use client'

import React from 'react'
import { 
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface TopBarProps {
  title?: string
}

export default function TopBar({ title = 'Dashboard' }: TopBarProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search documents, quizzes, flashcards..."
              className="w-96 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <kbd className="inline-flex items-center px-2 py-1 border border-gray-600 rounded text-xs text-gray-400 bg-gray-700">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Create Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium">
            <PlusIcon className="h-4 w-4" />
            <span>Create</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
            <UserCircleIcon className="h-8 w-8" />
          </button>
        </div>
      </div>
    </header>
  )
}