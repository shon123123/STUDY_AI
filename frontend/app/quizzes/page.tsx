'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Quizzes from '@/components/Quizzes'

export default function QuizzesPage() {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Quizzes" />
        <main className="flex-1 overflow-y-auto">
          <Quizzes />
        </main>
      </div>
    </div>
  )
}