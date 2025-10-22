'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

const scheduleData = []

const latestGrades = []

export default function Overview() {
  const [selectedDate, setSelectedDate] = useState("May 01 - May 21, 2023")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getStatusColor = (status: string) => {
    if (status === "Signed up") return "text-green-600"
    if (status === "Signs up pending...") return "text-orange-600"
    return "text-gray-600"
  }

  // Simple progress calculation from uploaded documents
  const [documentStats, setDocumentStats] = useState({
    totalDocuments: 0,
    processedDocuments: 0,
    totalQuizzes: 0,
    averageScore: 0
  })
  
  const [learningProgress, setLearningProgress] = useState<any>(null)
  const [smartRecommendations, setSmartRecommendations] = useState<any>(null)

  // Load study progress data
  useEffect(() => {
    loadStudyProgress()
  }, [])

  const loadStudyProgress = async () => {
    try {
      // Get real learning progress from backend
      const progressResponse = await fetch('http://localhost:8000/api/learning-progress')
      const progressData = await progressResponse.json()
      
      // Get smart recommendations
      const recommendationsResponse = await fetch('http://localhost:8000/api/smart-recommendations')
      const recommendationsData = await recommendationsResponse.json()
      
      setLearningProgress(progressData)
      setSmartRecommendations(recommendationsData)
      setDocumentStats({
        totalDocuments: progressData.documents?.total || 0,
        processedDocuments: progressData.documents?.processed || 0,
        totalQuizzes: progressData.quizzes?.generated || 0,
        averageScore: progressData.performance?.average_score || 0
      })
    } catch (error) {
      console.error('Error loading study progress:', error)
      // Fallback to empty state instead of hardcoded values
      setDocumentStats({
        totalDocuments: 0,
        processedDocuments: 0,
        totalQuizzes: 0,
        averageScore: 0
      })
    }
  }

  // Create interactive calendar data
  const today = new Date()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()
  
  // Create calendar grid including previous month padding
  const calendarData: Array<{
    date: number | string, 
    events: Array<{title: string, time: string, color: string}>, 
    isEmpty: boolean
  }> = []
  
  // Add empty cells for days before the month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarData.push({ date: '', events: [], isEmpty: true })
  }
  
  // Add days of current month
  for (let date = 1; date <= daysInMonth; date++) {
    const events: Array<{title: string, time: string, color: string}> = []
    
    // Add study sessions for days with documents
    if (documentStats.totalDocuments > 0) {
      // Add study sessions on weekdays
      const dayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date).getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        if (date % 3 === 0) {
          events.push({
            title: "Study Session",
            time: "2:00 PM",
            color: "bg-blue-200"
          })
        }
        if (date % 5 === 0 && documentStats.totalQuizzes > 0) {
          events.push({
            title: "Quiz Review",
            time: "4:00 PM", 
            color: "bg-green-200"
          })
        }
      }
    }
    
    calendarData.push({ date, events, isEmpty: false })
  }
  
  // Fill remaining cells to complete the grid (42 cells total for 6 weeks)
  while (calendarData.length < 42) {
    calendarData.push({ date: '', events: [], isEmpty: true })
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Sidebar />
      <TopBar />
      
      <main className="md:pl-64 pt-16 h-full overflow-auto">
        <div className="w-full px-8 py-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-6">

              {/* Study Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl mb-3">📚</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{documentStats.totalDocuments}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Documents Uploaded</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl mb-3">✅</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{documentStats.processedDocuments}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Documents Processed</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl mb-3">❓</div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{documentStats.totalQuizzes}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Quizzes Generated</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl mb-3">🎯</div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-500 mb-1">{documentStats.averageScore}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Average Score</div>
                </div>
              </div>

              {/* Smart AI Recommendations */}
              {smartRecommendations?.recommendations?.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">🧠 Smart Study Recommendations</h2>
                    <div className="text-sm text-indigo-100 bg-white/20 px-3 py-1 rounded-full">
                      AI Confidence: {smartRecommendations.personalization_score}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {smartRecommendations.recommendations.slice(0, 4).map((rec: any, index: number) => (
                      <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{rec.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{rec.title}</div>
                            <div className="text-xs text-indigo-100 mb-2">{rec.description}</div>
                            <div className="text-xs text-indigo-200">
                              ⏱ {rec.estimated_time} • Priority: {rec.priority}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => window.location.href = '/insights'}
                      className="text-indigo-100 hover:text-white text-sm underline"
                    >
                      View all recommendations →
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Calendar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📅 Study Calendar</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        const prevMonth = new Date(currentMonth)
                        prevMonth.setMonth(currentMonth.getMonth() - 1)
                        setCurrentMonth(prevMonth)
                      }}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      ←
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[140px] text-center">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={() => {
                        const nextMonth = new Date(currentMonth)
                        nextMonth.setMonth(currentMonth.getMonth() + 1)
                        setCurrentMonth(nextMonth)
                      }}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {calendarData.map((day, index) => {
                    const isToday = !day.isEmpty && 
                      currentMonth.getMonth() === today.getMonth() && 
                      currentMonth.getFullYear() === today.getFullYear() && 
                      day.date === today.getDate()
                    
                    return (
                      <div 
                        key={index}
                        className={`
                          relative p-2 h-16 border rounded cursor-pointer transition-colors
                          ${day.isEmpty ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800' : 'border-gray-100 dark:border-gray-700'}
                          ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                        `}
                      >
                        {!day.isEmpty && (
                          <>
                            <span className={`text-sm ${isToday ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {day.date}
                            </span>
                            {day.events.length > 0 && (
                              <div className="absolute bottom-1 left-1 right-1">
                                {day.events.slice(0, 2).map((event, eventIndex) => (
                                  <div 
                                    key={eventIndex}
                                    className={`text-xs px-1 py-0.5 rounded mb-0.5 ${event.color} text-gray-700 dark:text-gray-300 truncate`}
                                    title={`${event.title} - ${event.time}`}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {day.events.length > 2 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    +{day.events.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-blue-200 dark:bg-blue-600 rounded"></div>
                      <span>Study Sessions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-200 dark:bg-green-600 rounded"></div>
                      <span>Completed</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/schedule'}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    View Schedule →
                  </button>
                </div>
              </div>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2">📚 Study Materials</h3>
                  <p className="text-blue-100 text-sm mb-4">Upload and manage your documents</p>
                  <button
                    onClick={() => window.location.href = '/materials'}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
                  >
                    Upload Docs
                  </button>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2">❓ Generate Quiz</h3>
                  <p className="text-green-100 text-sm mb-4">Create quizzes from your documents</p>
                  <button
                    onClick={() => window.location.href = '/quizzes'}
                    className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors shadow-md"
                  >
                    Create Quiz
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2">🤖 AI Assistant</h3>
                  <p className="text-purple-100 text-sm mb-4">Get help with your studies</p>
                  <button
                    onClick={() => window.location.href = '/ai-assistant'}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors shadow-md"
                  >
                    Chat with AI
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 Recent Activity</h2>
                
                {documentStats.totalDocuments === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Start by uploading your first document</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">📚</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Document Processing</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {documentStats.processedDocuments} of {documentStats.totalDocuments} documents processed
                        </p>
                      </div>
                    </div>

                    {documentStats.totalQuizzes > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">❓</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Quiz Generation</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {documentStats.totalQuizzes} quizzes created from your materials
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Recent Quiz Results */}
                    {learningProgress?.activity?.recent_results?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recent Quiz Results</h4>
                        {learningProgress.activity.recent_results.map((result: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              result.score >= 80 ? 'bg-green-500 dark:bg-green-600' : 
                              result.score >= 60 ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-red-500 dark:bg-red-600'
                            }`}>
                              <span className="text-white text-sm font-bold">
                                {result.score >= 80 ? '🎯' : result.score >= 60 ? '📈' : '📚'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-gray-100">Quiz Score: {result.score}%</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {result.correct_answers}/{result.total_questions} correct • 
                                {new Date(result.submitted_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {learningProgress?.performance?.total_attempts === 0 && documentStats.totalQuizzes > 0 && (
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-500 dark:bg-yellow-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">⏳</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Ready for Quizzes</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Take your first quiz to start tracking progress
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">🤖</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">AI Assistant Ready</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Chat with AI for personalized study help
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Study Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-base">📊 Study Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Documents</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {documentStats.processedDocuments}/{documentStats.totalDocuments}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${learningProgress?.documents?.processing_rate || 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {learningProgress?.documents?.processing_rate ? 
                        `${learningProgress.documents.processing_rate.toFixed(0)}% processed` : 
                        'Upload documents to begin'}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Quiz Completion</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {learningProgress?.quizzes?.attempted || 0}/{learningProgress?.quizzes?.generated || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 dark:bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${learningProgress?.quizzes?.completion_rate || 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {learningProgress?.quizzes?.completion_rate ? 
                        `${learningProgress.quizzes.completion_rate.toFixed(0)}% completed` : 
                        'Generate quizzes to track progress'}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{documentStats.averageScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          documentStats.averageScore >= 80 ? 'bg-green-500 dark:bg-green-600' : 
                          documentStats.averageScore >= 60 ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-red-500 dark:bg-red-600'
                        }`}
                        style={{ width: `${documentStats.averageScore}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {learningProgress?.performance?.total_attempts ? 
                        `Based on ${learningProgress.performance.total_attempts} quiz attempts` : 
                        'Take quizzes to see performance'}
                    </div>
                  </div>
                  
                  {/* Study Activity */}
                  {learningProgress?.activity?.days_active > 0 && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Study Activity</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {learningProgress.activity.days_active} days
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Active learning streak
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Study Assistant */}
              <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-xl p-5 text-white shadow-lg">
                <h3 className="font-semibold mb-2 text-base">🤖 AI Study Assistant</h3>
                <p className="text-sm text-green-100 mb-4">Get personalized help with your coursework</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => window.location.href = '/quizzes'}
                    className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white py-2.5 px-3 rounded-lg text-sm hover:bg-opacity-30 transition-all duration-200 font-medium"
                  >
                    📝 Generate Quiz
                  </button>
                  <button 
                    onClick={() => window.location.href = '/ai-assistant'}
                    className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white py-2.5 px-3 rounded-lg text-sm hover:bg-opacity-30 transition-all duration-200 font-medium"
                  >
                    💡 Chat with AI
                  </button>
                  <button 
                    onClick={() => window.location.href = '/materials'}
                    className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white py-2.5 px-3 rounded-lg text-sm hover:bg-opacity-30 transition-all duration-200 font-medium"
                  >
                    📚 Upload Materials
                  </button>
                </div>
              </div>

              {/* Learning Recommendations */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-base">💡 Recommendations</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  {learningProgress?.next_steps?.length > 0 ? (
                    learningProgress.next_steps.map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 dark:text-blue-400">💡</span>
                        <span>{recommendation}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-500 dark:text-blue-400">📚</span>
                        <span>Upload your study materials to get started</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500 dark:text-green-400">❓</span>
                        <span>Generate quizzes to test your knowledge</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-purple-500 dark:text-purple-400">🤖</span>
                        <span>Ask AI for help with difficult concepts</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Performance Badge */}
                {learningProgress?.performance?.grade_letter && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Grade</span>
                      <div className={`
                        px-2 py-1 rounded text-sm font-bold
                        ${learningProgress.performance.grade_letter === 'A' ? 'bg-green-100 text-green-800' :
                          learningProgress.performance.grade_letter === 'B' ? 'bg-blue-100 text-blue-800' :
                          learningProgress.performance.grade_letter === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {learningProgress.performance.grade_letter}
                      </div>
                    </div>
                    {learningProgress.performance.improvement_trend !== 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {learningProgress.performance.improvement_trend > 0 ? '📈' : '📉'} 
                        {Math.abs(learningProgress.performance.improvement_trend).toFixed(1)}% trend
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  )
}