'use client'

import { useState, useRef, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

const API_BASE_URL = 'http://localhost:8000'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  processed: boolean
  summary: string
  flashcards: number
  questions: number
  processing_status?: string
  error?: string
  progress?: Array<{timestamp: string, message: string}>
  analysisResults?: Array<any>
  streamingFlashcards?: Array<any>
  processedPages?: number
  totalPages?: number
}

export default function StudyMaterialsPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [processingFile, setProcessingFile] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [autoProcess, setAutoProcess] = useState(false) // New option for auto-processing
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing documents on mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setIsLoadingDocuments(true)
    try {
      console.log('🔄 Loading documents from backend...')
      const response = await fetch(`${API_BASE_URL}/api/documents`)
      console.log('📡 Response status:', response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Received data:', data)
        console.log('📁 Number of documents:', data.documents?.length || 0)
        
        if (!data.documents || !Array.isArray(data.documents)) {
          console.error('❌ Invalid response format - documents is not an array')
          setUploadedFiles([])
          return
        }
        
        const formattedFiles = data.documents.map((doc: any) => ({
          id: doc.id,
          name: doc.filename,
          type: doc.file_type?.includes('presentation') ? 'presentation' : 'document',
          size: formatFileSize(doc.file_size || 0),
          uploadDate: doc.upload_date ? new Date(doc.upload_date).toISOString().split('T')[0] : 'Unknown',
          processed: doc.processed || false,
          summary: doc.summary || "",
          flashcards: doc.flashcard_count || 0,
          questions: doc.question_count || 0,
          processing_status: doc.processing_status || 'unknown',
          error: doc.error
        }))
        
        console.log('✅ Formatted files:', formattedFiles)
        setUploadedFiles(formattedFiles)
      } else {
        console.error('❌ Failed to load documents - Response not OK')
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('❌ Failed to load documents:', error)
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB'
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return
    setUploadError(null)
    setIsUploading(true)
    
    const files = Array.from(event.target.files)
    
    for (const file of files) {
      try {
        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        
        // Use simple upload or streaming based on user preference
        const endpoint = autoProcess 
          ? `${API_BASE_URL}/api/documents/upload-streaming`
          : `${API_BASE_URL}/api/documents/upload`
        
        const uploadResponse = await fetch(endpoint, {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.detail || 'Upload failed')
        }
        
        const uploadData = await uploadResponse.json()
        
        console.log('✅ Upload successful! Document ID:', uploadData.document_id)
        console.log('📦 Upload response:', uploadData)
        
        // Reload documents from backend to get the actual stored data
        await loadDocuments()
        
        if (autoProcess) {
          setProcessingFile(uploadData.document_id)
          // Start polling for streaming progress
          pollProcessingStatus(uploadData.document_id)
        }
        pollStreamingProgress(uploadData.document_id)
        
      } catch (error: any) {
        console.error('Upload error:', error)
        setUploadError(error.message || 'Failed to upload file')
      }
    }
    
    setIsUploading(false)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      // Create a synthetic event for handleFileUpload
      const syntheticEvent = {
        target: { files: files }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      
      handleFileUpload(syntheticEvent)
    }
  }

  const processDocument = async (documentId: string) => {
    try {
      setProcessingFile(documentId)
      
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/process`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Processing failed')
      }
      
      const result = await response.json()
      
      // Update file status
      setUploadedFiles(prev => prev.map(file => 
        file.id === documentId 
          ? { 
              ...file, 
              processed: true, 
              processing_status: 'completed',
              summary: result.summary || 'Processing completed',
              flashcards: result.flashcards || 0,
              processedPages: result.processed_pages || 0,
              totalPages: result.total_pages || 0
            }
          : file
      ))
      
    } catch (error) {
      console.error('Processing failed:', error)
      setUploadError(error instanceof Error ? error.message : 'Processing failed')
      
      // Update file status to show error
      setUploadedFiles(prev => prev.map(file => 
        file.id === documentId 
          ? { ...file, processing_status: 'failed', error: error instanceof Error ? error.message : 'Processing failed' }
          : file
      ))
    } finally {
      setProcessingFile(null)
    }
  }

  const pollProcessingStatus = async (documentId: string) => {
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max
    
    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/status`)
        if (response.ok) {
          const data = await response.json()
          
          setUploadedFiles(prev => prev.map(f =>
            f.id === documentId ? {
              ...f,
              processed: data.processed,
              summary: data.analysis?.summary || data.final_summary || f.summary,
              flashcards: data.flashcards?.length || f.flashcards,
              questions: data.analysis_results?.length || f.questions,
              processing_status: data.processing_status,
              progress: data.progress || f.progress,
              analysisResults: data.analysis_results || f.analysisResults,
              streamingFlashcards: data.flashcards || f.streamingFlashcards,
              processedPages: data.processed_pages || f.processedPages,
              totalPages: data.total_pages || f.totalPages,
              error: data.error
            } : f
          ))

          if (data.processed || data.processing_status === 'completed' || data.processing_status === 'failed') {
            setProcessingFile(null)
            return
          }
        }
        
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          // Timeout - update status
          setUploadedFiles(prev => prev.map(f =>
            f.id === documentId ? {
              ...f,
              processing_status: 'timeout',
              error: 'Processing timeout'
            } : f
          ))
          setProcessingFile(null)
        }
      } catch (error) {
        console.error('Polling error:', error)
        setProcessingFile(null)
      }
    }
    
    poll()
  }

  const pollStreamingProgress = async (documentId: string) => {
    const maxAttempts = 120 // Poll for up to 10 minutes for streaming
    let attempts = 0
    
    const interval = setInterval(async () => {
      attempts++
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/progress`)
        if (response.ok) {
          const data = await response.json()
          
          // Update the file in state with streaming data
          setUploadedFiles(prev => prev.map(f => 
            f.id === documentId 
              ? {
                  ...f,
                  processed: data.status === 'completed',
                  summary: data.final_summary || f.summary,
                  flashcards: data.flashcards?.length || f.flashcards,
                  questions: data.analysis_results?.length || f.questions,
                  processing_status: data.status,
                  progress: data.progress || f.progress,
                  analysisResults: data.analysis_results || f.analysisResults,
                  streamingFlashcards: data.flashcards || f.streamingFlashcards,
                  processedPages: data.processed_pages || data.processed_slides || f.processedPages,
                  totalPages: data.total_pages || data.total_slides || f.totalPages,
                  error: data.error
                }
              : f
          ))
          
          // Stop polling if completed or error
          if (data.status === 'completed' || data.status === 'error' || data.error) {
            clearInterval(interval)
            setProcessingFile(null)
          }
        }
      } catch (error) {
        console.error('Streaming progress check error:', error)
      }
      
      // Stop after max attempts
      if (attempts >= maxAttempts) {
        clearInterval(interval)
        setProcessingFile(null)
      }
    }, 1000) // Poll every 1 second for real-time updates
  }

  const getFileIcon = (type: string) => {
    return type === 'presentation' ? '📊' : '📄'
  }

  const getStatusBadge = (file: UploadedFile) => {
    if (file.error) {
      return <span className="ai-badge bg-red-100 text-red-800">❌ Error</span>
    }
    if (processingFile === file.id || file.processing_status === 'processing') {
      return <span className="ai-badge bg-blue-100 text-blue-800">🔄 Processing...</span>
    }
    return file.processed 
      ? <span className="ai-badge ai-badge-active">✅ Ready</span>
      : <span className="ai-badge bg-orange-100 text-orange-800">⏳ Queued</span>
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      console.log('🗑️ Attempting to delete document:', documentId)
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
        method: 'DELETE'
      })
      
      console.log('📡 Delete response status:', response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Delete successful:', data)
        // Reload documents to sync with backend
        await loadDocuments()
        alert('✅ Document deleted successfully!')
      } else {
        const errorText = await response.text()
        console.error('❌ Delete failed:', response.status, errorText)
        
        if (response.status === 404) {
          alert(`⚠️ Document Not Found in Backend\n\nThis document doesn't exist in backend storage. This happens when:\n\n1. Upload failed silently\n2. Backend was restarted (in-memory storage cleared)\n3. Document has "Queued" status (not actually uploaded)\n\nClick the 🔄 Refresh button to sync with backend and remove invalid entries.`)
          // Reload to remove the phantom document
          await loadDocuments()
        } else {
          alert(`Failed to delete document: ${response.status}\n${errorText}`)
        }
      }
    } catch (error) {
      console.error('❌ Delete error:', error)
      alert(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleGenerateFlashcards = async (documentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/flashcards`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`Generated ${data.flashcards.length} flashcards!`)
        loadDocuments() // Refresh the list
      } else {
        alert('Failed to generate flashcards')
      }
    } catch (error) {
      console.error('Flashcard generation error:', error)
      alert('Failed to generate flashcards')
    }
  }

  const handleGenerateQuiz = async (documentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ num_questions: 10 })
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`Generated quiz with ${data.questions.length} questions!`)
        loadDocuments() // Refresh the list
      } else {
        alert('Failed to generate quiz')
      }
    } catch (error) {
      console.error('Quiz generation error:', error)
      alert('Failed to generate quiz')
    }
  }

  // Render component
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Sidebar />
      <TopBar />
      
      <main className="md:pl-64 pt-16 h-full overflow-auto">
        <div className="w-full px-8 py-8">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload PowerPoint presentations, PDFs, Word documents, and text files
            </p>
            
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button 
                onClick={loadDocuments}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium flex items-center space-x-2"
                title="Refresh document list"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium flex items-center space-x-2 whitespace-nowrap"
              >
                <span>📤</span>
                <span>Upload Documents</span>
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.pptm,.potx,.potm"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload Error */}
          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between shadow-sm animate-pulse">
              <div className="flex items-center space-x-2">
                <span className="text-red-600 dark:text-red-400">❌</span>
                <span className="text-red-800 dark:text-red-200 font-medium">{uploadError}</span>
              </div>
              <button 
                onClick={() => setUploadError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"></div>
                <span className="text-blue-800 dark:text-blue-200 font-medium">Uploading files...</span>
              </div>
            </div>
          )}

          {/* Enhanced Upload Zone for PowerPoint */}
          {uploadedFiles.length === 0 && (
            <div className="mb-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-50 scale-105' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="text-6xl mb-4">
                  {isDragOver ? '📥' : '📊'}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {isDragOver ? 'Drop Your Files Here!' : 'Upload Your PowerPoint & Documents'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isDragOver 
                    ? 'Release to upload your files' 
                    : 'Drag & drop your PPT, PDF, Word, or text files here, or click to browse'
                  }
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">📊 PowerPoint (.ppt, .pptx)</span>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">📄 PDF</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">📝 Word (.doc, .docx)</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">📃 Text</span>
                </div>
                <button className="ai-button-primary inline-flex items-center">
                  <span className="mr-2">📤</span>
                  Choose Files to Upload
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="ai-card ai-hover-lift ai-gradient-primary text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">🤖 AI Summarizer</h3>
                  <p className="text-blue-100 text-sm">Extract key insights from any document</p>
                </div>
                <div className="text-3xl animate-bounce">📝</div>
              </div>
              <button className="mt-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105">
                Start Summarizing
              </button>
            </div>
            
            <div className="ai-card ai-hover-lift ai-gradient-success text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">🧠 Smart Flashcards</h3>
                  <p className="text-green-100 text-sm">Auto-generated with spaced repetition</p>
                </div>
                <div className="text-3xl animate-pulse">🔄</div>
              </div>
              <button className="mt-4 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105">
                Create Flashcards
              </button>
            </div>
            
            <div className="ai-card ai-hover-lift ai-gradient-warning text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">❓ Question Generator</h3>
                  <p className="text-orange-100 text-sm">Custom quizzes from your content</p>
                </div>
                <div className="text-3xl animate-bounce">🎯</div>
              </div>
              <button className="mt-4 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105">
                Generate Quiz
              </button>
            </div>
          </div>

          {/* Uploaded Files */}
          <div className="ai-card dark:bg-gray-800 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="ai-card-header dark:border-gray-700">
              <h3 className="ai-card-title dark:text-white">Your Study Materials</h3>
              <div className="flex items-center gap-3">
                {isLoadingDocuments ? (
                  <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"></div>
                    Loading...
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{uploadedFiles.length} files</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full shadow-sm" title="Documents are stored in backend memory">
                      💾 Stored in Backend
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {isLoadingDocuments ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your documents...</p>
              </div>
            ) : (
              <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    {/* File Info */}
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{getFileIcon(file.type)}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{file.name}</h4>
                        <p className="text-sm text-gray-500">
                          {file.size} • Uploaded {file.uploadDate}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(file)}
                      
                      {file.processed && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>🗂️ {file.flashcards} cards</span>
                          <span>❓ {file.questions} questions</span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        {file.processed && (
                          <>
                            <button 
                              onClick={() => handleGenerateFlashcards(file.id)}
                              className="ai-button ai-button-small ai-button-secondary"
                              title="Generate flashcards from this document"
                            >
                              🧠 Flashcards
                            </button>
                            <button 
                              onClick={() => handleGenerateQuiz(file.id)}
                              className="ai-button ai-button-small ai-button-secondary"
                              title="Generate quiz from this document"
                            >
                              🎯 Quiz
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDelete(file.id)}
                          className="ai-button ai-button-small bg-red-50 text-red-600 hover:bg-red-100"
                          title="Delete this document"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {file.error && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-900 mb-1">Error:</p>
                      <p className="text-sm text-red-800">{file.error}</p>
                    </div>
                  )}

                  {/* Summary Preview */}
                  {file.processed && file.summary && !file.error && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">AI Summary:</p>
                      <p className="text-sm text-blue-800">{file.summary}</p>
                    </div>
                  )}
                  
                  {/* Streaming Progress Display */}
                  {(processingFile === file.id || file.processing_status === 'streaming' || file.processing_status === 'processing') && !file.error && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      {/* Progress Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          <span className="text-sm font-medium text-blue-900">🤖 Gemini AI Processing</span>
                        </div>
                        {file.totalPages && file.totalPages > 0 && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {file.processedPages || 0}/{file.totalPages} {file.type === 'presentation' ? 'slides' : 'pages'}
                          </span>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {file.totalPages && file.totalPages > 0 && (
                        <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((file.processedPages || 0) / file.totalPages) * 100}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {/* Latest Progress Message */}
                      {file.progress && file.progress.length > 0 && (
                        <div className="text-sm text-blue-800 mb-2">
                          {file.progress[file.progress.length - 1]?.message}
                        </div>
                      )}
                      
                      {/* Real-time Flashcard Count */}
                      {file.streamingFlashcards && file.streamingFlashcards.length > 0 && (
                        <div className="flex items-center space-x-4 text-xs text-blue-600">
                          <span>🧠 {file.streamingFlashcards.length} flashcards created</span>
                          {file.analysisResults && file.analysisResults.length > 0 && (
                            <span>📊 {file.analysisResults.length} sections analyzed</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Streaming Analysis Results Display */}
                  {file.analysisResults && file.analysisResults.length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-purple-900 flex items-center">
                          📊 Content Analysis
                          <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                            {file.analysisResults.length} sections
                          </span>
                        </h4>
                        {file.processing_status === 'streaming' && (
                          <div className="animate-pulse text-xs text-purple-600">Live updating...</div>
                        )}
                      </div>
                      
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {file.analysisResults.slice(-2).map((analysis: any, index: number) => (
                          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm">
                            {analysis.page && (
                              <div className="text-xs text-purple-600 dark:text-purple-400 mb-2 font-medium">
                                📄 {file.type === 'presentation' ? 'Slide' : 'Page'} {analysis.page}
                              </div>
                            )}
                            {analysis.summary && (
                              <div className="mb-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Summary:</div>
                                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                  {analysis.summary}
                                </div>
                              </div>
                            )}
                            {analysis.key_points && analysis.key_points.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-gray-900 mb-1">Key Points:</div>
                                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                  {analysis.key_points.slice(0, 3).map((point: string, i: number) => (
                                    <li key={i} className="flex items-start">
                                      <span className="text-purple-500 dark:text-purple-400 mr-2">•</span>
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                  {analysis.key_points.length > 3 && (
                                    <li className="text-purple-600 dark:text-purple-400 text-xs">... and {analysis.key_points.length - 3} more points</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                        {file.analysisResults.length > 2 && (
                          <div className="text-center py-2 text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            ... and {file.analysisResults.length - 2} more analyzed sections
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Streaming Flashcards Display */}
                  {file.streamingFlashcards && file.streamingFlashcards.length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-green-900 flex items-center">
                          🧠 Generated Flashcards
                          <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                            {file.streamingFlashcards.length} cards
                          </span>
                        </h4>
                        {file.processing_status === 'streaming' && (
                          <div className="animate-pulse text-xs text-green-600">Live updating...</div>
                        )}
                      </div>
                      
                      <div className="grid gap-3 max-h-64 overflow-y-auto">
                        {file.streamingFlashcards.slice(-3).map((flashcard: any, index: number) => (
                          <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Q: {flashcard.question}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              A: {flashcard.answer}
                            </div>
                            {flashcard.page && (
                              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                                From {file.type === 'presentation' ? 'slide' : 'page'} {flashcard.page}
                              </div>
                            )}
                          </div>
                        ))}
                        {file.streamingFlashcards.length > 3 && (
                          <div className="text-center py-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            ... and {file.streamingFlashcards.length - 3} more flashcards
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoadingDocuments && uploadedFiles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No study materials yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload your presentations, PDFs, or documents to get started
                </p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="ai-button-primary"
                >
                  <span className="mr-2">📤</span>
                  Upload Your First File
                </button>
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
  )
}