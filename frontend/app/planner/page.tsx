'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

const API_BASE_URL = 'http://localhost:8000'

interface StudyGoal {
  id?: string
  title: string
  target_date: string
  priority: string
  subject?: string
  description?: string
}

interface StudyPlan {
  id: string
  week_start: string
  week_end: string
  daily_tasks: Record<string, any>
  goals: StudyGoal[]
  estimated_hours: number
  completion_rate: number
}

interface KnowledgeGap {
  id: string
  subject: string
  topic: string
  severity: string
  accuracy: number
  recommended_actions: string[]
  resources: Array<{type: string, title: string}>
}

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: number
  topic: string
  next_review: string
  review_count: number
}

export default function StudyPlannerPage() {
  const [activeTab, setActiveTab] = useState<'planner' | 'flashcards' | 'gaps'>('planner')
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null)
  const [goals, setGoals] = useState<StudyGoal[]>([])
  const [newGoal, setNewGoal] = useState<StudyGoal>({
    title: '',
    target_date: '',
    priority: 'medium',
    subject: '',
    description: ''
  })
  const [availableHours, setAvailableHours] = useState(3)
  const [loading, setLoading] = useState(false)
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGap[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    loadStudyPlans()
    loadKnowledgeGaps()
    loadFlashcards()
    loadDocuments()
  }, [])

  const loadStudyPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/study-plans?active_only=true`)
      if (response.ok) {
        const data = await response.json()
        if (data.plans && data.plans.length > 0) {
          setStudyPlan(data.plans[0])
        }
      }
    } catch (error) {
      console.error('Failed to load study plans:', error)
    }
  }

  const loadKnowledgeGaps = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/knowledge-gaps`)
      if (response.ok) {
        const data = await response.json()
        setKnowledgeGaps(data.gaps || [])
      }
    } catch (error) {
      console.error('Failed to load knowledge gaps:', error)
    }
  }

  const loadFlashcards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards/due`)
      if (response.ok) {
        const data = await response.json()
        setFlashcards(data.flashcards || [])
        if (data.flashcards && data.flashcards.length > 0) {
          setCurrentFlashcard(data.flashcards[0])
        }
      }
    } catch (error) {
      console.error('Failed to load flashcards:', error)
    }
  }

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  const addGoal = () => {
    if (newGoal.title && newGoal.target_date) {
      setGoals([...goals, { ...newGoal, id: `goal_${Date.now()}` }])
      setNewGoal({
        title: '',
        target_date: '',
        priority: 'medium',
        subject: '',
        description: ''
      })
    }
  }

  const generateStudyPlan = async () => {
    if (goals.length === 0) {
      alert('Please add at least one goal first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/study-plans/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals: goals,
          available_hours_per_day: availableHours
        })
      })

      if (response.ok) {
        const data = await response.json()
        setStudyPlan(data.plan)
        alert('✨ AI-powered study plan generated successfully!')
      } else {
        alert('Failed to generate study plan')
      }
    } catch (error) {
      console.error('Error generating study plan:', error)
      alert('Failed to generate study plan')
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: string) => {
    if (!studyPlan) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/study-plans/${studyPlan.id}/task/${taskId}/complete`,
        { method: 'PUT' }
      )

      if (response.ok) {
        const data = await response.json()
        // Reload study plan
        loadStudyPlans()
        
        if (data.adjustment_needed) {
          alert(`⚠️ ${data.suggestion}`)
        } else {
          alert('✅ Task completed!')
        }
      }
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const generateFlashcards = async (documentId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId, max_cards: 20 })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✨ Generated ${data.total} flashcards!`)
        loadFlashcards()
      } else {
        alert('Failed to generate flashcards')
      }
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('Failed to generate flashcards')
    } finally {
      setLoading(false)
    }
  }

  const reviewFlashcard = async (confidence: number) => {
    if (!currentFlashcard) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/flashcards/${currentFlashcard.id}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confidence })
        }
      )

      if (response.ok) {
        // Move to next card
        const currentIndex = flashcards.findIndex(c => c.id === currentFlashcard.id)
        if (currentIndex < flashcards.length - 1) {
          setCurrentFlashcard(flashcards[currentIndex + 1])
        } else {
          setCurrentFlashcard(null)
          alert('🎉 All flashcards reviewed!')
        }
        setShowAnswer(false)
        loadFlashcards()
      }
    } catch (error) {
      console.error('Error reviewing flashcard:', error)
    }
  }

  const analyzeKnowledgeGaps = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/knowledge-gaps/analyze`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setKnowledgeGaps(data.gaps || [])
        alert(`📊 Analyzed performance. Found ${data.total} knowledge gaps.`)
      } else {
        alert('Failed to analyze knowledge gaps')
      }
    } catch (error) {
      console.error('Error analyzing knowledge gaps:', error)
      alert('Failed to analyze knowledge gaps')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Sidebar />
      <TopBar />
      
      <main className="md:pl-64 pt-16 h-full overflow-auto">
        {/* Info Bar with gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 text-white px-8 py-3 shadow-lg">
          <p className="text-sm text-purple-100 dark:text-purple-200">
            Personalized study plans, smart flashcards, and knowledge gap analysis
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex px-8">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'planner'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              📅 Study Planner
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'flashcards'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              🎴 Smart Flashcards ({flashcards.length})
            </button>
            <button
              onClick={() => setActiveTab('gaps')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'gaps'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              📊 Knowledge Gaps ({knowledgeGaps.length})
            </button>
          </div>
        </div>

        <div className="px-8 py-8">
          {/* Study Planner Tab */}
          {activeTab === 'planner' && (
            <div className="space-y-6">
              {/* Goals Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white">🎯 Your Goals</h2>
                
                {/* Add Goal Form */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Goal title (e.g., Master Calculus)"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Subject (optional)"
                      value={newGoal.subject}
                      onChange={(e) => setNewGoal({...newGoal, subject: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                    <button
                      onClick={addGoal}
                      className="bg-purple-600 dark:bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                    >
                      Add Goal
                    </button>
                  </div>
                </div>

                {/* Goals List */}
                {goals.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium dark:text-white">{goal.title}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(goal.priority)}`}>
                              {goal.priority}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {goal.subject && <span>{goal.subject} • </span>}
                            Due: {new Date(goal.target_date).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => setGoals(goals.filter(g => g.id !== goal.id))}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 ml-4"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Study Hours Input */}
                <div className="flex items-center gap-4 mb-4">
                  <label className="font-medium dark:text-white">Available study hours per day:</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={availableHours}
                    onChange={(e) => setAvailableHours(parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">hours</span>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateStudyPlan}
                  disabled={loading || goals.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                >
                  {loading ? '⏳ Generating...' : '✨ Generate AI Study Plan'}
                </button>
              </div>

              {/* Study Plan Display */}
              {studyPlan && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold dark:text-white">📚 Your Weekly Study Plan</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(studyPlan.week_start).toLocaleDateString()} - {new Date(studyPlan.week_end).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{studyPlan.completion_rate.toFixed(0)}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                    </div>
                  </div>

                  {/* Daily Tasks */}
                  <div className="space-y-4">
                    {Object.entries(studyPlan.daily_tasks).map(([day, dayData]: [string, any]) => (
                      <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-lg dark:text-white">{day}</h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {dayData.total_hours.toFixed(1)} hours • {dayData.tasks.length} tasks
                          </span>
                        </div>
                        <div className="space-y-2">
                          {dayData.tasks.map((task: any) => (
                            <div
                              key={task.id}
                              className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                                task.completed ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => completeTask(task.id)}
                                className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                              />
                              <div className="flex-1">
                                <div className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                  {task.title}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {task.subject} • {task.duration_hours} hours • {task.priority} priority
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flashcards Tab */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              {/* Generate Flashcards */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white">🎴 Generate Flashcards</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Select a document to auto-generate flashcards using AI</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => generateFlashcards(doc.id)}
                      disabled={loading}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left"
                    >
                      <div>
                        <div className="font-medium dark:text-white">{doc.filename}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generate flashcards</div>
                      </div>
                      <span className="text-2xl">📄</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flashcard Review */}
              {currentFlashcard ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-purple-200 dark:border-purple-800 p-8">
                  <div className="text-center mb-6">
                    <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-4">
                      {flashcards.findIndex(c => c.id === currentFlashcard.id) + 1} / {flashcards.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Topic: {currentFlashcard.topic} • Difficulty: {'⭐'.repeat(currentFlashcard.difficulty)}
                    </div>
                  </div>

                  <div className="min-h-[200px] flex items-center justify-center mb-6">
                    <div className="text-center">
                      <div className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                        {showAnswer ? currentFlashcard.back : currentFlashcard.front}
                      </div>
                      <button
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                      >
                        {showAnswer ? '🔄 Show Question' : '👁️ Show Answer'}
                      </button>
                    </div>
                  </div>

                  {showAnswer && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <p className="text-center text-gray-600 dark:text-gray-400 mb-4">How well did you know this?</p>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((confidence) => (
                          <button
                            key={confidence}
                            onClick={() => reviewFlashcard(confidence)}
                            className="py-3 px-4 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg font-medium transition-colors"
                          >
                            {confidence}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Not at all</span>
                        <span>Perfectly</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">No flashcards due for review!</h3>
                  <p className="text-gray-600 dark:text-gray-400">Great job! Check back later or generate new flashcards.</p>
                </div>
              )}
            </div>
          )}

          {/* Knowledge Gaps Tab */}
          {activeTab === 'gaps' && (
            <div className="space-y-6">
              {/* Analyze Button */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2 dark:text-white">📊 Knowledge Gap Analysis</h2>
                    <p className="text-gray-600 dark:text-gray-400">AI analyzes your quiz performance to identify weak areas</p>
                  </div>
                  <button
                    onClick={analyzeKnowledgeGaps}
                    disabled={loading}
                    className="bg-purple-600 dark:bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '⏳ Analyzing...' : '🔍 Analyze Now'}
                  </button>
                </div>
              </div>

              {/* Knowledge Gaps List */}
              {knowledgeGaps.length > 0 ? (
                <div className="space-y-4">
                  {knowledgeGaps.map((gap) => (
                    <div
                      key={gap.id}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 p-6 ${getSeverityColor(gap.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold dark:text-white">{gap.topic}</h3>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getSeverityColor(gap.severity)}`}>
                              {gap.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm opacity-80 dark:text-gray-300">
                            {gap.subject} • Accuracy: {gap.accuracy?.toFixed(0)}%
                          </p>
                        </div>
                        <div className="text-4xl">
                          {gap.severity === 'critical' ? '🔴' : gap.severity === 'moderate' ? '🟡' : '🔵'}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 dark:text-white">📝 Recommended Actions:</h4>
                        <ul className="space-y-1">
                          {gap.recommended_actions.map((action, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2 dark:text-gray-300">
                              <span>•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 dark:text-white">📚 Resources:</h4>
                        <div className="flex flex-wrap gap-2">
                          {gap.resources.map((resource, idx) => (
                            <div
                              key={idx}
                              className="text-sm px-3 py-1 bg-white dark:bg-gray-700 bg-opacity-50 rounded-full dark:text-gray-200"
                            >
                              {resource.type === 'video' ? '🎥' : resource.type === 'practice' ? '✍️' : '📖'} {resource.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">No knowledge gaps identified</h3>
                  <p className="text-gray-600 dark:text-gray-400">Take some quizzes to get personalized analysis!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
