'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import AIAssistant from '@/components/AIAssistant'

export default function AssistantPage() {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="AI Assistant" />
        <main className="flex-1 overflow-y-auto">
          <AIAssistant />
        </main>
      </div>
    </div>
  )
}