'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Settings" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
              <p className="text-gray-400 mb-8">Customize your Study AI experience</p>
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                <p className="text-gray-300">Coming soon - User preferences and settings</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}