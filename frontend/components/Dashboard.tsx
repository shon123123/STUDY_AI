'use client'

import React, { useState, useEffect } from 'react'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  PlusIcon,
  CalendarIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import ClientDate from './ClientDate'
import ClientDateString from './ClientDateString'
import { documentService, quizService, progressService } from '../services/api'

interface StatCard {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
}

interface Recommendation {
  title: string
  description: string
  duration: string
  priority: string
  icon: React.ComponentType<any>
  color: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Documents Uploaded',
      value: '0',
      subtitle: 'Total documents in your library',
      icon: DocumentTextIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Documents Processed',
      value: '0',
      subtitle: 'Ready for quiz generation',
      icon: CheckCircleIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Quizzes Generated',
      value: '0',
      subtitle: 'Test your knowledge',
      icon: QuestionMarkCircleIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Average Score',
      value: '0%',
      subtitle: 'Your performance rate',
      icon: ChartBarIcon,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    }
  ])

  const [progressData, setProgressData] = useState({
    documents: { current: 0, total: 0, percentage: 0 },
    quizCompletion: { current: 0, total: 0, percentage: 0 },
    performance: { current: 0, percentage: 0 }
  })

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      title: 'Start Your Learning Journey',
      description: 'Upload your first study material to begin',
      duration: '2 minutes',
      priority: 'high',
      icon: BookOpenIcon,
      color: 'text-blue-400'
    },
    {
      title: 'Take Your First Quiz',
      description: 'Test your knowledge with an AI-generated quiz',
      duration: '10-15 minutes',
      priority: 'high',
      icon: QuestionMarkCircleIcon,
      color: 'text-purple-400'
    }
  ])

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [studyEvents, setStudyEvents] = useState<{ [key: string]: string[] }>({})

  // Load data from backend
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load documents
      const documents = await documentService.getDocuments()
      
      // Load quizzes
      const quizzes = await quizService.getQuizzes()
      
      // Load quiz results
      const results = await quizService.getQuizResults()
      
      // Load learning progress
      const progress = await progressService.getLearningProgress()
      
      // Load smart recommendations
      const smartRecommendations = await progressService.getSmartRecommendations()

      // Update stats
      const processedDocs = documents.filter((doc: any) => doc.status === 'processed').length
      const avgScore = results.length > 0 
        ? Math.round(results.reduce((acc: number, result: any) => acc + result.score, 0) / results.length)
        : 0

      setStats([
        {
          title: 'Documents Uploaded',
          value: documents.length.toString(),
          subtitle: 'Total documents in your library',
          icon: DocumentTextIcon,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10'
        },
        {
          title: 'Documents Processed',
          value: processedDocs.toString(),
          subtitle: 'Ready for quiz generation',
          icon: CheckCircleIcon,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10'
        },
        {
          title: 'Quizzes Generated',
          value: quizzes.length.toString(),
          subtitle: 'Test your knowledge',
          icon: QuestionMarkCircleIcon,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/10'
        },
        {
          title: 'Average Score',
          value: `${avgScore}%`,
          subtitle: 'Your performance rate',
          icon: ChartBarIcon,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10'
        }
      ])

      // Update progress data
      setProgressData({
        documents: { 
          current: processedDocs, 
          total: documents.length, 
          percentage: documents.length > 0 ? Math.round((processedDocs / documents.length) * 100) : 0 
        },
        quizCompletion: { 
          current: results.length, 
          total: quizzes.length, 
          percentage: quizzes.length > 0 ? Math.round((results.length / quizzes.length) * 100) : 0 
        },
        performance: { 
          current: avgScore, 
          percentage: avgScore 
        }
      })

      // Update recommendations if available
      if (smartRecommendations.recommendations && smartRecommendations.recommendations.length > 0) {
        const mappedRecommendations = smartRecommendations.recommendations.map((rec: any) => ({
          title: rec.title,
          description: rec.description,
          duration: rec.estimated_time ? `${rec.estimated_time} min` : '5-10 minutes',
          priority: rec.priority || 'medium',
          icon: rec.type === 'quiz' ? QuestionMarkCircleIcon : BookOpenIcon,
          color: rec.type === 'quiz' ? 'text-purple-400' : 'text-blue-400'
        }))
        setRecommendations(mappedRecommendations)
      }

      // Generate calendar events from backend data
      const generatedEvents: { [key: string]: string[] } = {}
      const today = new Date()
      
      // Add quiz events (spread them over next few days)
      quizzes.forEach((quiz: any, index: number) => {
        const eventDate = new Date(today)
        eventDate.setDate(today.getDate() + index + 1)
        const dateKey = eventDate.toISOString().split('T')[0]
        
        if (!generatedEvents[dateKey]) {
          generatedEvents[dateKey] = []
        }
        generatedEvents[dateKey].push(`Quiz: ${quiz.title || quiz.source_document || 'Study Quiz'}`)
      })
      
      // Add study sessions for unprocessed documents
      const unprocessedDocs = documents.filter((doc: any) => doc.status !== 'processed')
      unprocessedDocs.forEach((doc: any, index: number) => {
        const eventDate = new Date(today)
        eventDate.setDate(today.getDate() + index + 2)
        const dateKey = eventDate.toISOString().split('T')[0]
        
        if (!generatedEvents[dateKey]) {
          generatedEvents[dateKey] = []
        }
        generatedEvents[dateKey].push(`Study: ${doc.filename || doc.name}`)
      })
      
      // Add review sessions based on recommendations
      if (smartRecommendations.recommendations) {
        smartRecommendations.recommendations.slice(0, 3).forEach((rec: any, index: number) => {
          const eventDate = new Date(today)
          eventDate.setDate(today.getDate() + index + 3)
          const dateKey = eventDate.toISOString().split('T')[0]
          
          if (!generatedEvents[dateKey]) {
            generatedEvents[dateKey] = []
          }
          generatedEvents[dateKey].push(`Review: ${rec.title}`)
        })
      }
      
      setStudyEvents(generatedEvents)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Keep default/fallback data if API fails
    }
  }

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSameMonth = (date: Date, referenceDate: Date) => {
    return date.getMonth() === referenceDate.getMonth() &&
           date.getFullYear() === referenceDate.getFullYear()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back, Student! 👋</h1>
            <p className="text-gray-300">Ready to continue your learning journey?</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Today's Date</p>
            <ClientDate className="text-lg font-semibold text-white" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400 mb-2">{stat.title}</div>
            <div className="text-xs text-gray-500">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Smart Study Recommendations - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/20 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Smart Study Recommendations</h2>
                  <p className="text-sm text-gray-400">AI Confidence: 85%</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:bg-gray-800/70 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <rec.icon className={`h-5 w-5 ${rec.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{rec.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>⏱ {rec.duration}</span>
                          <span>• Priority: {rec.priority}</span>
                        </div>
                        <button className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
                          Start →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200">
                View all recommendations →
              </button>
            </div>
          </div>
        </div>

        {/* Study Progress - Takes 1 column */}
        <div className="xl:col-span-1">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-full">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpenIcon className="h-6 w-6 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Study Progress</h2>
            </div>

            <div className="space-y-6">
              {/* Documents */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Documents</span>
                  <span className="text-sm font-medium text-white">{progressData.documents.current}/{progressData.documents.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progressData.documents.percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload documents to begin</p>
              </div>

              {/* Quiz Completion */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Quiz Completion</span>
                  <span className="text-sm font-medium text-white">{progressData.quizCompletion.current}/{progressData.quizCompletion.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progressData.quizCompletion.percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Generate quizzes to track progress</p>
              </div>

              {/* Performance */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Performance</span>
                  <span className="text-sm font-medium text-white">{progressData.performance.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progressData.performance.percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Take quizzes to see performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Study Assistant - Takes 1 column */}
        <div className="xl:col-span-1">
          <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/20 h-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">AI Study Assistant</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">Get personalized help with your coursework</p>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg">
                <QuestionMarkCircleIcon className="h-4 w-4" />
                <span>Generate Quiz</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg">
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Chat with AI</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg">
                <CloudArrowUpIcon className="h-4 w-4" />
                <span>Upload Materials</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-green-400">24</div>
                  <div className="text-xs text-gray-400">Questions Asked</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-400">12</div>
                  <div className="text-xs text-gray-400">Concepts Learned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Study Calendar */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-6 w-6 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Study Calendar</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-white px-4 min-w-[140px] text-center">{currentMonth}</span>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-7 gap-1">
              {/* Days of week header */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-xs font-medium text-gray-400 bg-gray-700/50 rounded-lg">
                  {day}
                </div>
              ))}
              
              {/* Calendar dates */}
              {(() => {
                const daysInMonth = getDaysInMonth(currentDate)
                const firstDay = getFirstDayOfMonth(currentDate)
                const days = []
                
                // Previous month's trailing days
                const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0)
                for (let i = firstDay - 1; i >= 0; i--) {
                  const day = prevMonth.getDate() - i
                  const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day)
                  days.push(
                    <div
                      key={`prev-${day}`}
                      className="p-2 text-center text-sm text-gray-600 cursor-pointer hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                    >
                      {day}
                    </div>
                  )
                }
                
                // Current month days
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  const dateKey = formatDateKey(date)
                  const hasEvents = studyEvents[dateKey]?.length > 0
                  const isSelected = selectedDate && 
                    date.getDate() === selectedDate.getDate() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getFullYear() === selectedDate.getFullYear()
                  
                  days.push(
                    <div
                      key={day}
                      onClick={() => handleDateClick(date)}
                      className={`
                        p-2 text-center text-sm cursor-pointer rounded-lg transition-all duration-200 relative
                        ${isToday(date) 
                          ? 'bg-blue-600 text-white font-bold shadow-lg' 
                          : isSelected
                            ? 'bg-purple-600 text-white'
                            : 'text-white hover:bg-gray-700'
                        }
                        ${hasEvents ? 'ring-2 ring-green-500/50' : ''}
                      `}
                    >
                      {day}
                      {hasEvents && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="flex space-x-1">
                            {studyEvents[dateKey].slice(0, 2).map((_, i) => (
                              <div key={i} className="w-1 h-1 bg-green-400 rounded-full"></div>
                            ))}
                            {studyEvents[dateKey].length > 2 && (
                              <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }
                
                // Next month's leading days
                const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
                const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                for (let day = 1; days.length < totalCells; day++) {
                  days.push(
                    <div
                      key={`next-${day}`}
                      className="p-2 text-center text-sm text-gray-600 cursor-pointer hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                    >
                      {day}
                    </div>
                  )
                }
                
                return days
              })()}
            </div>
          </div>

          {/* Events Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-700/50 rounded-lg p-4 h-full">
              <h3 className="text-sm font-semibold text-white mb-4">
                {selectedDate ? `Events for ` : 'Select a date'}
                {selectedDate && <ClientDateString date={selectedDate} />}
              </h3>
              
              {selectedDate && studyEvents[formatDateKey(selectedDate)] ? (
                <div className="space-y-2">
                  {studyEvents[formatDateKey(selectedDate)].map((event, index) => (
                    <div key={index} className="bg-gray-600/50 rounded-lg p-3 border-l-2 border-blue-400">
                      <div className="text-sm font-medium text-white">{event}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {index % 2 === 0 ? '2:00 PM' : '4:00 PM'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No events scheduled</p>
                  <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200">
                    + Add Event
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Click on a date to view events</p>
                </div>
              )}

              {/* Quick Add */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200">
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Study Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-gray-400">Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded"></div>
            <span className="text-gray-400">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-green-500 rounded"></div>
            <span className="text-gray-400">Has Events</span>
          </div>
        </div>
      </div>
    </div>
  )
}