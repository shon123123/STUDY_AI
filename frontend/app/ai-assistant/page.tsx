'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

export default function AIAssistantPage() {
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "🚀 Hello! I'm your AI Study Assistant powered by Google Gemini! I can:\n\n• ⚡ Instant responses (no CPU usage!)\n• 📝 Summarize any document lightning-fast\n• 🧠 Create smart flashcards from any content\n• ❓ Generate custom quizzes with explanations\n• 🎯 Adapt difficulty levels automatically\n• 🔥 Cloud-powered intelligence\n• � Educational guidance for all subjects\n\nWhat would you like to explore today?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [studyMode, setStudyMode] = useState<'chat' | 'tutor' | 'quiz' | 'flashcard'>('chat')
  const [difficulty, setDifficulty] = useState<'adaptive' | 'easy' | 'medium' | 'hard'>('adaptive')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Call the real backend API with Gemini AI
      const response = await fetch('http://localhost:8000/api/tutoring/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: `Study mode: ${studyMode}, Difficulty: ${difficulty}`,
          study_mode: studyMode,
          difficulty: difficulty
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      
      // Format the AI response based on study mode
      let formattedResponse = data.response
      
      if (studyMode === 'tutor') {
        formattedResponse = `🎓 **AI Tutor (Gemini):**\n\n${data.response}\n\n💡 **Follow-up Options:**\n• Create flashcards from this topic\n• Generate a quiz to test understanding\n• Explore related concepts`
      } else if (studyMode === 'quiz') {
        formattedResponse = `❓ **Quiz Mode (Gemini):**\n\n${data.response}`
      } else if (studyMode === 'flashcard') {
        formattedResponse = `🧠 **Flashcard Mode (Gemini):**\n\n${data.response}`
      }

      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: formattedResponse,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error calling AI API:', error)
      
      // Fallback response if API fails
      const errorMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: `⚠️ **Connection Error:** Unable to reach Gemini AI model. Please ensure the backend is running at http://localhost:8000\n\nError: ${error.message}\n\n🔧 **Troubleshooting:**\n• Check if backend server is running\n• Verify API endpoints are accessible\n• Try refreshing the page`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getPersonalizedResponse = (question: string) => {
    const responses = [
      `Great question! Let me break this down step by step for you. Based on your learning history, I notice you prefer visual explanations, so I'll include some diagrams and examples.`,
      `I can see this relates to your recent study on machine learning. Let me connect this to what you already know and build upon that foundation.`,
      `This is a ${difficulty} level topic. Since you're performing well, let me challenge you with some advanced concepts too.`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getInnovativeResponse = (question: string) => {
    return `🤖 **AI Analysis Complete!**\n\nI've analyzed your question about "${question}" and here's what I can do:\n\n📊 **Smart Summary:** Let me extract key concepts\n🧠 **Memory Palace:** I'll create visual associations  \n🎯 **Adaptive Learning:** Adjusting difficulty to your level\n📈 **Progress Tracking:** This will help improve your weak areas\n🔮 **Prediction:** You're likely to master this in 3-4 study sessions\n\n*Choose an action below or ask me anything else!*`
  }

  const startVoiceInput = () => {
    setIsListening(true)
    // Simulate voice recognition
    setTimeout(() => {
      setInputMessage("This is a voice input simulation - the actual implementation would use Web Speech API")
      setIsListening(false)
    }, 3000)
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Sidebar />
      <TopBar />
      
      <main className="md:pl-64 pt-16 h-full overflow-hidden flex flex-col">
        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-3 transition-colors duration-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Next-gen learning with voice, adaptation & collaboration</p>
            
            {/* AI Mode Controls */}
            <div className="flex items-center space-x-3">
              <select 
                value={studyMode}
                onChange={(e) => setStudyMode(e.target.value as any)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="chat">💬 Chat Mode</option>
                <option value="tutor">🎓 Tutor Mode</option>
                <option value="quiz">❓ Quiz Mode</option>
                <option value="flashcard">🧠 Flashcard Mode</option>
              </select>
              
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="adaptive">🎯 Adaptive</option>
                <option value="easy">😊 Easy</option>
                <option value="medium">🤔 Medium</option>
                <option value="hard">😰 Hard</option>
              </select>
              
              <div className="ai-badge ai-badge-active">🔴 Live</div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🚀</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 w-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 ${
                    message.type === 'user'
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500 dark:border-l-blue-400'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                        <span className="text-white text-sm">🤖</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className={message.type === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}>
                        {message.content.split('\n').map((line, index) => (
                          <p key={index} className={line.startsWith('**') ? 'font-semibold mb-2' : 'mb-1'}>
                            {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                          </p>
                        ))}
                      </div>
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {mounted ? message.timestamp.toLocaleTimeString('en-US', { 
                          hour12: true, 
                          hour: 'numeric', 
                          minute: '2-digit',
                          second: '2-digit'
                        }) : '...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500 dark:border-l-blue-400 rounded-lg p-4 max-w-3xl shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm">🤖</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="animate-bounce w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                      <div className="animate-bounce w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" style={{animationDelay: '0.1s'}}></div>
                      <div className="animate-bounce w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-colors duration-200">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your studies..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="ai-button-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? '⏳' : '📤'} Send
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setInputMessage("Help me create a study plan for mathematics")}
                className="ai-button ai-button-small ai-button-secondary"
              >
                📚 Study Plan
              </button>
              <button
                onClick={() => setInputMessage("Generate a quiz on physics")}
                className="ai-button ai-button-small ai-button-secondary"
              >
                🧠 Create Quiz
              </button>
              <button
                onClick={() => setInputMessage("Explain quantum mechanics in simple terms")}
                className="ai-button ai-button-small ai-button-secondary"
              >
                💡 Explain Topic
              </button>
              <button
                onClick={() => setInputMessage("Help me with homework")}
                className="ai-button ai-button-small ai-button-secondary"
              >
                ✏️ Homework Help
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
