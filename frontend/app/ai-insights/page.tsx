'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import AIInsights from '@/components/AIInsights'

export default function AIInsightsPage() {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="AI Insights" />
        <main className="flex-1 overflow-y-auto">
          <AIInsights />
        </main>
      </div>
    </div>
  )
}