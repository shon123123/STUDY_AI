'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

const API_BASE_URL = 'http://localhost:8000'

interface Flashcard {
  id: string
  document_id: string
  front: string
  back: string
  difficulty: number
  topic: string
  next_review: string
  review_count: number
  confidence_level: number
  created_at: string
}

interface Document {
  id: string
  filename: string
  processed: boolean
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyMode, setStudyMode] = useState<'review' | 'learn' | 'master'>('review')
  const [loading, setLoading] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string>('')
  const [maxCards, setMaxCards] = useState(20)

  useEffect(() => {
    loadDocuments()
    loadFlashcards()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const loadFlashcards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards/due`)
      if (response.ok) {
        const data = await response.json()
        setFlashcards(data.flashcards || [])
        if (data.flashcards && data.flashcards.length > 0) {
          setCurrentCard(0)
        }
      }
    } catch (error) {
      console.error('Error loading flashcards:', error)
    }
  }

  const generateFlashcards = async () => {
    if (!selectedDocument) {
      alert('Please select a document')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: selectedDocument,
          max_cards: maxCards
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✨ Generated ${data.total} flashcards!`)
        setShowGenerator(false)
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

  const studyStats = {
    total: flashcards.length,
    mastered: flashcards.filter(c => c.confidence_level >= 4).length,
    dueToday: flashcards.filter(c => new Date(c.next_review) <= new Date()).length,
    avgReviews: flashcards.length > 0 ? Math.round(flashcards.reduce((sum, c) => sum + c.review_count, 0) / flashcards.length) : 0
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'ai-badge ai-badge-active'
    if (difficulty <= 3) return 'ai-badge bg-yellow-100 text-yellow-800'
    return 'ai-badge bg-red-100 text-red-800'
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy'
    if (difficulty <= 3) return 'Medium'
    return 'Hard'
  }

  const handleAnswer = async (confidence: number) => {
    if (!flashcards[currentCard]) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards/${flashcards[currentCard].id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confidence })
      })

      if (response.ok) {
        // Move to next card
        setShowAnswer(false)
        if (currentCard < flashcards.length - 1) {
          setCurrentCard(prev => prev + 1)
        } else {
          alert('🎉 All flashcards reviewed!')
          loadFlashcards() // Reload to get updated cards
          setCurrentCard(0)
        }
      }
    } catch (error) {
      console.error('Error reviewing flashcard:', error)
    }
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Sidebar />
      <TopBar />
      
      <main className="md:pl-64 pt-16 h-full overflow-auto">
        {/* Study Stats */}
        <div className="w-full px-8 py-8">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered spaced repetition learning system
            </p>
            
            <div className="flex items-center space-x-3">
              <select 
                value={studyMode}
                onChange={(e) => setStudyMode(e.target.value as any)}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="review">📅 Review Mode</option>
                <option value="learn">🎓 Learn New</option>
                <option value="master">🏆 Master Mode</option>
              </select>
            </div>
          </div>

          {/* Flashcard Generator */}
          {showGenerator && (
            <div className="ai-card dark:bg-gray-800 dark:border-gray-700 mb-6">
              <h3 className="text-lg font-bold mb-4 dark:text-white">📝 Generate Flashcards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={selectedDocument}
                  onChange={(e) => setSelectedDocument(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a document...</option>
                  {documents.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.filename}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={maxCards}
                  onChange={(e) => setMaxCards(parseInt(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Number of cards"
                />
                <div className="flex gap-2">
                  <button
                    onClick={generateFlashcards}
                    disabled={loading || !selectedDocument}
                    className="ai-button-primary flex-1 disabled:opacity-50"
                  >
                    {loading ? '⏳ Generating...' : '✨ Generate'}
                  </button>
                  <button
                    onClick={() => setShowGenerator(false)}
                    className="ai-button bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 px-4"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showGenerator && flashcards.length === 0 && (
            <div className="ai-card text-center mb-6">
              <div className="text-6xl mb-4">🎴</div>
              <h3 className="text-xl font-bold mb-2">No Flashcards Yet</h3>
              <p className="text-gray-600 mb-4">Generate AI-powered flashcards from your documents</p>
              <button
                onClick={() => setShowGenerator(true)}
                className="ai-button-primary"
              >
                📝 Generate Flashcards
              </button>
            </div>
          )}

          {!showGenerator && flashcards.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowGenerator(true)}
                className="ai-button-primary"
              >
                ➕ Generate More
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="ai-card dark:bg-gray-800 dark:border-gray-700 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{studyStats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
            </div>
            <div className="ai-card dark:bg-gray-800 dark:border-gray-700 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{studyStats.mastered}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mastered</div>
            </div>
            <div className="ai-card dark:bg-gray-800 dark:border-gray-700 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">{studyStats.dueToday}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Due Today</div>
            </div>
            <div className="ai-card dark:bg-gray-800 dark:border-gray-700 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{studyStats.avgReviews}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Reviews</div>
            </div>
          </div>

          {/* Flashcard Study Interface */}
          <div className="max-w-4xl mx-auto">
            <div className="ai-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Card {currentCard + 1} of {flashcards.length}
                  </span>
                  <span className={getDifficultyColor(flashcards[currentCard]?.difficulty || 3)}>
                    {getDifficultyLabel(flashcards[currentCard]?.difficulty || 3)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Topic: {flashcards[currentCard]?.topic || 'General'}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
                ></div>
              </div>

              {/* Card Content */}
              <div className="min-h-[300px] flex flex-col justify-center">
                <div className="text-center mb-8">
                  <div className="text-lg font-medium text-gray-600 mb-4">
                    {showAnswer ? 'Answer:' : 'Question:'}
                  </div>
                  <div className="text-xl text-gray-900 leading-relaxed">
                    {showAnswer 
                      ? flashcards[currentCard]?.back 
                      : flashcards[currentCard]?.front
                    }
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  {!showAnswer ? (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="ai-button-primary px-8 py-3 text-lg"
                    >
                      Show Answer
                    </button>
                  ) : (
                    <div>
                      <p className="text-center text-gray-600 mb-4">How well did you know this?</p>
                      <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((confidence) => (
                          <div key={confidence} className="text-center">
                            <button
                              onClick={() => handleAnswer(confidence)}
                              className={`ai-button px-6 py-3 mb-2 block ${
                                confidence <= 2 
                                  ? 'bg-red-500 hover:bg-red-600' 
                                  : confidence <= 3 
                                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                                  : 'bg-green-500 hover:bg-green-600'
                              } text-white`}
                            >
                              {confidence}
                            </button>
                            <span className="text-xs text-gray-500">
                              {confidence === 1 ? '😰' : confidence === 2 ? '😕' : confidence === 3 ? '🤔' : confidence === 4 ? '😊' : '🎉'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Not at all</span>
                        <span>Perfectly</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Study Tips */}
            <div className="ai-card ai-gradient-success text-white">
              <h3 className="text-lg font-semibold mb-3">🎯 Smart Learning Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Spaced Repetition</div>
                  <div className="text-xs text-green-100">Cards appear when you're about to forget them</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Active Recall</div>
                  <div className="text-xs text-green-100">Try to answer before revealing</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Honest Assessment</div>
                  <div className="text-xs text-green-100">Rate difficulty accurately for best results</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}