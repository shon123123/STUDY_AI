'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Dashboard from '@/components/Dashboard'

export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <TopBar title="Dashboard" />
        <main className="flex-1 overflow-y-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}