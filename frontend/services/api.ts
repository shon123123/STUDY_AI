// Backend API Integration Services

const API_BASE_URL = 'http://localhost:8000/api'

// Backend Document Types
interface BackendDocument {
  id: string
  filename: string
  file_type: string
  file_size: number
  upload_date: string
  processed: boolean
  processing_status: 'processing' | 'completed' | 'failed'
  status: 'processing' | 'ready' | 'failed'
  summary?: string
  flashcard_count?: number
  question_count?: number
  content?: string
  flashcards?: any[]
  questions?: any[]
  error?: string
}

interface UploadResponse {
  message: string
  document_id: string
  filename: string
  status: string
  estimated_time: string
}

// Document Service
export const documentService = {
  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<BackendDocument> {
    console.log('📤 Starting upload for:', file.name, file.type, file.size)
    
    const formData = new FormData()
    formData.append('file', file)
    
    console.log('🌐 Making request to:', `${API_BASE_URL}/documents/upload`)
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    })
    
    console.log('📥 Response received:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Upload failed:', response.status, errorText)
      throw new Error(`Upload failed: ${response.status} ${errorText}`)
    }
    
    const uploadResult: UploadResponse = await response.json()
    console.log('✅ Upload result:', uploadResult)
    
    // Simulate progress for UI (since backend processes in background)
    if (onProgress) {
      const progressInterval = setInterval(() => {
        const progress = Math.min(Math.random() * 100, 95)
        onProgress(progress)
      }, 500)
      
      setTimeout(() => {
        clearInterval(progressInterval)
        onProgress(100)
      }, 3000)
    }
    
    // Return a document object with the upload response data
    return {
      id: uploadResult.document_id,
      filename: uploadResult.filename,
      file_type: file.type,
      file_size: file.size,
      upload_date: new Date().toISOString(),
      processed: false,
      processing_status: 'processing',
      status: uploadResult.status as any,
      summary: '',
      flashcard_count: 0,
      question_count: 0
    }
  },

  async getDocuments(): Promise<BackendDocument[]> {
    const response = await fetch(`${API_BASE_URL}/documents`)
    if (!response.ok) {
      throw new Error('Failed to fetch documents')
    }
    const data = await response.json()
    return data.documents || []
  },

  async deleteDocument(id: string) {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Delete failed')
    }
    
    return response.json()
  },

  async getDocumentStatus(id: string): Promise<BackendDocument> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/status`)
    
    if (!response.ok) {
      throw new Error('Failed to get status')
    }
    
    return response.json()
  }
}

// Quiz Service
export const quizService = {
  async getQuizzes() {
    const response = await fetch(`${API_BASE_URL}/quizzes`)
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes')
    }
    return response.json()
  },

  async getQuizResults() {
    const response = await fetch(`${API_BASE_URL}/quiz-results`)
    if (!response.ok) {
      throw new Error('Failed to fetch quiz results')
    }
    return response.json()
  }
}

// Progress Service
export const progressService = {
  async getLearningProgress() {
    const response = await fetch(`${API_BASE_URL}/learning-progress`)
    if (!response.ok) {
      throw new Error('Failed to fetch learning progress')
    }
    return response.json()
  },

  async getSmartRecommendations() {
    const response = await fetch(`${API_BASE_URL}/smart-recommendations`)
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations')
    }
    return response.json()
  }
}

// Tutoring Service
export const tutoringService = {
  async sendMessage(message: string) {
    const response = await fetch(`${API_BASE_URL}/tutoring/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to send message')
    }
    
    return response.json()
  }
}