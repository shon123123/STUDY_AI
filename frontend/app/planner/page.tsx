'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

interface StudySession {
  id: string
  time: string
  subject: string
  duration_minutes: number
  type: string
  difficulty: string
  topics: string[]
  energy_requirement: number
}

interface StudyPlan {
  user_id: string
  plan_created: string
  analysis: any
  schedule: any
  learning_paths: any[]
  study_strategies: any
  estimated_completion: string
  success_probability: number
}

interface LearningPath {
  name: string
  description: string
  steps: string[]
  estimated_weeks: number
  difficulty: string
}

export default function PlannerPage() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null)
  const [dailySchedule, setDailySchedule] = useState<StudySession[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentEnergy, setCurrentEnergy] = useState(7)
  const [availableTime, setAvailableTime] = useState(60)
  const [sessionOptimization, setSessionOptimization] = useState<any>(null)

  const [planSettings, setPlanSettings] = useState({
    available_hours_per_day: 2.0,
    learning_style: 'balanced',
    learning_goals: [
      { title: 'Master Core Concepts', description: 'Understanding fundamental principles', priority: 5 },
      { title: 'Practical Application', description: 'Apply knowledge to real scenarios', priority: 4 },
      { title: 'Advanced Topics', description: 'Explore complex topics', priority: 3 }
    ],
    current_knowledge: [
      { area: 'foundations', level: 'intermediate' },
      { area: 'applications', level: 'beginner' }
    ]
  })

  useEffect(() => {
    loadDailySchedule()
    loadLearningPaths()
  }, [])

  const createStudyPlan = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/study-planner/create-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'current_user',
          ...planSettings
        })
      })

      if (response.ok) {
        const data = await response.json()
        setStudyPlan(data.plan)
      }
    } catch (error) {
      console.error('Failed to create study plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const optimizeSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/study-planner/optimize-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'current_user',
          current_energy: currentEnergy,
          available_time: availableTime,
          subject_preferences: ['AI', 'Programming', 'Data Science']
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSessionOptimization(data.optimization)
      }
    } catch (error) {
      console.error('Failed to optimize session:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDailySchedule = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/study-planner/daily-schedule/current_user`)
      if (response.ok) {
        const data = await response.json()
        setDailySchedule(data.schedule.sessions)
      }
    } catch (error) {
      console.error('Failed to load schedule:', error)
    }
  }

  const loadLearningPaths = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/study-planner/learning-paths`)
      if (response.ok) {
        const data = await response.json()
        setLearningPaths(data.paths)
      }
    } catch (error) {
      console.error('Failed to load learning paths:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading': return '📖'
      case 'practice': return '💪'
      case 'review': return '🔄'
      case 'quiz': return '❓'
      case 'flashcards': return '🃏'
      default: return '📚'
    }
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="AI Study Planner" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">AI-Powered Study Planner</h1>
              <p className="text-gray-400">Intelligent study scheduling and personalized learning optimization</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'schedule', label: 'Daily Schedule' },
                { id: 'optimization', label: 'Session Optimizer' },
                { id: 'paths', label: 'Learning Paths' },
                { id: 'analytics', label: 'Analytics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Study Plan Creation */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">📚 Create Personalized Study Plan</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Available Study Hours Per Day
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={planSettings.available_hours_per_day}
                        onChange={(e) => setPlanSettings({
                          ...planSettings,
                          available_hours_per_day: parseFloat(e.target.value)
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Learning Style
                      </label>
                      <select
                        value={planSettings.learning_style}
                        onChange={(e) => setPlanSettings({
                          ...planSettings,
                          learning_style: e.target.value
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="visual">Visual Learner</option>
                        <option value="auditory">Auditory Learner</option>
                        <option value="kinesthetic">Kinesthetic Learner</option>
                        <option value="balanced">Balanced Approach</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={createStudyPlan}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Creating Plan...' : '🧠 Generate AI Study Plan'}
                  </button>
                </div>

                {/* Study Plan Results */}
                {studyPlan && (
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">📋 Your Personalized Study Plan</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">
                          {Math.round(studyPlan.success_probability * 100)}%
                        </div>
                        <div className="text-sm text-gray-300">Success Probability</div>
                      </div>
                      
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">
                          {studyPlan.analysis?.total_estimated_hours || 40}h
                        </div>
                        <div className="text-sm text-gray-300">Total Study Hours</div>
                      </div>
                      
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">
                          {new Date(studyPlan.estimated_completion).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-300">Est. Completion</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">🎯 Priority Goals</h4>
                        <div className="space-y-2">
                          {studyPlan.analysis?.priority_goals?.slice(0, 3).map((goal: any, index: number) => (
                            <div key={index} className="bg-gray-700 p-3 rounded-lg">
                              <div className="text-white font-medium">{goal.title || goal}</div>
                              {goal.description && (
                                <div className="text-gray-400 text-sm">{goal.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-white mb-2">💡 Key Insights</h4>
                        <div className="space-y-2">
                          {studyPlan.analysis?.key_insights?.map((insight: string, index: number) => (
                            <div key={index} className="text-gray-300 text-sm flex items-start">
                              <span className="text-yellow-400 mr-2">•</span>
                              {insight}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Daily Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">📅 Today's Study Schedule</h2>
                    <button
                      onClick={loadDailySchedule}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      🔄 Refresh Schedule
                    </button>
                  </div>

                  <div className="space-y-4">
                    {dailySchedule.map((session) => (
                      <div key={session.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getTypeIcon(session.type)}</span>
                            <div>
                              <h3 className="font-medium text-white">{session.subject}</h3>
                              <p className="text-sm text-gray-400">{session.time} • {session.duration_minutes} min</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(session.difficulty)}`}>
                              {session.difficulty}
                            </span>
                            <div className="text-xs text-gray-400">
                              Energy: {session.energy_requirement}/10
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-300">
                          <strong>Topics:</strong> {session.topics.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Session Optimizer Tab */}
            {activeTab === 'optimization' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-6">⚡ Real-Time Session Optimizer</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Energy Level: {currentEnergy}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={currentEnergy}
                        onChange={(e) => setCurrentEnergy(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Available Time (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="240"
                        step="5"
                        value={availableTime}
                        onChange={(e) => setAvailableTime(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={optimizeSession}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-6"
                  >
                    {loading ? 'Optimizing...' : '🎯 Optimize My Session'}
                  </button>

                  {sessionOptimization && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="font-medium text-white mb-4">📊 Optimization Results</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-400">Recommended Activity</div>
                          <div className="text-white font-medium">{sessionOptimization.recommended_activity}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-400">Target Difficulty</div>
                          <div className="text-white font-medium">{sessionOptimization.target_difficulty}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Session Structure</div>
                          <div className="flex flex-wrap gap-2">
                            {sessionOptimization.session_structure?.map((step: string, index: number) => (
                              <span key={index} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                                {step}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-400 mb-1">Focus Techniques</div>
                          <div className="text-gray-300 text-sm">
                            {sessionOptimization.focus_techniques?.join(' • ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Learning Paths Tab */}
            {activeTab === 'paths' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">🛤️ Personalized Learning Paths</h2>
                    <button
                      onClick={loadLearningPaths}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      🔄 Refresh Paths
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {learningPaths.map((path, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-white">{path.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(path.difficulty)}`}>
                            {path.difficulty}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3">{path.description}</p>
                        
                        <div className="space-y-2 mb-3">
                          <div className="text-sm text-gray-400">Learning Steps:</div>
                          {path.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-center text-sm text-gray-300">
                              <span className="text-blue-400 mr-2">{stepIndex + 1}.</span>
                              {step}
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          Estimated: {path.estimated_weeks} weeks
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-6">📊 Study Analytics</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-700 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">127</div>
                      <div className="text-sm text-gray-300">Total Study Hours</div>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">85%</div>
                      <div className="text-sm text-gray-300">Goal Completion</div>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-2">7.8</div>
                      <div className="text-sm text-gray-300">Avg. Performance</div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-4">📈 Recent Insights</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <span className="text-green-400">✓</span>
                        <div className="text-gray-300">You're maintaining consistent study habits this week</div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-yellow-400">⚠</span>
                        <div className="text-gray-300">Consider more practice sessions for complex topics</div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-blue-400">💡</span>
                        <div className="text-gray-300">Your peak learning time is 2-4 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}