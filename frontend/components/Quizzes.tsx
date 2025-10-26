'use client'

import React, { useState, useEffect } from 'react'
import {
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  ChartBarIcon,
  BookOpenIcon,
  FireIcon,
  TrophyIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { quizService } from '../services/api'
import toast from 'react-hot-toast'

interface Quiz {
  id: string
  title: string
  description: string
  questionsCount: number
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'draft' | 'ready' | 'completed'
  score?: number
  completedAt?: string
  createdAt: string
  source: string
  questions?: Question[]
}

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(false)

  // Load quizzes on component mount
  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading quizzes from API...')
      const response = await quizService.getQuizzes()
      console.log('📊 Quiz API response:', response)
      
      // Convert backend format to frontend format if needed
      if (Array.isArray(response)) {
        // If response is directly an array
        const mappedQuizzes = response.map((quiz: any) => ({
          id: quiz.id || quiz._id,
          title: quiz.title || `Quiz from ${quiz.source}`,
          description: quiz.description || `Generated from ${quiz.source}`,
          questionsCount: quiz.questions?.length || quiz.questionsCount || 10,
          duration: quiz.duration || Math.ceil((quiz.questions?.length || 10) * 1.5),
          difficulty: quiz.difficulty || 'medium' as 'easy' | 'medium' | 'hard',
          status: 'ready' as 'draft' | 'ready' | 'completed',
          createdAt: quiz.created_at || quiz.createdAt || new Date().toISOString(),
          source: quiz.source || 'Unknown Document',
          questions: quiz.questions || []
        }))
        console.log('✅ Mapped quizzes (array):', mappedQuizzes)
        setQuizzes(mappedQuizzes)
      } else if (response.quizzes) {
        // If response has a quizzes property
        const mappedQuizzes = response.quizzes.map((quiz: any) => ({
          id: quiz.id || quiz._id,
          title: quiz.title || `Quiz from ${quiz.source}`,
          description: quiz.description || `Generated from ${quiz.source}`,
          questionsCount: quiz.questions?.length || quiz.questionsCount || 10,
          duration: quiz.duration || Math.ceil((quiz.questions?.length || 10) * 1.5),
          difficulty: quiz.difficulty || 'medium' as 'easy' | 'medium' | 'hard',
          status: 'ready' as 'draft' | 'ready' | 'completed',
          createdAt: quiz.created_at || quiz.createdAt || new Date().toISOString(),
          source: quiz.source || 'Unknown Document',
          questions: quiz.questions || []
        }))
        console.log('✅ Mapped quizzes (object):', mappedQuizzes)
        setQuizzes(mappedQuizzes)
      } else {
        console.log('⚠️ No quizzes found in response')
        setQuizzes([])
      }
    } catch (error) {
      console.error('❌ Error loading quizzes:', error)
      setQuizzes([])
      toast.error('No quizzes available yet. Generate some quizzes from your documents!')
    } finally {
      setLoading(false)
    }
  }

  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [quizStarted, setQuizStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Sample questions for demo
  const sampleQuestions: Question[] = [
    {
      id: '1',
      question: 'What is the primary purpose of React?',
      options: [
        'Building mobile applications',
        'Building user interfaces',
        'Managing databases',
        'Server-side rendering'
      ],
      correctAnswer: 1,
      explanation: 'React is primarily a JavaScript library for building user interfaces, especially for web applications.'
    },
    {
      id: '2',
      question: 'Which method is used to render a React component?',
      options: [
        'ReactDOM.render()',
        'React.createElement()',
        'Component.render()',
        'React.renderComponent()'
      ],
      correctAnswer: 0,
      explanation: 'ReactDOM.render() is the method used to render React components to the DOM.'
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'hard': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-green-400" />
      case 'ready': return <PlayIcon className="h-5 w-5 text-blue-400" />
      default: return <ClockIcon className="h-5 w-5 text-yellow-400" />
    }
  }

  const startQuiz = async (quiz: Quiz) => {
    setCurrentQuiz(quiz)
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setQuizStarted(true)
    setShowResults(false)
    
    // If quiz has questions, use them; otherwise fetch from backend
    if (quiz.questions && quiz.questions.length > 0) {
      setCurrentQuestions(quiz.questions)
    } else {
      // Try to fetch questions from backend
      try {
        // For now, use sample questions as fallback
        setCurrentQuestions(sampleQuestions)
        toast('Using sample questions - quiz integration in progress')
      } catch (error) {
        console.error('Error fetching quiz questions:', error)
        setCurrentQuestions(sampleQuestions)
        toast.error('Failed to load quiz questions, using sample questions')
      }
    }
  }

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = () => {
    setQuizStarted(false)
    setShowResults(true)
    
    // Calculate score using current questions
    let correct = 0
    currentQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    const score = Math.round((correct / currentQuestions.length) * 100)
    
    // Update quiz status
    if (currentQuiz) {
      setQuizzes(prev => prev.map(quiz => 
        quiz.id === currentQuiz.id 
          ? { ...quiz, status: 'completed', score, completedAt: new Date().toISOString() }
          : quiz
      ))
    }
  }

  const resetQuiz = () => {
    setCurrentQuiz(null)
    setCurrentQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setQuizStarted(false)
    setShowResults(false)
  }

  if (quizStarted && currentQuiz && currentQuestions.length > 0) {
    const currentQuestion = currentQuestions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100

    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">{currentQuiz.title}</h1>
              <button 
                onClick={resetQuiz}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Exit Quiz
              </button>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
              <span>Question {currentQuestionIndex + 1} of {currentQuestions.length}</span>
              <span>• {currentQuiz.duration} minutes</span>
              <span>• {currentQuiz.difficulty} difficulty</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">{currentQuestion.question}</h2>
            
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`
                    w-full p-4 rounded-lg border text-left transition-all duration-200
                    ${selectedAnswers[currentQuestionIndex] === index
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${selectedAnswers[currentQuestionIndex] === index
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-500'
                      }
                    `}>
                      {selectedAnswers[currentQuestionIndex] === index && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button 
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              >
                Previous
              </button>
              
              <button 
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                onClick={nextQuestion}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
              >
                {currentQuestionIndex === currentQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showResults && currentQuiz && currentQuestions.length > 0) {
    let correct = 0
    currentQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    const score = Math.round((correct / currentQuestions.length) * 100)

    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrophyIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h1>
            <p className="text-gray-400">Great job on completing {currentQuiz.title}</p>
          </div>

          {/* Score Card */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-6">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-white mb-2">{score}%</div>
              <p className="text-gray-400">Your Score</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{correct}</div>
                <p className="text-gray-400">Correct</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{currentQuestions.length - correct}</div>
                <p className="text-gray-400">Incorrect</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{currentQuestions.length}</div>
                <p className="text-gray-400">Total</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => startQuiz(currentQuiz)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
            >
              Retake Quiz
            </button>
            <button 
              onClick={resetQuiz}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Quizzes</h1>
          <p className="text-gray-400">Test your knowledge with AI-generated quizzes</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200">
          <PlusIcon className="h-4 w-4" />
          <span>Create Quiz</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <BookOpenIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{quizzes.length}</div>
              <div className="text-sm text-gray-400">Total Quizzes</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{quizzes.filter(q => q.status === 'completed').length}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {Math.round(quizzes.filter(q => q.score).reduce((acc, q) => acc + (q.score || 0), 0) / quizzes.filter(q => q.score).length) || 0}%
              </div>
              <div className="text-sm text-gray-400">Avg Score</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <FireIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">3</div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200">
            {/* Quiz Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{quiz.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{quiz.description}</p>
              </div>
              <div className="ml-2">
                {getStatusIcon(quiz.status)}
              </div>
            </div>

            {/* Quiz Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Questions:</span>
                <span className="text-white">{quiz.questionsCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{quiz.duration} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Difficulty:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Source:</span>
                <span className="text-white text-xs truncate">{quiz.source}</span>
              </div>
            </div>

            {/* Score (if completed) */}
            {quiz.status === 'completed' && quiz.score !== undefined && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-sm">Last Score:</span>
                  <span className="text-green-400 font-bold">{quiz.score}%</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {quiz.status === 'ready' && (
                <button 
                  onClick={() => startQuiz(quiz)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                >
                  <PlayIcon className="h-4 w-4" />
                  <span>Start Quiz</span>
                </button>
              )}
              
              {quiz.status === 'completed' && (
                <div className="space-y-2">
                  <button 
                    onClick={() => startQuiz(quiz)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span>Retake Quiz</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200">
                    <EyeIcon className="h-4 w-4" />
                    <span>Review Answers</span>
                  </button>
                </div>
              )}
              
              {quiz.status === 'draft' && (
                <button className="w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed">
                  Processing...
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}