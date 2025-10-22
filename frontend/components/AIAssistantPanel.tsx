'use client'

import { useState } from 'react'

export default function AIAssistantPanel() {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const askAI = async () => {
    if (!question.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/ai-assistant/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          subject: 'mathematics',
          difficulty_level: 'intermediate',
          study_mode: 'practice'
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setResponse(data.response)
      } else {
        setResponse('Sorry, AI assistant is not available right now.')
      }
    } catch (error) {
      setResponse('Backend server is not running. Please start the server first.')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-2">🤖</span>
        <h3 className="text-lg font-semibold text-gray-900">AI Study Assistant</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about mathematics..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && askAI()}
          />
        </div>
        
        <button
          onClick={askAI}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
        
        {response && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{response}</p>
          </div>
        )}
      </div>
    </div>
  )
}