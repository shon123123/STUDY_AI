'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import StudyMaterials from '@/components/StudyMaterials'

export default function MaterialsPage() {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Study Materials" />
        <main className="flex-1 overflow-y-auto">
          <StudyMaterials />
        </main>
      </div>
    </div>
  )
}