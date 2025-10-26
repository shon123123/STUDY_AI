'use client'

import React, { useState, useEffect } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  ClockIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { progressService, quizService } from '../services/api'
import toast from 'react-hot-toast'

export default function Progress() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')
  const [progressData, setProgressData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [quizResults, setQuizResults] = useState<any[]>([])

  // Load progress data on component mount
  useEffect(() => {
    loadProgressData()
    loadRecommendations()
    loadQuizResults()
  }, [])

  const loadProgressData = async () => {
    try {
      setLoading(true)
      const response = await progressService.getLearningProgress()
      setProgressData(response)
    } catch (error) {
      console.error('Error loading progress data:', error)
      toast.error('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    try {
      const response = await progressService.getSmartRecommendations()
      setRecommendations(response.recommendations || [])
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
  }

  const loadQuizResults = async () => {
    try {
      const response = await quizService.getQuizResults()
      setQuizResults(response.results || [])
    } catch (error) {
      console.error('Error loading quiz results:', error)
    }
  }

  // Process quiz results for score progress chart
  const scoreProgressData = quizResults.length > 0 
    ? quizResults.slice(-7).map((result, index) => ({
        date: new Date(result.submitted_at).toLocaleDateString('en-US', { weekday: 'short' }),
        score: Math.round(result.score),
        quiz: result.quiz_id?.slice(0, 8) + '...'
      }))
    : [
        { date: 'No Data', score: 0 }
      ]

  // Calculate subject performance from quiz results
  const subjectPerformance = React.useMemo(() => {
    if (!quizResults.length) return [{ subject: 'No Data', score: 0, quizzes: 0 }]
    
    const subjectMap = new Map()
    
    quizResults.forEach(result => {
      // Extract subject from quiz data or use document name
      const subject = result.subject || 'General Study'
      
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, { scores: [], count: 0 })
      }
      
      const data = subjectMap.get(subject)
      data.scores.push(result.score)
      data.count++
    })
    
    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject: subject.length > 15 ? subject.slice(0, 15) + '...' : subject,
      score: Math.round(data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length),
      quizzes: data.count
    })).slice(0, 5) // Limit to top 5 subjects
  }, [quizResults])

  // Calculate study time distribution from available data
  const studyTimeData = React.useMemo(() => {
    if (!progressData) return [{ name: 'Loading', value: 100, color: '#6B7280' }]
    
    const totalDocs = progressData.documents?.total || 0
    const totalQuizzes = progressData.quizzes?.attempted || 0
    const totalActivity = totalDocs + totalQuizzes
    
    if (totalActivity === 0) {
      return [{ name: 'No Activity', value: 100, color: '#6B7280' }]
    }
    
    return [
      { 
        name: 'Document Study', 
        value: Math.round((totalDocs / totalActivity) * 100), 
        color: '#3B82F6' 
      },
      { 
        name: 'Quiz Practice', 
        value: Math.round((totalQuizzes / totalActivity) * 100), 
        color: '#8B5CF6' 
      }
    ].filter(item => item.value > 0)
  }, [progressData])

  // Calculate weekly activity from quiz results
  const weeklyActivity = React.useMemo(() => {
    if (!quizResults.length) {
      return [
        { day: 'Mon', documents: 0, quizzes: 0, flashcards: 0 },
        { day: 'Tue', documents: 0, quizzes: 0, flashcards: 0 },
        { day: 'Wed', documents: 0, quizzes: 0, flashcards: 0 },
        { day: 'Thu', documents: 0, quizzes: 0, flashcards: 0 },
        { day: 'Fri', documents: 0, quizzes: 0, flashcards: 0 },
        { day: 'Sat', documents: 0, quizzes: 0, flashcards: 0 },
        { day: 'Sun', documents: 0, quizzes: 0, flashcards: 0 }
      ]
    }
    
    const dayMap = new Map()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    // Initialize all days
    days.forEach(day => {
      dayMap.set(day, { documents: 0, quizzes: 0, flashcards: 0 })
    })
    
    // Count activities by day
    quizResults.forEach(result => {
      const date = new Date(result.submitted_at)
      const dayName = days[date.getDay()]
      const dayData = dayMap.get(dayName)
      dayData.quizzes++
    })
    
    return days.map(day => ({
      day,
      ...dayMap.get(day)
    }))
  }, [quizResults])

  // Convert recommendations to achievement-like format
  const achievements = React.useMemo(() => {
    const baseAchievements = [
      { 
        id: 1, 
        title: 'First Document', 
        description: 'Upload your first study material', 
        icon: BookOpenIcon, 
        completed: progressData?.documents?.total > 0, 
        completedAt: progressData?.documents?.total > 0 ? '2024-10-26' : null 
      },
      { 
        id: 2, 
        title: 'First Quiz', 
        description: 'Complete your first quiz', 
        icon: AcademicCapIcon, 
        completed: progressData?.performance?.total_attempts > 0, 
        completedAt: progressData?.performance?.total_attempts > 0 ? '2024-10-26' : null 
      },
      { 
        id: 3, 
        title: 'High Scorer', 
        description: 'Score 80% or higher on a quiz', 
        icon: TrophyIcon, 
        completed: (progressData?.performance?.average_score || 0) >= 80, 
        completedAt: (progressData?.performance?.average_score || 0) >= 80 ? '2024-10-26' : null 
      },
      { 
        id: 4, 
        title: 'Consistent Learner', 
        description: 'Be active for 3+ days', 
        icon: FireIcon, 
        completed: (progressData?.activity?.days_active || 0) >= 3, 
        completedAt: (progressData?.activity?.days_active || 0) >= 3 ? '2024-10-26' : null 
      }
    ]
    
    return baseAchievements
  }, [progressData])

  // Calculate dynamic stats from real data
  const stats = progressData ? [
    {
      title: 'Total Documents',
      value: progressData.documents?.total || 0,
      change: `${progressData.documents?.processed || 0} processed`,
      icon: BookOpenIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Average Score',
      value: `${progressData.performance?.average_score || 0}%`,
      change: `Grade: ${progressData.performance?.grade_letter || 'N/A'}`,
      icon: ChartBarIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Quiz Attempts',
      value: progressData.performance?.total_attempts || 0,
      change: `${progressData.quizzes?.generated || 0} quizzes available`,
      icon: AcademicCapIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Days Active',
      value: `${progressData.activity?.days_active || 0} days`,
      change: progressData.performance?.improvement_trend >= 0 ? 
        `+${progressData.performance?.improvement_trend || 0}% improvement` : 
        `${progressData.performance?.improvement_trend || 0}% change`,
      icon: FireIcon,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    }
  ] : [
    {
      title: 'Loading...',
      value: '...',
      change: 'Fetching data...',
      icon: ClockIcon,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {loading && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
            <span>Loading progress data...</span>
          </div>
        </div>
      )}
      {/* Header with Time Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Progress Analytics</h1>
          <p className="text-gray-400">Track your learning journey and achievements</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              loadProgressData()
              loadRecommendations()
              loadQuizResults()
            }}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          {['week', 'month', 'quarter'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 capitalize
                ${selectedTimeframe === timeframe
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400 mb-2">{stat.title}</div>
            <div className="text-xs text-green-400">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Progress Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-6">Score Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Study Time Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-6">Study Time Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={studyTimeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {studyTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {studyTimeData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-300">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Performance */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-6">Subject Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="subject" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-6">Achievements</h2>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`
                  flex items-center space-x-3 p-3 rounded-lg border
                  ${achievement.completed 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-gray-700/50 border-gray-600'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${achievement.completed 
                    ? 'bg-green-500/20' 
                    : 'bg-gray-600'
                  }
                `}>
                  <achievement.icon className={`
                    h-5 w-5 
                    ${achievement.completed ? 'text-green-400' : 'text-gray-400'}
                  `} />
                </div>
                <div className="flex-1">
                  <h3 className={`
                    font-semibold text-sm
                    ${achievement.completed ? 'text-white' : 'text-gray-300'}
                  `}>
                    {achievement.title}
                  </h3>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                  {achievement.completed && achievement.completedAt && (
                    <p className="text-xs text-green-400 mt-1">
                      Completed {new Date(achievement.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-bold text-white mb-6">Weekly Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="documents" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="quizzes" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="flashcards" fill="#10B981" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-300">Documents</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-300">Quizzes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-300">Flashcards</span>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-6">Smart Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  rec.priority === 'high' 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : rec.priority === 'medium'
                    ? 'bg-yellow-500/10 border-yellow-500/20'
                    : 'bg-blue-500/10 border-blue-500/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{rec.icon || '💡'}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {rec.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {rec.estimated_time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}