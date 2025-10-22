'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

const API_BASE_URL = 'http://localhost:8000'

interface Question {
  id: number
  type: 'multiple-choice' | 'short-answer' | 'essay'
  question: string
  options?: string[]
  correctAnswer: string
  userAnswer?: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  source: string
  points: number
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  timeLimit: number
  source: string
  created: string
  sourceDocumentId: string
}

interface Document {
  id: string
  filename: string
  processed: boolean
  file_type: string
  upload_date: string
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string>('')
  const [questionCount, setQuestionCount] = useState(15)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed')
  const [showGenerator, setShowGenerator] = useState(false)

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: string}>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  // Load documents and existing quizzes on mount
  useEffect(() => {
    loadDocuments()
    loadQuizzes()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents.filter((doc: Document) => doc.processed))
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const loadQuizzes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes`)
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes || [])
      }
    } catch (error) {
      console.error('Error loading quizzes:', error)
    }
  }

  const generateQuiz = async () => {
    if (!selectedDocument) {
      alert('Please select a document')
      return
    }

    try {
      setGeneratingQuiz(true)
      const response = await fetch(`${API_BASE_URL}/api/quizzes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: selectedDocument,
          question_count: questionCount,
          difficulty: difficulty,
          question_types: ['multiple-choice', 'short-answer']
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newQuiz: Quiz = {
          id: data.quiz_id,
          title: `Quiz: ${documents.find(d => d.id === selectedDocument)?.filename || 'Document'}`,
          description: `Generated quiz with ${questionCount} questions`,
          questions: data.questions,
          timeLimit: Math.max(questionCount * 2, 15), // 2 minutes per question, minimum 15
          source: documents.find(d => d.id === selectedDocument)?.filename || 'Unknown',
          created: new Date().toISOString().split('T')[0],
          sourceDocumentId: selectedDocument
        }
        
        setQuizzes(prev => [newQuiz, ...prev])
        setShowGenerator(false)
        alert(`Successfully generated quiz with ${data.questions.length} questions!`)
      } else {
        const error = await response.json()
        alert(`Failed to generate quiz: ${error.detail}`)
      }
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Failed to generate quiz. Please try again.')
    } finally {
      setGeneratingQuiz(false)
    }
  }

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz)
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setTimeRemaining(quiz.timeLimit * 60) // Convert to seconds
  }

  const submitAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const finishQuiz = async () => {
    if (!activeQuiz) return
    
    try {
      setLoading(true)
      
      // Submit answers for AI analysis
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${activeQuiz.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answers,
          document_id: activeQuiz.sourceDocumentId
        })
      })

      if (response.ok) {
        const analysis = await response.json()
        setAnalysisResults(analysis)
      } else {
        console.error('Failed to get AI analysis')
      }
    } catch (error) {
      console.error('Error analyzing answers:', error)
    } finally {
      setLoading(false)
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    if (!activeQuiz) return { score: 0, total: 0, percentage: 0 }
    
    let score = 0
    let total = 0
    
    activeQuiz.questions.forEach(question => {
      total += question.points
      const userAnswer = answers[question.id]
      if (userAnswer && userAnswer.toLowerCase().includes(question.correctAnswer.toLowerCase())) {
        score += question.points
      }
    })
    
    return {
      score,
      total,
      percentage: Math.round((score / total) * 100)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      hard: 'text-red-600 bg-red-100'
    }
    return colors[difficulty as keyof typeof colors] || colors.medium
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Quiz Selection View
  if (!activeQuiz) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
        <Sidebar />
      <TopBar />
        
        <main className="md:pl-64 pt-16 h-full overflow-auto">
          <div className="w-full px-8 py-8">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Smart assessments created from your study materials
              </p>
              
              <button 
                onClick={() => setShowGenerator(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium flex items-center space-x-2 disabled:opacity-50"
                disabled={documents.length === 0}
              >
                <span>✨</span>
                <span>{documents.length === 0 ? 'Upload Documents First' : 'Generate New Quiz'}</span>
              </button>
            </div>

          {/* Quiz Generator Modal */}
          {showGenerator && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🚀 Generate AI Quiz</h2>
                    <button
                      onClick={() => setShowGenerator(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h3>
                      <p className="text-gray-600 mb-4">Upload and process documents first to generate quizzes</p>
                      <button
                        onClick={() => {
                          setShowGenerator(false)
                          // Navigate to materials page
                          window.location.href = '/materials'
                        }}
                        className="ai-button-primary"
                      >
                        Upload Documents
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Study Material *
                        </label>
                        <select 
                          value={selectedDocument}
                          onChange={(e) => setSelectedDocument(e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Choose a document...</option>
                          {documents.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.filename} ({doc.file_type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Number of Questions
                          </label>
                          <select 
                            value={questionCount}
                            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Array.from({length: 21}, (_, i) => i + 10).map(num => (
                              <option key={num} value={num}>{num} questions</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Difficulty Level
                          </label>
                          <select 
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as any)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="mixed">Mixed Difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Quiz Preview</h4>
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p>• Document: {selectedDocument ? documents.find(d => d.id === selectedDocument)?.filename : 'None selected'}</p>
                          <p>• Questions: {questionCount} ({difficulty} difficulty)</p>
                          <p>• Estimated Time: {Math.max(questionCount * 2, 15)} minutes</p>
                          <p>• Question Types: Multiple choice and short answer</p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={() => setShowGenerator(false)}
                          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          disabled={generatingQuiz}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={generateQuiz}
                          disabled={!selectedDocument || generatingQuiz}
                          className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
                        >
                          {generatingQuiz ? 'Generating...' : 'Generate Quiz'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

            {/* Available Quizzes */}
            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">❓</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Quizzes Yet</h3>
                <p className="text-gray-600 mb-4">
                  {documents.length === 0 
                    ? 'Upload and process documents first, then generate your first quiz'
                    : 'Generate quizzes from your uploaded documents'
                  }
                </p>
                {documents.length === 0 ? (
                  <button
                    onClick={() => window.location.href = '/materials'}
                    className="ai-button-primary"
                  >
                    <span className="mr-2">📚</span>
                    Upload Documents
                  </button>
                ) : (
                  <button
                    onClick={() => setShowGenerator(true)}
                    className="ai-button-primary"
                  >
                    <span className="mr-2">✨</span>
                    Generate First Quiz
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="ai-card ai-hover-lift">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                      <span className="text-xs text-gray-500">{quiz.created}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{quiz.description}</p>
                    
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      <span>📝 {quiz.questions.length} questions</span>
                      <span>⏱️ {quiz.timeLimit} min</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500">From: {quiz.source}</span>
                      <div className="flex space-x-1">
                        {quiz.questions.slice(0, 3).map(q => (
                          <span key={q.id} className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty[0].toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => startQuiz(quiz)}
                      className="w-full ai-button-primary"
                    >
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Results View
  if (showResults) {
    const results = calculateScore()
    
    return (
      <div className="h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        
        <main className="md:pl-64 h-full overflow-auto">
          <div className="w-full p-6">
            <div className="max-w-4xl mx-auto">
              {/* Results Header */}
              <div className="ai-card text-center mb-8">
                <div className="text-6xl mb-4">
                  {results.percentage >= 90 ? '🏆' : results.percentage >= 70 ? '🎉' : results.percentage >= 50 ? '👍' : '💪'}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(results.percentage)}`}>
                  {results.percentage}%
                </div>
                <p className="text-gray-600">
                  You scored {results.score} out of {results.total} points
                </p>
              </div>

              {/* AI Analysis Results */}
              {analysisResults && (
                <div className="ai-card mb-8 ai-gradient-primary text-white">
                  <h3 className="text-lg font-semibold mb-4">🤖 AI Analysis of Your Performance</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{analysisResults.overall_understanding || 'N/A'}</div>
                      <div className="text-sm text-blue-100">Overall Understanding</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{analysisResults.strengths?.length || 0}</div>
                      <div className="text-sm text-blue-100">Strong Areas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{analysisResults.improvements?.length || 0}</div>
                      <div className="text-sm text-blue-100">Areas to Improve</div>
                    </div>
                  </div>

                  {analysisResults.feedback && (
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-2">📝 Personalized Feedback</h4>
                      <p className="text-sm text-blue-100">{analysisResults.feedback}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResults.strengths && analysisResults.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">✅ Strengths</h4>
                        <ul className="text-sm text-blue-100 space-y-1">
                          {analysisResults.strengths.map((strength: string, index: number) => (
                            <li key={index}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResults.improvements && analysisResults.improvements.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">📈 Areas for Improvement</h4>
                        <ul className="text-sm text-blue-100 space-y-1">
                          {analysisResults.improvements.map((improvement: string, index: number) => (
                            <li key={index}>• {improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {analysisResults.study_recommendations && (
                    <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
                      <h4 className="font-medium mb-2">🎯 Study Recommendations</h4>
                      <ul className="text-sm text-blue-100 space-y-1">
                        {analysisResults.study_recommendations.map((rec: string, index: number) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Question Review */}
              <div className="space-y-6">
                {activeQuiz.questions.map((question, index) => {
                  const userAnswer = answers[question.id] || 'No answer provided'
                  const isCorrect = userAnswer.toLowerCase().includes(question.correctAnswer.toLowerCase())
                  
                  return (
                    <div key={question.id} className="ai-card">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                          Question {index + 1}: {question.question}
                        </h3>
                        <span className={`text-2xl ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                          {isCorrect ? '✅' : '❌'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Your Answer:</span>
                          <p className={`text-sm mt-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                            {userAnswer}
                          </p>
                        </div>
                        
                        {!isCorrect && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
                            <p className="text-sm text-green-800 mt-1">{question.correctAnswer}</p>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">AI Explanation:</span>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="ai-button-secondary"
                >
                  Back to Quizzes
                </button>
                <button
                  onClick={() => startQuiz(activeQuiz)}
                  className="ai-button-primary"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Quiz Taking View
  const question = activeQuiz.questions[currentQuestion]
  
  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      
      <main className="md:pl-64 h-full overflow-auto">
        <div className="w-full p-6">
          <div className="max-w-4xl mx-auto">
            {/* Quiz Header */}
            <div className="ai-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{activeQuiz.title}</h2>
                <div className="text-sm text-gray-500">
                  ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {activeQuiz.questions.length}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty} • {question.points} pts
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / activeQuiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="ai-card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {question.question}
              </h3>
              
              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        onChange={(e) => submitAnswer(question.id, e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-800 dark:text-gray-200">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.type === 'short-answer' && (
                <textarea
                  placeholder="Type your answer here..."
                  onChange={(e) => submitAnswer(question.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              )}
              
              {question.type === 'essay' && (
                <textarea
                  placeholder="Write your detailed answer here..."
                  onChange={(e) => submitAnswer(question.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="ai-button-secondary disabled:opacity-50"
              >
                Previous
              </button>
              
              {currentQuestion === activeQuiz.questions.length - 1 ? (
                <button
                  onClick={finishQuiz}
                  className="ai-button-primary"
                >
                  Finish Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  className="ai-button-primary"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        </div>
        </main>
      </div>
  )
}