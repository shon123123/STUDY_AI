'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  FolderIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { documentService } from '../services/api'
import toast from 'react-hot-toast'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  status: 'processing' | 'ready' | 'error'
  tags: string[]
}

export default function StudyMaterials() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(false)
  const [quizModal, setQuizModal] = useState<{
    isOpen: boolean
    documentId: string
    documentName: string
  }>({ isOpen: false, documentId: '', documentName: '' })
  const [flashcardModal, setFlashcardModal] = useState<{
    isOpen: boolean
    documentId: string
    documentName: string
  }>({ isOpen: false, documentId: '', documentName: '' })
  const [quizOptions, setQuizOptions] = useState({
    numQuestions: 10,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  })
  const [flashcardOptions, setFlashcardOptions] = useState({
    numCards: 15
  })

  // Load documents on component mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await documentService.getDocuments()
      
      // Convert backend format to frontend format
      const mappedDocs: Document[] = response.map((doc: any) => ({
        id: doc.id || doc._id,
        name: doc.filename || doc.name,
        type: doc.file_type || 'application/octet-stream',
        size: doc.file_size || 0,
        uploadDate: doc.upload_date || new Date().toISOString(),
        status: doc.status === 'ready' ? 'ready' : 
                doc.processing_status === 'completed' ? 'ready' :
                doc.processing_status === 'failed' ? 'error' : 'processing',
        tags: []
      }))
      
      setDocuments(mappedDocs)
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const refreshDocumentStatus = async (documentId: string) => {
    try {
      const status = await documentService.getDocumentStatus(documentId)
      
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: status.status === 'ready' ? 'ready' : 
                      status.processing_status === 'completed' ? 'ready' :
                      status.processing_status === 'failed' ? 'error' : 'processing'
            }
          : doc
      ))
      
      if (status.status === 'ready' || status.processing_status === 'completed') {
        toast.success('Document processing completed!')
      }
    } catch (error) {
      console.error('Error refreshing status:', error)
      toast.error('Failed to refresh status')
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('📁 Files dropped:', acceptedFiles)
    
    for (const file of acceptedFiles) {
      console.log('📄 Processing file:', file.name, file.type, file.size)
      const tempId = Math.random().toString(36).substr(2, 9)
      
      // Add temporary document to UI
      const tempDoc: Document = {
        id: tempId,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        status: 'processing',
        tags: []
      }
      
      setDocuments(prev => [...prev, tempDoc])
      setUploadProgress(prev => ({ ...prev, [tempId]: 0 }))
      
      try {
        console.log('⬆️ Starting upload for:', file.name)
        // Upload to backend
        const uploadedDoc = await documentService.uploadDocument(file, (progress) => {
          console.log('📊 Upload progress:', progress)
          setUploadProgress(prev => ({ ...prev, [tempId]: progress }))
        })
        
        console.log('✅ Upload completed:', uploadedDoc)
        
        // Replace temp document with real one
        setDocuments(prev => prev.map(doc => 
          doc.id === tempId 
            ? {
                id: uploadedDoc.id,
                name: uploadedDoc.filename,
                type: uploadedDoc.file_type || file.type,
                size: uploadedDoc.file_size,
                uploadDate: uploadedDoc.upload_date,
                status: uploadedDoc.status === 'ready' ? 'ready' : 
                        uploadedDoc.processing_status === 'completed' ? 'ready' : 'processing',
                tags: []
              }
            : doc
        ))
        
        // Remove from upload progress
        setUploadProgress(prev => {
          const { [tempId]: removed, ...rest } = prev
          return rest
        })
        
        toast.success(`${file.name} uploaded successfully!`)
        
        // Poll for processing completion
        const pollProcessing = setInterval(async () => {
          try {
            const status = await documentService.getDocumentStatus(uploadedDoc.id)
            if (status.processing_status === 'completed' || status.status === 'ready') {
              clearInterval(pollProcessing)
              setDocuments(prev => prev.map(doc => 
                doc.id === uploadedDoc.id 
                  ? { ...doc, status: 'ready' }
                  : doc
              ))
              toast.success(`${file.name} processing completed!`)
            } else if (status.processing_status === 'failed') {
              clearInterval(pollProcessing)
              setDocuments(prev => prev.map(doc => 
                doc.id === uploadedDoc.id 
                  ? { ...doc, status: 'error' }
                  : doc
              ))
              toast.error(`${file.name} processing failed`)
            }
          } catch (error) {
            console.error('Error checking status:', error)
            clearInterval(pollProcessing)
          }
        }, 3000)
        
      } catch (error) {
        console.error('❌ Upload error:', error)
        toast.error(`Failed to upload ${file.name}`)
        
        // Remove failed upload
        setDocuments(prev => prev.filter(doc => doc.id !== tempId))
        setUploadProgress(prev => {
          const { [tempId]: removed, ...rest } = prev
          return rest
        })
      }
    }
  }, [])

  const handleDeleteDocument = async (id: string) => {
    try {
      await documentService.deleteDocument(id)
      setDocuments(prev => prev.filter(doc => doc.id !== id))
      setUploadProgress(prev => {
        const { [id]: removed, ...rest } = prev
        return rest
      })
      toast.success('Document deleted successfully')
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const generateQuiz = async (documentId: string) => {
    try {
      toast.loading('Generating quiz...', { id: 'quiz-gen' })
      
      // Call the backend to generate quiz
      const response = await fetch(`http://localhost:8000/api/documents/${documentId}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num_questions: quizOptions.numQuestions,
          difficulty: quizOptions.difficulty
        })
      })
      
      if (response.ok) {
        const quiz = await response.json()
        toast.success('Quiz generated successfully!', { id: 'quiz-gen' })
        setQuizModal({ isOpen: false, documentId: '', documentName: '' })
        // Optionally redirect to quiz page or show quiz modal
      } else {
        throw new Error('Failed to generate quiz')
      }
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast.error('Failed to generate quiz', { id: 'quiz-gen' })
    }
  }

  const createFlashcards = async (documentId: string) => {
    try {
      toast.loading('Creating flashcards...', { id: 'flashcard-gen' })
      
      const response = await fetch(`http://localhost:8000/api/documents/${documentId}/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num_cards: flashcardOptions.numCards
        })
      })
      
      if (response.ok) {
        const flashcards = await response.json()
        toast.success('Flashcards created successfully!', { id: 'flashcard-gen' })
        setFlashcardModal({ isOpen: false, documentId: '', documentName: '' })
        // Optionally redirect to flashcards page
      } else {
        throw new Error('Failed to create flashcards')
      }
    } catch (error) {
      console.error('Error creating flashcards:', error)
      toast.error('Failed to create flashcards', { id: 'flashcard-gen' })
    }
  }

  const openQuizModal = (documentId: string, documentName: string) => {
    setQuizModal({ isOpen: true, documentId, documentName })
  }

  const openFlashcardModal = (documentId: string, documentName: string) => {
    setFlashcardModal({ isOpen: true, documentId, documentName })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => {
      console.log('🎯 Drag enter')
    },
    onDragLeave: () => {
      console.log('🎯 Drag leave')
    },
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/markdown': ['.md']
    }
  })

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || doc.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'text-yellow-400 bg-yellow-400/10'
      case 'ready': return 'text-green-400 bg-green-400/10'
      case 'error': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Study Materials</h1>
          <p className="text-gray-400">Upload and manage your learning documents</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadDocuments}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200">
            <PlusIcon className="h-4 w-4" />
            <span>Add Folder</span>
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        onClick={(e) => {
          console.log('🖱️ Upload area clicked!', e)
        }}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragActive 
            ? 'border-primary-500 bg-primary-500/10' 
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
          }
        `}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          {isDragActive ? 'Drop files here' : 'Upload Study Materials'}
        </h3>
        <p className="text-gray-400 mb-4">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Supports: PDF, DOCX, DOC, TXT, MD files
        </p>
        
        {/* Backup Manual Upload Button */}
        <div className="mt-4">
          <input
            type="file"
            id="manual-upload"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={async (e) => {
              const files = e.target.files
              if (files && files.length > 0) {
                console.log('📁 Manual file selected:', files[0])
                onDrop(Array.from(files))
              }
            }}
          />
          <label
            htmlFor="manual-upload"
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Browse Files
          </label>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No documents uploaded</h3>
          <p className="text-gray-500">Upload your first document to get started with AI-powered learning</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200">
              {/* Document Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{doc.name}</h3>
                    <p className="text-xs text-gray-400">{formatFileSize(doc.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Status and Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                    {doc.status === 'processing' && (
                      <button
                        onClick={() => refreshDocumentStatus(doc.id)}
                        className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700 transition-colors duration-200"
                        title="Refresh status"
                      >
                        <ArrowPathIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                
                {doc.status === 'processing' && uploadProgress[doc.id] !== undefined && (
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress[doc.id]}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button 
                  disabled={doc.status !== 'ready'}
                  onClick={() => openQuizModal(doc.id, doc.name)}
                  className={`
                    w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${doc.status === 'ready' 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  Generate Quiz
                </button>
                <button 
                  disabled={doc.status !== 'ready'}
                  onClick={() => openFlashcardModal(doc.id, doc.name)}
                  className={`
                    w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${doc.status === 'ready' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  Create Flashcards
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Generation Modal */}
      {quizModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Generate Quiz</h3>
            <p className="text-gray-400 mb-4">Create a quiz from: {quizModal.documentName}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Questions
                </label>
                <select
                  value={quizOptions.numQuestions}
                  onChange={(e) => setQuizOptions(prev => ({ ...prev, numQuestions: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={25}>25 Questions</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={quizOptions.difficulty}
                  onChange={(e) => setQuizOptions(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setQuizModal({ isOpen: false, documentId: '', documentName: '' })}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => generateQuiz(quizModal.documentId)}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
              >
                Generate Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flashcard Generation Modal */}
      {flashcardModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create Flashcards</h3>
            <p className="text-gray-400 mb-4">Create flashcards from: {flashcardModal.documentName}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Flashcards
                </label>
                <select
                  value={flashcardOptions.numCards}
                  onChange={(e) => setFlashcardOptions(prev => ({ ...prev, numCards: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 Cards</option>
                  <option value={15}>15 Cards</option>
                  <option value={20}>20 Cards</option>
                  <option value={25}>25 Cards</option>
                  <option value={30}>30 Cards</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setFlashcardModal({ isOpen: false, documentId: '', documentName: '' })}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => createFlashcards(flashcardModal.documentId)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Create Flashcards
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}