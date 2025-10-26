'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import Flashcards from '@/components/Flashcards'

export default function FlashcardsPage() {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Flashcards" />
        <main className="flex-1 overflow-y-auto">
          <Flashcards />
        </main>
      </div>
    </div>
  )
}