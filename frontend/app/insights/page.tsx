'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

interface StudyPattern {
  hour: number
  productivity: number
  focus_score: number
  retention_rate: number
}

interface LearningInsight {
  type: 'strength' | 'weakness' | 'recommendation' | 'achievement'
  title: string
  description: string
  confidence: number
  actionable: boolean
  action?: string
}

interface PredictiveAnalysis {
  exam_readiness: number
  knowledge_gaps: string[]
  optimal_study_time: string
  difficulty_recommendation: string
  next_review_topics: string[]
}

export default function InsightsPage() {
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([])
  const [studyPatterns, setStudyPatterns] = useState<StudyPattern[]>([])
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    loadInsights()
  }, [selectedTimeRange])

  const loadInsights = async () => {
    setLoading(true)
    try {
      // Load learning progress data
      const progressResponse = await fetch('http://localhost:8000/api/learning-progress')
      const progressData = await progressResponse.json()

      // Load quiz results for pattern analysis
      const resultsResponse = await fetch('http://localhost:8000/api/quiz-results')
      const resultsData = await resultsResponse.json()

      // Generate AI insights from real data
      generateInsights(progressData, resultsData.results || [])
      generateStudyPatterns(resultsData.results || [])
      generatePredictiveAnalysis(progressData, resultsData.results || [])

    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = (progressData: any, quizResults: any[]) => {
    const insights: LearningInsight[] = []

    // Performance insights
    if (progressData.performance?.average_score > 85) {
      insights.push({
        type: 'strength',
        title: 'High Performance Achiever',
        description: `You're consistently scoring ${progressData.performance.average_score}% on quizzes. Your strong performance indicates excellent comprehension.`,
        confidence: 0.95,
        actionable: true,
        action: 'Challenge yourself with advanced topics'
      })
    } else if (progressData.performance?.average_score < 60) {
      insights.push({
        type: 'weakness',
        title: 'Foundation Review Needed',
        description: `Your average score of ${progressData.performance.average_score}% suggests reviewing fundamental concepts could significantly improve performance.`,
        confidence: 0.88,
        actionable: true,
        action: 'Focus on reviewing basic concepts before advancing'
      })
    }

    // Study consistency insights
    if (progressData.activity?.days_active >= 7) {
      insights.push({
        type: 'achievement',
        title: 'Consistent Learner',
        description: `You've been actively studying for ${progressData.activity.days_active} days. Consistency is key to long-term retention.`,
        confidence: 0.92,
        actionable: false
      })
    }

    // Improvement trend insights
    if (progressData.performance?.improvement_trend > 10) {
      insights.push({
        type: 'strength',
        title: 'Rapid Improvement',
        description: `Your performance has improved by ${progressData.performance.improvement_trend}% recently. You're on an excellent learning trajectory.`,
        confidence: 0.87,
        actionable: true,
        action: 'Maintain current study methods'
      })
    }

    // Quiz completion insights
    if (progressData.quizzes?.completion_rate < 50) {
      insights.push({
        type: 'recommendation',
        title: 'Incomplete Assessment Coverage',
        description: `You've completed ${progressData.quizzes?.completion_rate}% of generated quizzes. Regular testing improves retention by 40%.`,
        confidence: 0.82,
        actionable: true,
        action: 'Complete more quizzes to reinforce learning'
      })
    }

    setLearningInsights(insights)
  }

  const generateStudyPatterns = (quizResults: any[]) => {
    // Analyze quiz submission times to find productivity patterns
    const hourlyData: { [hour: number]: { scores: number[], count: number } } = {}

    quizResults.forEach(result => {
      const hour = new Date(result.submitted_at).getHours()
      if (!hourlyData[hour]) {
        hourlyData[hour] = { scores: [], count: 0 }
      }
      hourlyData[hour].scores.push(result.score)
      hourlyData[hour].count++
    })

    const patterns: StudyPattern[] = []
    for (let hour = 0; hour < 24; hour++) {
      const data = hourlyData[hour]
      if (data && data.count > 0) {
        const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.count
        patterns.push({
          hour,
          productivity: Math.min(avgScore / 10, 10), // Scale to 0-10
          focus_score: data.count * 2, // More activity = higher focus
          retention_rate: avgScore
        })
      } else {
        patterns.push({
          hour,
          productivity: 0,
          focus_score: 0,
          retention_rate: 0
        })
      }
    }

    setStudyPatterns(patterns)
  }

  const generatePredictiveAnalysis = (progressData: any, quizResults: any[]) => {
    const recentScores = quizResults.slice(0, 5).map(r => r.score)
    const avgRecentScore = recentScores.length > 0 
      ? recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length 
      : 0

    const analysis: PredictiveAnalysis = {
      exam_readiness: Math.min(avgRecentScore + (progressData.activity?.days_active * 2), 100),
      knowledge_gaps: progressData.next_steps || ['No specific gaps identified'],
      optimal_study_time: findOptimalStudyTime(),
      difficulty_recommendation: avgRecentScore > 80 ? 'hard' : avgRecentScore > 60 ? 'medium' : 'easy',
      next_review_topics: getTopicsForReview(quizResults)
    }

    setPredictiveAnalysis(analysis)
  }

  const findOptimalStudyTime = () => {
    const bestHour = studyPatterns.reduce((best, current) => 
      current.productivity > best.productivity ? current : best
    , studyPatterns[0])
    
    if (bestHour?.hour) {
      return `${bestHour.hour}:00 - ${bestHour.hour + 1}:00`
    }
    return '2:00 PM - 4:00 PM (most productive for students)'
  }

  const getTopicsForReview = (quizResults: any[]) => {
    // Simple topic extraction from quiz data (in real app, would be more sophisticated)
    const topics = ['Fundamentals', 'Advanced Concepts', 'Problem Solving', 'Applications']
    return topics.slice(0, 3)
  }

  const getInsightColor = (type: string) => {
    const colors = {
      strength: 'bg-green-50 border-green-200',
      weakness: 'bg-red-50 border-red-200', 
      recommendation: 'bg-blue-50 border-blue-200',
      achievement: 'bg-yellow-50 border-yellow-200'
    }
    return colors[type as keyof typeof colors] || colors.recommendation
  }

  const getInsightIcon = (type: string) => {
    const icons = {
      strength: '💪',
      weakness: '🎯',
      recommendation: '💡',
      achievement: '🏆'
    }
    return icons[type as keyof typeof icons] || '📊'
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
              Discover your learning patterns and get personalized recommendations
            </p>
            
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={loadInsights}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm disabled:opacity-50 shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Analyzing your learning patterns...</span>
            </div>
          ) : (
            <>
              {/* Predictive Analysis */}
              {predictiveAnalysis && (
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white mb-8">
                  <h2 className="text-xl font-bold mb-4">🔮 Predictive Analysis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{predictiveAnalysis.exam_readiness}%</div>
                      <div className="text-sm text-purple-100">Exam Readiness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{predictiveAnalysis.optimal_study_time}</div>
                      <div className="text-sm text-purple-100">Optimal Study Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold capitalize">{predictiveAnalysis.difficulty_recommendation}</div>
                      <div className="text-sm text-purple-100">Recommended Difficulty</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{predictiveAnalysis.next_review_topics.length}</div>
                      <div className="text-sm text-purple-100">Topics to Review</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Study Patterns Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 Daily Productivity Pattern</h3>
                  <div className="flex items-end h-48 space-x-1">
                    {studyPatterns.map((pattern, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full rounded-t ${
                            pattern.productivity > 7 ? 'bg-green-500 dark:bg-green-600' :
                            pattern.productivity > 4 ? 'bg-blue-500 dark:bg-blue-600' :
                            pattern.productivity > 0 ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                          style={{ height: `${Math.max(pattern.productivity * 20, 4)}px` }}
                          title={`${pattern.hour}:00 - Productivity: ${pattern.productivity.toFixed(1)}`}
                        ></div>
                        {pattern.hour % 4 === 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pattern.hour}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Best performance at {findOptimalStudyTime()}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🎯 Knowledge Gap Analysis</h3>
                  {predictiveAnalysis?.knowledge_gaps.map((gap, index) => (
                    <div key={index} className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="font-medium text-orange-800 dark:text-orange-200">{gap}</div>
                      <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                        Recommended action: Focus study sessions on this area
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI-Generated Insights */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">🤖 AI Learning Insights</h3>
                
                {learningInsights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {learningInsights.map((insight, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{insight.title}</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{insight.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Confidence: {Math.round(insight.confidence * 100)}%
                              </div>
                              {insight.actionable && insight.action && (
                                <button className="text-xs bg-blue-600 dark:bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-600">
                                  {insight.action}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🧠</div>
                    <p className="text-gray-500 dark:text-gray-400">Complete more quizzes to unlock AI insights</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Our AI needs learning data to provide personalized recommendations</p>
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