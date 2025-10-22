'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

interface LearningProgress {
  documents: { total: number; processed: number; processing_rate: number }
  quizzes: { generated: number; attempted: number; completion_rate: number }
  performance: { average_score: number; total_attempts: number; improvement_trend: number; grade_letter: string }
  activity: { days_active: number; recent_results: any[] }
  next_steps: string[]
}

interface QuizResult {
  id: string
  score: number
  total_questions: number
  correct_answers: number
  submitted_at: string
  time_taken: number
}

interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  earned: boolean
  date: string
  progress: number
}

export default function ProgressPage() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week')
  const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    try {
      setLoading(true)
      
      // Load learning progress
      const progressResponse = await fetch('http://localhost:8000/api/learning-progress')
      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        setLearningProgress(progressData)
      }

      // Load quiz results for detailed analysis
      const resultsResponse = await fetch('http://localhost:8000/api/quiz-results')
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json()
        setQuizResults(resultsData.results || [])
      }

      // Load documents for topic analysis
      const docsResponse = await fetch('http://localhost:8000/api/documents')
      if (docsResponse.ok) {
        const docsData = await docsResponse.json()
        setUploadedDocuments(docsData.documents || [])
      }

    } catch (error) {
      console.error('Error loading progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate timeframe-specific data from real quiz results
  const getTimeframeData = () => {
    if (!quizResults.length || !learningProgress) {
      return {
        studyTime: 0,
        cardsReviewed: 0,
        quizzesTaken: 0,
        averageScore: 0,
        streak: 0,
        improvement: 0
      }
    }

    const now = new Date()
    let cutoffDate: Date

    switch (timeframe) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    const filteredResults = quizResults.filter(result => 
      new Date(result.submitted_at) >= cutoffDate
    )

    const totalScore = filteredResults.reduce((sum, result) => sum + result.score, 0)
    const averageScore = filteredResults.length > 0 ? totalScore / filteredResults.length : 0
    
    // Estimate study time based on quiz time and questions
    const estimatedStudyTime = filteredResults.reduce((sum, result) => 
      sum + (result.time_taken / 60) + (result.total_questions * 2), 0
    ) / 60 // Convert to hours

    return {
      studyTime: Math.round(estimatedStudyTime * 10) / 10,
      cardsReviewed: filteredResults.reduce((sum, result) => sum + result.total_questions, 0),
      quizzesTaken: filteredResults.length,
      averageScore: Math.round(averageScore),
      streak: learningProgress.activity.days_active,
      improvement: Math.round(learningProgress.performance.improvement_trend)
    }
  }

  const currentData = getTimeframeData()

  // Generate learning topics from uploaded documents
  const getLearningTopics = () => {
    if (!uploadedDocuments.length) return []

    return uploadedDocuments.slice(0, 5).map((doc, index) => {
      const relatedQuizzes = quizResults.filter(result => 
        result.id.includes(doc.id.slice(0, 8)) // Rough matching
      )
      
      const avgScore = relatedQuizzes.length > 0 
        ? relatedQuizzes.reduce((sum, r) => sum + r.score, 0) / relatedQuizzes.length
        : 0

      const progress = doc.processed ? Math.min(avgScore + 20, 100) : avgScore
      
      return {
        topic: doc.filename.replace(/\.[^/.]+$/, ""),
        progress: Math.round(progress),
        timeSpent: relatedQuizzes.reduce((sum, r) => sum + r.time_taken, 0) / 60,
        lastStudied: relatedQuizzes.length > 0 
          ? getRelativeTime(relatedQuizzes[0].submitted_at)
          : "Not started",
        strength: progress >= 80 ? "high" : progress >= 60 ? "medium" : "low",
        materials: 1,
        nextReview: getNextReviewTime(progress)
      }
    })
  }

  const getRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return "Just now"
  }

  const getNextReviewTime = (progress: number) => {
    if (progress < 40) return "Now"
    if (progress < 70) return "Tomorrow"
    if (progress < 85) return "In 3 days"
    return "In 1 week"
  }

  const learningTopics = getLearningTopics()

  // Generate study streak from quiz activity
  const getStudyStreak = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const now = new Date()
    const weekStart = new Date(now.getTime() - (now.getDay() + 6) % 7 * 24 * 60 * 60 * 1000)
    
    return days.map((day, index) => {
      const dayDate = new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000)
      const dayResults = quizResults.filter(result => {
        const resultDate = new Date(result.submitted_at)
        return resultDate.toDateString() === dayDate.toDateString()
      })
      
      const hours = dayResults.reduce((sum, result) => 
        sum + (result.time_taken / 3600) + (result.total_questions * 0.05), 0
      )
      
      return {
        day,
        hours: Math.round(hours * 10) / 10,
        completed: hours >= 1 // 1 hour minimum goal
      }
    })
  }

  const studyStreak = getStudyStreak()

  // Generate achievements based on real progress
  const getAchievements = (): Achievement[] => {
    if (!learningProgress) return []

    const achievements: Achievement[] = []

    // Study Streak Achievement
    achievements.push({
      id: 1,
      title: "Study Streak",
      description: `${learningProgress.activity.days_active} days in a row`,
      icon: "🔥",
      earned: learningProgress.activity.days_active >= 5,
      date: learningProgress.activity.days_active >= 5 ? "Today" : "",
      progress: Math.min((learningProgress.activity.days_active / 5) * 100, 100)
    })

    // Quiz Master Achievement  
    const highScores = quizResults.filter(r => r.score >= 90).length
    achievements.push({
      id: 2,
      title: "Quiz Master",
      description: "90%+ on 5 quizzes",
      icon: "🏆",
      earned: highScores >= 5,
      date: highScores >= 5 ? "Recently" : "",
      progress: Math.min((highScores / 5) * 100, 100)
    })

    // Speed Learner Achievement
    const totalQuestions = quizResults.reduce((sum, r) => sum + r.total_questions, 0)
    achievements.push({
      id: 3,
      title: "Speed Learner",
      description: "100 questions answered",
      icon: "⚡",
      earned: totalQuestions >= 100,
      date: totalQuestions >= 100 ? "Recently" : "",
      progress: Math.min((totalQuestions / 100) * 100, 100)
    })

    // Knowledge Explorer Achievement
    achievements.push({
      id: 4,
      title: "Knowledge Explorer",
      description: "Study 5 different topics",
      icon: "🧭",
      earned: uploadedDocuments.length >= 5,
      date: uploadedDocuments.length >= 5 ? "Recently" : "",
      progress: Math.min((uploadedDocuments.length / 5) * 100, 100)
    })

    return achievements
  }

  const achievements = getAchievements()

  const getStrengthColor = (strength: string) => {
    const colors = {
      high: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-red-600 bg-red-100'
    }
    return colors[strength as keyof typeof colors] || colors.medium
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Sidebar />
      <TopBar />
      
      <main className="md:pl-64 pt-16 h-full overflow-auto">
        <div className="w-full px-8 py-8">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your study journey and improve with AI insights
            </p>
            
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={loadProgressData}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm disabled:opacity-50 shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                <span>{loading ? "⟳" : "🔄"}</span>
                <span>Refresh</span>
              </button>
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Loading your progress analytics...</span>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="ai-card text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-2xl font-bold text-blue-600">{currentData.studyTime}h</div>
              <div className="text-sm text-gray-600">Study Time</div>
            </div>
            
            <div className="ai-card text-center">
              <div className="text-3xl mb-2">🧠</div>
              <div className="text-2xl font-bold text-green-600">{currentData.cardsReviewed}</div>
              <div className="text-sm text-gray-600">Cards Reviewed</div>
            </div>
            
            <div className="ai-card text-center">
              <div className="text-3xl mb-2">❓</div>
              <div className="text-2xl font-bold text-purple-600">{currentData.quizzesTaken}</div>
              <div className="text-sm text-gray-600">Quizzes Taken</div>
            </div>
            
            <div className="ai-card text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-orange-600">{currentData.averageScore}%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
            
            <div className="ai-card text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-red-600">{currentData.streak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            
            <div className="ai-card text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-indigo-600">+{currentData.improvement}%</div>
              <div className="text-sm text-gray-600">Improvement</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Study Streak Chart */}
            <div className="lg:col-span-2">
              <div className="ai-card">
                <div className="ai-card-header">
                  <h3 className="ai-card-title">📅 Weekly Study Pattern</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end h-32 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {studyStreak.map((day, index) => (
                      <div key={index} className="flex flex-col items-center space-y-2">
                        <div 
                          className={`w-8 rounded-t ${day.completed ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                          style={{ height: `${Math.max(day.hours * 20, 8)}px` }}
                        ></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{day.day}</span>
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{day.hours}h</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🎯 Goal: 2 hours per day • 
                      <span className="text-green-600 dark:text-green-400 font-medium ml-1">5/7 days completed</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="ai-card">
              <div className="ai-card-header">
                <h3 className="ai-card-title">🏆 Achievements</h3>
              </div>
              
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-3 rounded-lg border ${
                    achievement.earned ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        {achievement.earned ? (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">Earned {achievement.date}</span>
                        ) : (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 dark:bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${achievement.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{achievement.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Topics Progress */}
          <div className="ai-card mt-8">
            <div className="ai-card-header">
              <h3 className="ai-card-title">📚 Topic Mastery</h3>
            </div>
            
            <div className="space-y-4">
              {learningTopics.map((topic, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{topic.topic}</h4>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStrengthColor(topic.strength)}`}>
                        {topic.strength} strength
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{topic.progress}%</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(topic.progress)}`}
                      style={{ width: `${topic.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Time:</span> {topic.timeSpent}h
                    </div>
                    <div>
                      <span className="font-medium">Materials:</span> {topic.materials}
                    </div>
                    <div>
                      <span className="font-medium">Last:</span> {topic.lastStudied}
                    </div>
                    <div>
                      <span className="font-medium">Next:</span> 
                      <span className={topic.nextReview === 'Overdue' ? 'text-red-600 ml-1' : 'ml-1'}>
                        {topic.nextReview}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="ai-card ai-gradient-success text-white mt-8">
            <h3 className="text-lg font-semibold mb-4">🤖 AI Learning Insights</h3>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="ml-2 text-green-100">Analyzing your progress...</span>
              </div>
            ) : learningProgress ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Performance Trend</div>
                  <div className="text-xs text-green-100">
                    {learningProgress.performance.improvement_trend > 0 
                      ? `Improving by ${learningProgress.performance.improvement_trend}%`
                      : learningProgress.performance.improvement_trend < 0
                      ? `Declining by ${Math.abs(learningProgress.performance.improvement_trend)}%`
                      : "Stable performance"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Recommendation</div>
                  <div className="text-xs text-green-100">
                    {learningProgress.next_steps[0] || "Keep up the great work!"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Study Focus</div>
                  <div className="text-xs text-green-100">
                    {learningProgress.performance.average_score < 70 
                      ? "Review fundamentals more thoroughly"
                      : learningProgress.performance.average_score < 85
                      ? "Practice more challenging questions"
                      : "Try advanced topics"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-green-100">Upload documents and take quizzes to get AI insights</div>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}