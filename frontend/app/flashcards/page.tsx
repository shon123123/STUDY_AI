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
  const [viewMode, setViewMode] = useState<'study' | 'browse'>('browse')
  const [flashcardsByDoc, setFlashcardsByDoc] = useState<Record<string, Flashcard[]>>({})

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
        const allCards = data.flashcards || []
        setFlashcards(allCards)
        
        // Group flashcards by document
        const grouped: Record<string, Flashcard[]> = {}
        allCards.forEach((card: Flashcard) => {
          if (!grouped[card.document_id]) {
            grouped[card.document_id] = []
          }
          grouped[card.document_id].push(card)
        })
        setFlashcardsByDoc(grouped)
        
        if (allCards.length > 0) {
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
        await loadFlashcards()
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

  const startStudyingDocument = (docId: string) => {
    const docCards = flashcardsByDoc[docId] || []
    setFlashcards(docCards)
    setCurrentCard(0)
    setShowAnswer(false)
    setViewMode('study')
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

  const goToNextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(prev => prev + 1)
      setShowAnswer(false)
    }
  }

  const goToPrevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(prev => prev - 1)
      setShowAnswer(false)
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold dark:text-white">📝 Generate Flashcards</h3>
                <button
                  onClick={() => setShowGenerator(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="mb-2">📄 No documents uploaded yet</p>
                  <p className="text-sm">Upload documents in the Materials section first</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Select a document to generate flashcards from:
                  </p>
                  {documents.map(doc => (
                    <div 
                      key={doc.id}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            📄 {doc.filename}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.processed ? '✓ Processed' : '⏳ Processing...'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDocument(doc.id)
                            generateFlashcards()
                          }}
                          disabled={loading || !doc.processed}
                          className="ai-button-primary px-4 py-2 disabled:opacity-50"
                        >
                          {loading && selectedDocument === doc.id ? '⏳ Generating...' : '✨ Generate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!showGenerator && flashcards.length === 0 && (
            <div className="ai-card dark:bg-gray-800 dark:border-gray-700 text-center mb-6">
              <div className="text-6xl mb-4">🎴</div>
              <h3 className="text-xl font-bold dark:text-white mb-2">No Flashcards Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Generate AI-powered flashcards from your documents</p>
              <button
                onClick={() => setShowGenerator(true)}
                className="ai-button-primary"
              >
                📝 Generate Flashcards
              </button>
            </div>
          )}

          {!showGenerator && flashcards.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('browse')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'browse'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  📚 Browse by Document
                </button>
                <button
                  onClick={() => setViewMode('study')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'study'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  🎯 Study Mode
                </button>
              </div>
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

          {/* Browse by Document View */}
          {viewMode === 'browse' && !showGenerator && Object.keys(flashcardsByDoc).length > 0 && (
            <div className="max-w-4xl mx-auto mb-8">
              <h2 className="text-2xl font-bold dark:text-white mb-6">📚 Flashcards by Document</h2>
              <div className="space-y-4">
                {Object.entries(flashcardsByDoc).map(([docId, cards]) => {
                  const doc = documents.find(d => d.id === docId)
                  return (
                    <div 
                      key={docId}
                      className="ai-card dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold dark:text-white mb-2">
                            📄 {doc?.filename || 'Unknown Document'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cards.length} flashcard{cards.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                        <button
                          onClick={() => startStudyingDocument(docId)}
                          className="ai-button-primary px-6 py-3"
                        >
                          🎯 Study Now
                        </button>
                      </div>
                      
                      {/* Preview of flashcards */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                        <div className="space-y-2">
                          {cards.slice(0, 3).map((card, idx) => (
                            <div key={card.id} className="text-sm text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-blue-500">
                              {idx + 1}. {card.front.substring(0, 80)}{card.front.length > 80 ? '...' : ''}
                            </div>
                          ))}
                          {cards.length > 3 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                              + {cards.length - 3} more flashcards
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Flashcard Study Interface */}
          {viewMode === 'study' && !showGenerator && flashcards.length > 0 && (
            <div className="max-w-4xl mx-auto">
            <div className="ai-card dark:bg-gray-800 dark:border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Card {currentCard + 1} of {flashcards.length}
                  </span>
                  <span className={getDifficultyColor(flashcards[currentCard]?.difficulty || 3)}>
                    {getDifficultyLabel(flashcards[currentCard]?.difficulty || 3)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Topic: {flashcards[currentCard]?.topic || 'General'}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
                ></div>
              </div>

              {/* Card Content */}
              <div className="min-h-[300px] flex flex-col justify-center">
                <div className="text-center mb-8">
                  <div className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-4">
                    {showAnswer ? 'Answer:' : 'Question:'}
                  </div>
                  <div className="text-xl text-gray-900 dark:text-white leading-relaxed">
                    {showAnswer 
                      ? flashcards[currentCard]?.back 
                      : flashcards[currentCard]?.front
                    }
                  </div>
                </div>

                {/* Navigation and Action Buttons */}
                <div className="space-y-4">
                  {!showAnswer ? (
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="ai-button-primary px-8 py-3 text-lg"
                      >
                        Show Answer
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-center text-gray-600 dark:text-gray-400 mb-4">How well did you know this?</p>
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
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {confidence === 1 ? '😰' : confidence === 2 ? '😕' : confidence === 3 ? '🤔' : confidence === 4 ? '😊' : '🎉'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>Not at all</span>
                        <span>Perfectly</span>
                      </div>
                    </div>
                  )}

                  {/* Manual Navigation */}
                  <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={goToPrevCard}
                      disabled={currentCard === 0}
                      className="ai-button px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={goToNextCard}
                      disabled={currentCard === flashcards.length - 1}
                      className="ai-button px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Tips */}
            <div className="ai-card dark:bg-gray-800 dark:border-gray-700">
              <div className="ai-gradient-success text-white p-6 rounded-lg">
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
          )}
        </div>
      </main>
    </div>
  )
}