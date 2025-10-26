'use client'

import React, { useState, useEffect } from 'react'
import {
  PlusIcon,
  PlayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  FolderIcon,
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: 'easy' | 'medium' | 'hard'
  lastReviewed?: Date
  nextReview?: Date
  mastered: boolean
  deck: string
  tags: string[]
}

interface Deck {
  id: string
  name: string
  description: string
  cardCount: number
  createdAt: Date
  color: string
}

export default function Flashcards() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(false)

  // Load flashcards from backend on component mount
  useEffect(() => {
    loadFlashcards()
  }, [])

  const loadFlashcards = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/flashcards/due')
      
      if (response.ok) {
        const data = await response.json()
        const backendFlashcards = data.flashcards || []
        
        // Convert backend format to frontend format
        const mappedFlashcards: Flashcard[] = backendFlashcards.map((card: any) => ({
          id: card.id,
          front: card.front,
          back: card.back,
          difficulty: card.difficulty === 1 || card.difficulty === 2 ? 'easy' : 
                     card.difficulty === 3 ? 'medium' : 'hard',
          lastReviewed: card.last_reviewed ? new Date(card.last_reviewed) : undefined,
          nextReview: card.next_review ? new Date(card.next_review) : new Date(),
          mastered: card.confidence_level >= 4,
          deck: card.topic || card.document_id || 'General',
          tags: card.tags || []
        }))
        
        setFlashcards(mappedFlashcards)
        
        // Group flashcards into decks
        const deckMap = new Map<string, Deck>()
        mappedFlashcards.forEach(card => {
          if (!deckMap.has(card.deck)) {
            deckMap.set(card.deck, {
              id: card.deck,
              name: card.deck,
              description: `Flashcards from ${card.deck}`,
              cardCount: 0,
              createdAt: new Date(),
              color: 'bg-blue-500'
            })
          }
          const deck = deckMap.get(card.deck)!
          deck.cardCount++
        })
        
        setDecks(Array.from(deckMap.values()))
        
        if (mappedFlashcards.length > 0) {
          toast.success(`Loaded ${mappedFlashcards.length} flashcards`)
        }
      } else {
        throw new Error('API response not ok')
      }
    } catch (error) {
      console.error('Error loading flashcards:', error)
      // Fallback to sample data if API fails
      loadSampleData()
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    // Fallback sample data with dynamic dates
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    setDecks([
      {
        id: '1',
        name: 'Study Materials',
        description: 'Generated from your uploaded documents',
        cardCount: 2,
        createdAt: today,
        color: 'bg-blue-500'
      }
    ])

    setFlashcards([
      {
        id: '1',
        front: 'What is the main purpose of state management in React?',
        back: 'State management allows components to manage and update their internal data, triggering re-renders when the state changes.',
        difficulty: 'medium',
        lastReviewed: yesterday,
        nextReview: tomorrow,
        mastered: false,
        deck: 'Study Materials',
        tags: ['react', 'state']
      },
      {
        id: '2',
        front: 'Explain the difference between props and state in React',
        back: 'Props are immutable data passed from parent to child components, while state is mutable data managed within a component.',
        difficulty: 'easy',
        lastReviewed: yesterday,
        nextReview: today,
        mastered: true,
        deck: 'Study Materials',
        tags: ['react', 'props', 'state']
      }
    ])
  }

  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [studyMode, setStudyMode] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const startStudySession = (deck: Deck) => {
    setSelectedDeck(deck)
    const deckCards = flashcards.filter(card => card.deck === deck.name)
    if (deckCards.length > 0) {
      setCurrentCardIndex(0)
      setShowAnswer(false)
      setStudyMode(true)
    }
  }

  const endStudySession = () => {
    setStudyMode(false)
    setSelectedDeck(null)
    setCurrentCardIndex(0)
    setShowAnswer(false)
  }

  const nextCard = () => {
    if (selectedDeck) {
      const deckCards = flashcards.filter(card => card.deck === selectedDeck.name)
      if (currentCardIndex < deckCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1)
        setShowAnswer(false)
      } else {
        endStudySession()
      }
    }
  }

  const markCardDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (selectedDeck) {
      const deckCards = flashcards.filter(card => card.deck === selectedDeck.name)
      const currentCard = deckCards[currentCardIndex]
      
      setFlashcards(prev => prev.map(card => 
        card.id === currentCard.id 
          ? { 
              ...card, 
              difficulty, 
              lastReviewed: new Date(),
              nextReview: new Date(Date.now() + (difficulty === 'easy' ? 7 : difficulty === 'medium' ? 3 : 1) * 24 * 60 * 60 * 1000)
            }
          : card
      ))
      
      nextCard()
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const stats = [
    {
      title: 'Total Cards',
      value: flashcards.length,
      icon: AcademicCapIcon,
      color: 'text-blue-400'
    },
    {
      title: 'Due Today',
      value: flashcards.filter(card => 
        card.nextReview && card.nextReview <= new Date()
      ).length,
      icon: ClockIcon,
      color: 'text-orange-400'
    },
    {
      title: 'Mastered',
      value: flashcards.filter(card => card.mastered).length,
      icon: StarIcon,
      color: 'text-green-400'
    },
    {
      title: 'Review Rate',
      value: `${Math.round((flashcards.filter(card => card.mastered).length / flashcards.length) * 100)}%`,
      icon: ChartBarIcon,
      color: 'text-purple-400'
    }
  ]

  if (studyMode && selectedDeck) {
    const deckCards = flashcards.filter(card => card.deck === selectedDeck.name)
    const currentCard = deckCards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / deckCards.length) * 100

    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Study Header */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">{selectedDeck.name}</h1>
              <button 
                onClick={endStudySession}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                End Session
              </button>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
              <span>Card {currentCardIndex + 1} of {deckCards.length}</span>
              <span>• {selectedDeck.description}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Flashcard */}
          <div className="perspective-1000">
            <div 
              className={`
                relative w-full h-96 transition-transform duration-600 transform-style-preserve-3d cursor-pointer
                ${showAnswer ? 'rotate-y-180' : ''}
              `}
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {/* Front of card */}
              <div className="absolute inset-0 w-full h-full bg-gray-800 rounded-xl border border-gray-700 backface-hidden">
                <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                  <h2 className="text-2xl font-semibold text-white mb-4">Question</h2>
                  <p className="text-lg text-gray-300 leading-relaxed">{currentCard.front}</p>
                  <div className="mt-6 text-sm text-gray-500">
                    Click to reveal answer
                  </div>
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 w-full h-full bg-gray-800 rounded-xl border border-gray-700 backface-hidden rotate-y-180">
                <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                  <h2 className="text-2xl font-semibold text-white mb-4">Answer</h2>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">{currentCard.back}</p>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(currentCard.difficulty)}`}>
                    {currentCard.difficulty.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Study Controls */}
          {showAnswer && (
            <div className="mt-6 flex justify-center space-x-4">
              <button 
                onClick={() => markCardDifficulty('hard')}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Hard</span>
              </button>
              
              <button 
                onClick={() => markCardDifficulty('medium')}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Medium</span>
              </button>
              
              <button 
                onClick={() => markCardDifficulty('easy')}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <CheckIcon className="h-4 w-4" />
                <span>Easy</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Flashcards</h1>
          <p className="text-gray-400">Review and master your study materials</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Deck</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <div key={deck.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200">
            {/* Deck Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${deck.color} rounded-lg flex items-center justify-center`}>
                  <FolderIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{deck.name}</h3>
                  <p className="text-sm text-gray-400">{deck.cardCount} cards</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-4">{deck.description}</p>

            {/* Deck Stats */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Due today:</span>
                <span className="text-orange-400">
                  {flashcards.filter(card => 
                    card.deck === deck.name && 
                    card.nextReview && 
                    card.nextReview <= new Date()
                  ).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Mastered:</span>
                <span className="text-green-400">
                  {flashcards.filter(card => card.deck === deck.name && card.mastered).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Created:</span>
                <span className="text-gray-400">{deck.createdAt.toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button 
                onClick={() => startStudySession(deck)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
              >
                <PlayIcon className="h-4 w-4" />
                <span>Study Now</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200">
                <PlusIcon className="h-4 w-4" />
                <span>Add Cards</span>
              </button>
            </div>
          </div>
        ))}

        {/* Empty state or add new deck */}
        <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-gray-500 transition-colors duration-200 cursor-pointer">
          <PlusIcon className="h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Create New Deck</h3>
          <p className="text-sm text-gray-500">Start building your flashcard collection</p>
        </div>
      </div>
    </div>
  )
}