'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    studyReminders: true,
    quizAlerts: true,
  })
  const [studyPreferences, setStudyPreferences] = useState({
    dailyGoal: '2',
    difficulty: 'medium',
    reminderTime: '09:00',
  })
  const [privacy, setPrivacy] = useState({
    shareProgress: false,
    publicProfile: false,
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    const savedNotifications = localStorage.getItem('notifications')
    const savedStudyPrefs = localStorage.getItem('studyPreferences')
    const savedPrivacy = localStorage.getItem('privacy')

    if (savedDarkMode) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
    if (savedStudyPrefs) setStudyPreferences(JSON.parse(savedStudyPrefs))
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy))
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', String(newDarkMode))
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Dispatch custom event to notify other components/pages
    window.dispatchEvent(new CustomEvent('darkModeChange', { detail: { darkMode: newDarkMode } }))
  }

  const handleNotificationChange = (key: string) => {
    const newNotifications = { ...notifications, [key]: !notifications[key as keyof typeof notifications] }
    setNotifications(newNotifications)
    localStorage.setItem('notifications', JSON.stringify(newNotifications))
  }

  const handleStudyPrefChange = (key: string, value: string) => {
    const newPrefs = { ...studyPreferences, [key]: value }
    setStudyPreferences(newPrefs)
    localStorage.setItem('studyPreferences', JSON.stringify(newPrefs))
  }

  const handlePrivacyChange = (key: string) => {
    const newPrivacy = { ...privacy, [key]: !privacy[key as keyof typeof privacy] }
    setPrivacy(newPrivacy)
    localStorage.setItem('privacy', JSON.stringify(newPrivacy))
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('darkMode')
      localStorage.removeItem('notifications')
      localStorage.removeItem('studyPreferences')
      localStorage.removeItem('privacy')
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
      setNotifications({
        email: true,
        push: true,
        studyReminders: true,
        quizAlerts: true,
      })
      setStudyPreferences({
        dailyGoal: '2',
        difficulty: 'medium',
        reminderTime: '09:00',
      })
      setPrivacy({
        shareProgress: false,
        publicProfile: false,
      })
      alert('✅ Settings reset to default!')
    }
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Sidebar />
      <TopBar />
      
      <main className="md:pl-64 pt-16 h-full overflow-auto">
        {/* Main Content */}
        <div className="w-full px-8 py-8 max-w-4xl mx-auto space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Manage your preferences and account settings
          </p>

          {/* Appearance Settings */}
          <div className="ai-card dark:bg-gray-800 dark:border-gray-700">
            <div className="ai-card-header dark:border-gray-700">
              <h3 className="ai-card-title dark:text-white">🎨 Appearance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between light and dark theme
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="ai-card dark:bg-gray-800 dark:border-gray-700">
            <div className="ai-card-header dark:border-gray-700">
              <h3 className="ai-card-title dark:text-white">🔔 Notifications</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      value ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Study Preferences */}
          <div className="ai-card dark:bg-gray-800 dark:border-gray-700">
            <div className="ai-card-header dark:border-gray-700">
              <h3 className="ai-card-title dark:text-white">📚 Study Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Daily Study Goal (hours)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={studyPreferences.dailyGoal}
                  onChange={(e) => handleStudyPrefChange('dailyGoal', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                />
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Default Difficulty Level
                </label>
                <select
                  value={studyPreferences.difficulty}
                  onChange={(e) => handleStudyPrefChange('difficulty', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="adaptive">Adaptive (AI-powered)</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Study Reminder Time
                </label>
                <input
                  type="time"
                  value={studyPreferences.reminderTime}
                  onChange={(e) => handleStudyPrefChange('reminderTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="ai-card dark:bg-gray-800 dark:border-gray-700">
            <div className="ai-card-header dark:border-gray-700">
              <h3 className="ai-card-title dark:text-white">🔒 Privacy</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                  </div>
                  <button
                    onClick={() => handlePrivacyChange(key)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="ai-card dark:bg-gray-800 dark:border-gray-700">
            <div className="ai-card-header dark:border-gray-700">
              <h3 className="ai-card-title dark:text-white">🔧 Account Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleResetSettings}
                className="w-full px-4 py-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors font-medium"
              >
                🔄 Reset All Settings
              </button>
              
              <button
                onClick={() => alert('Export data feature coming soon!')}
                className="w-full px-4 py-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors font-medium"
              >
                📥 Export Study Data
              </button>
              
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete all study data? This cannot be undone!')) {
                    localStorage.clear()
                    alert('⚠️ All data cleared! Please refresh the page.')
                  }
                }}
                className="w-full px-4 py-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors font-medium"
              >
                🗑️ Clear All Study Data
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="ai-card ai-gradient-primary text-white">
            <h3 className="text-lg font-semibold mb-3">💡 About Your Data</h3>
            <div className="text-sm text-blue-100 space-y-2">
              <p>✨ All settings are stored locally in your browser</p>
              <p>🔒 Your study data is private and never shared</p>
              <p>🤖 AI processing happens securely through our backend</p>
              <p>📊 You can export your data anytime</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
