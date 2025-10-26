'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Progress from '@/components/Progress'

export default function ProgressPage() {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Progress" />
        <main className="flex-1 overflow-y-auto">
          <Progress />
        </main>
      </div>
    </div>
  )
}