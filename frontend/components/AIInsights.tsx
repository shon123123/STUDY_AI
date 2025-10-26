'use client'

import React, { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  BookOpenIcon,
  FireIcon,
  ChartPieIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { progressService } from '../services/api'
import toast from 'react-hot-toast'

interface StudyInsight {
  type: 'strength' | 'weakness' | 'pattern' | 'recommendation' | 'prediction'
  title: string
  description: string
  confidence: number
  actionable: boolean
  priority: 'high' | 'medium' | 'low'
  category: string
  data?: any
}

interface LearningPattern {
  pattern: string
  frequency: number
  impact: 'positive' | 'negative' | 'neutral'
  description: string
  suggestion: string
}

interface KnowledgeGap {
  topic: string
  severity: 'critical' | 'moderate' | 'minor'
  relatedConcepts: string[]
  studyTime: number
  resources: string[]
}

interface StudyEfficiency {
  overallScore: number
  trends: {
    retention: number
    speed: number
    accuracy: number
    consistency: number
  }
  recommendations: string[]
}

export default function AIInsights() {
  const [insights, setInsights] = useState<StudyInsight[]>([])
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([])
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGap[]>([])
  const [studyEfficiency, setStudyEfficiency] = useState<StudyEfficiency | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all')

  useEffect(() => {
    loadAIInsights()
  }, [])

  const loadAIInsights = async () => {
    try {
      setLoading(true)
      
      // Mock AI-generated insights (replace with actual API calls)
      const mockInsights: StudyInsight[] = [
        {
          type: 'strength',
          title: 'Excellent Pattern Recognition',
          description: 'You show strong ability to identify patterns in complex problems, particularly in mathematical concepts.',
          confidence: 92,
          actionable: true,
          priority: 'medium',
          category: 'Cognitive Skills',
          data: { improvementRate: 15, consistency: 89 }
        },
        {
          type: 'weakness',
          title: 'Knowledge Retention Gap',
          description: 'Memory retention drops significantly after 48 hours. Consider implementing spaced repetition.',
          confidence: 87,
          actionable: true,
          priority: 'high',
          category: 'Memory',
          data: { retentionRate: 65, optimalRate: 85 }
        },
        {
          type: 'pattern',
          title: 'Peak Learning Hours Identified',
          description: 'Your concentration and performance peak between 9-11 AM and 2-4 PM.',
          confidence: 95,
          actionable: true,
          priority: 'medium',
          category: 'Study Habits',
          data: { peakHours: [9, 10, 14, 15], performanceIncrease: 23 }
        },
        {
          type: 'recommendation',
          title: 'Visual Learning Enhancement',
          description: 'Based on your quiz performance, visual aids and diagrams improve your understanding by 31%.',
          confidence: 78,
          actionable: true,
          priority: 'medium',
          category: 'Learning Style',
          data: { visualImpact: 31, preferenceScore: 8.2 }
        },
        {
          type: 'prediction',
          title: 'Mastery Timeline Forecast',
          description: 'At current pace, you will achieve 90% mastery of uploaded content in approximately 3-4 weeks.',
          confidence: 84,
          actionable: false,
          priority: 'low',
          category: 'Progress',
          data: { currentMastery: 67, targetMastery: 90, estimatedDays: 24 }
        }
      ]

      const mockPatterns: LearningPattern[] = [
        {
          pattern: 'Sequential Learning',
          frequency: 78,
          impact: 'positive',
          description: 'You prefer learning concepts in a logical sequence',
          suggestion: 'Continue with structured, step-by-step approaches'
        },
        {
          pattern: 'Evening Study Sessions',
          frequency: 65,
          impact: 'negative',
          description: 'Late-night studying reduces retention by 20%',
          suggestion: 'Shift intensive study sessions to morning hours'
        },
        {
          pattern: 'Frequent Short Breaks',
          frequency: 89,
          impact: 'positive',
          description: 'Taking breaks every 25-30 minutes improves focus',
          suggestion: 'Maintain your Pomodoro-style study rhythm'
        }
      ]

      const mockGaps: KnowledgeGap[] = [
        {
          topic: 'Advanced Calculus Applications',
          severity: 'moderate',
          relatedConcepts: ['Integration by Parts', 'Series Convergence', 'Multivariable Functions'],
          studyTime: 8,
          resources: ['Khan Academy Calculus', 'Practice Problems Set A', 'Video Tutorials']
        },
        {
          topic: 'Data Structures Implementation',
          severity: 'critical',
          relatedConcepts: ['Binary Trees', 'Hash Tables', 'Graph Algorithms'],
          studyTime: 12,
          resources: ['LeetCode Practice', 'Algorithm Textbook Ch. 5-7', 'Coding Exercises']
        }
      ]

      const mockEfficiency: StudyEfficiency = {
        overallScore: 73,
        trends: {
          retention: 68,
          speed: 82,
          accuracy: 75,
          consistency: 67
        },
        recommendations: [
          'Implement active recall techniques',
          'Use spaced repetition for long-term retention',
          'Focus on quality over quantity in study sessions',
          'Create mind maps for complex topics'
        ]
      }

      setInsights(mockInsights)
      setLearningPatterns(mockPatterns)
      setKnowledgeGaps(mockGaps)
      setStudyEfficiency(mockEfficiency)

    } catch (error) {
      console.error('Error loading AI insights:', error)
      toast.error('Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <StarIcon className="h-5 w-5 text-green-400" />
      case 'weakness': return <ArrowTrendingUpIcon className="h-5 w-5 text-red-400" />
      case 'pattern': return <ChartBarIcon className="h-5 w-5 text-blue-400" />
      case 'recommendation': return <LightBulbIcon className="h-5 w-5 text-yellow-400" />
      case 'prediction': return <CpuChipIcon className="h-5 w-5 text-purple-400" />
      default: return <SparklesIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 border-red-500/20 text-red-400'
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
      case 'low': return 'bg-green-500/10 border-green-500/20 text-green-400'
      default: return 'bg-gray-500/10 border-gray-500/20 text-gray-400'
    }
  }

  const getGapSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10'
      case 'moderate': return 'text-yellow-400 bg-yellow-400/10'
      case 'minor': return 'text-green-400 bg-green-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const filteredInsights = selectedInsightType === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === selectedInsightType)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Learning Insights</h1>
          <p className="text-gray-400">Personalized analysis of your learning patterns and performance</p>
        </div>
        <button 
          onClick={loadAIInsights}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
        >
          <CpuChipIcon className="h-4 w-4" />
          <span>Generate New Insights</span>
        </button>
      </div>

      {/* Study Efficiency Overview */}
      {studyEfficiency && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <ChartPieIcon className="h-5 w-5 text-blue-400" />
            <span>Study Efficiency Score</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{studyEfficiency.overallScore}</div>
              <div className="text-sm text-gray-400">Overall</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${studyEfficiency.overallScore}%` }}
                ></div>
              </div>
            </div>
            
            {Object.entries(studyEfficiency.trends).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-xl font-bold text-white mb-1">{value}</div>
                <div className="text-sm text-gray-400 capitalize">{key}</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      value >= 80 ? 'bg-green-500' : 
                      value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'strength', 'weakness', 'pattern', 'recommendation', 'prediction'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedInsightType(type)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedInsightType === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInsights.map((insight, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getInsightIcon(insight.type)}
                <div>
                  <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority} priority
                    </span>
                    <span className="text-xs text-gray-400">{insight.confidence}% confidence</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">{insight.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{insight.category}</span>
              {insight.actionable && (
                <button className="text-primary-400 text-sm hover:text-primary-300 transition-colors duration-200">
                  Take Action →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Learning Patterns */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <ChartBarIcon className="h-5 w-5 text-green-400" />
          <span>Learning Patterns Detected</span>
        </h2>
        
        <div className="space-y-4">
          {learningPatterns.map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-medium text-white">{pattern.pattern}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pattern.impact === 'positive' ? 'bg-green-500/10 text-green-400' :
                    pattern.impact === 'negative' ? 'bg-red-500/10 text-red-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {pattern.impact}
                  </span>
                  <span className="text-sm text-gray-400">{pattern.frequency}% frequency</span>
                </div>
                <p className="text-sm text-gray-300 mb-1">{pattern.description}</p>
                <p className="text-sm text-blue-400">{pattern.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Gaps */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <AcademicCapIcon className="h-5 w-5 text-red-400" />
          <span>Knowledge Gaps to Address</span>
        </h2>
        
        <div className="space-y-4">
          {knowledgeGaps.map((gap, index) => (
            <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">{gap.topic}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getGapSeverityColor(gap.severity)}`}>
                    {gap.severity}
                  </span>
                  <span className="text-sm text-gray-400">{gap.studyTime}h needed</span>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-2">Related concepts:</p>
                <div className="flex flex-wrap gap-2">
                  {gap.relatedConcepts.map((concept, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">Recommended resources:</p>
                <ul className="text-sm text-blue-400 space-y-1">
                  {gap.resources.map((resource, idx) => (
                    <li key={idx}>• {resource}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}