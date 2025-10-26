'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  BookOpenIcon,
  MicrophoneIcon,
  PhotoIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import { tutoringService } from '../services/api'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  type: 'text' | 'suggestion'
}

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  action: () => void
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Welcome to your AI Study Assistant! 🎓\n\nI'm designed to enhance your learning experience through evidence-based educational techniques. My capabilities include:\n\n**📚 Content Mastery**\n• Breaking down complex concepts into understandable components\n• Providing step-by-step explanations with real-world examples\n• Creating conceptual connections across subjects\n\n**🎯 Study Strategy**\n• Developing personalized learning plans based on cognitive science\n• Recommending effective study techniques for your learning style\n• Optimizing retention through spaced repetition principles\n\n**📝 Assessment Support**\n• Generating practice questions from your uploaded materials\n• Creating comprehensive study guides and summaries\n• Providing targeted feedback on your understanding\n\nHow can I support your learning goals today?",
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickActions: QuickAction[] = [
    {
      title: 'Concept Analysis',
      description: 'Deep-dive explanation of challenging concepts',
      icon: LightBulbIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => handleQuickAction('I need help understanding a specific concept from my study materials. Can you break it down step-by-step?')
    },
    {
      title: 'Assessment Generation',
      description: 'Create targeted practice questions',
      icon: QuestionMarkCircleIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => handleQuickAction('Generate practice questions from my uploaded documents to test my understanding.')
    },
    {
      title: 'Study Strategy',
      description: 'Personalized learning methodology',
      icon: ClipboardDocumentListIcon,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => handleQuickAction('Help me develop an effective study strategy based on learning science principles.')
    },
    {
      title: 'Content Synthesis',
      description: 'Comprehensive material summaries',
      icon: DocumentTextIcon,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => handleQuickAction('Provide a comprehensive synthesis of my study materials with key insights and connections.')
    }
  ]

  const handleQuickAction = (message: string) => {
    setInputValue(message)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsLoading(true)

    try {
      // Send message to backend AI service
      const response = await tutoringService.sendMessage(currentInput)
      
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message || response.response || 'I received your message!',
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      }
      
      setMessages(prev => [...prev, assistantResponse])
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Fallback to local response generation
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(currentInput),
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      }
      
      setMessages(prev => [...prev, assistantResponse])
      toast.error('AI service temporarily unavailable, using offline responses')
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes('quiz') || input.includes('test') || input.includes('assessment')) {
      return "I'd be delighted to help you create targeted assessments! 📝\n\n**Assessment Options Available:**\n• **Formative Quizzes**: Quick comprehension checks with immediate feedback\n• **Summative Tests**: Comprehensive evaluations covering multiple concepts\n• **Adaptive Questions**: Difficulty-adjusted based on your performance patterns\n• **Application-Based Problems**: Real-world scenario questions\n\n**To create the most effective assessment**, please specify:\n→ Target learning objectives\n→ Preferred question types (multiple choice, short answer, essay)\n→ Difficulty level and question count\n\nWhich approach would best serve your learning goals?"
    }
    
    if (input.includes('summary') || input.includes('summarize') || input.includes('synthesis')) {
      return "I excel at creating comprehensive content syntheses! 📊\n\n**Synthesis Approaches I Can Provide:**\n• **Hierarchical Summaries**: Main concepts → sub-concepts → details\n• **Comparative Analysis**: Highlighting relationships between ideas\n• **Conceptual Mapping**: Visual organization of knowledge structures\n• **Key Insights Extraction**: Critical takeaways and implications\n\n**To optimize the synthesis**, please indicate:\n→ Specific documents or topics to focus on\n→ Intended use (review, exam prep, project research)\n→ Desired depth level (overview vs. detailed analysis)\n\nHow would you like me to structure this synthesis?"
    }
    
    if (input.includes('study plan') || input.includes('schedule') || input.includes('strategy')) {
      return "Excellent! Let me help you design an evidence-based learning strategy! 🎯\n\n**Strategic Planning Framework:**\n• **Learning Objectives Analysis**: Defining clear, measurable goals\n• **Cognitive Load Management**: Optimizing information processing\n• **Spaced Repetition Integration**: Maximizing long-term retention\n• **Metacognitive Strategies**: Developing self-awareness of learning\n\n**To create your personalized plan**, I'll need:\n→ Available study time and schedule constraints\n→ Learning preferences and strengths\n→ Assessment deadlines and priorities\n→ Current knowledge gaps or challenges\n\nShall we begin with a learning style assessment or goal-setting exercise?"
    }
    
    if (input.includes('explain') || input.includes('understand') || input.includes('concept') || input.includes('clarify')) {
      return "I'm here to facilitate deep conceptual understanding! 💡\n\n**Pedagogical Approaches I Use:**\n• **Socratic Questioning**: Guiding you to discover answers through inquiry\n• **Analogical Reasoning**: Connecting new concepts to familiar experiences\n• **Scaffolded Learning**: Building complexity step-by-step\n• **Elaborative Interrogation**: Exploring the 'why' behind facts\n\n**For optimal explanation**, please share:\n→ The specific concept or topic area\n→ Your current understanding level\n→ Where you're getting stuck or confused\n→ How you learn best (visual, verbal, hands-on)\n\nWhat concept would you like to explore together?"
    }
    
    return "I'm ready to support your academic success through evidence-based learning strategies! 🎓\n\n**My Expertise Areas:**\n• Conceptual explanation and knowledge synthesis\n• Assessment design and study strategy development\n• Metacognitive skill building and learning optimization\n• Academic writing and research methodology\n\n**To provide the most effective assistance**, could you specify:\n→ Your learning objective or challenge\n→ The subject area or materials involved\n→ Your preferred learning approach\n\nWhat academic goal can I help you achieve today?"
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Study Assistant</h1>
            <p className="text-sm text-gray-400">Advanced Pedagogical AI • Evidence-Based Learning</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center space-x-2 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Accelerators */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Learning Accelerators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`
                p-4 rounded-lg text-left transition-all duration-200 transform hover:scale-105
                ${action.color} text-white
              `}
            >
              <action.icon className="h-6 w-6 mb-2" />
              <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
              <p className="text-xs opacity-90">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${message.sender === 'user' 
                  ? 'bg-primary-600' 
                  : 'bg-gradient-to-br from-purple-500 to-blue-500'
                }
              `}>
                {message.sender === 'user' ? (
                  <span className="text-sm font-bold text-white">You</span>
                ) : (
                  <SparklesIcon className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`
                px-4 py-3 rounded-2xl max-w-full
                ${message.sender === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
                }
              `}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                <div className={`
                  text-xs mt-2 
                  ${message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'}
                `}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-3xl">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-end space-x-3">
          {/* Attachment buttons */}
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <PhotoIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <DocumentTextIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <MicrophoneIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Input field */}
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              className="w-full p-3 pr-12 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={inputValue.split('\n').length || 1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Send button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Footer text */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI can make mistakes. Please verify important information with your study materials.
        </p>
      </div>
    </div>
  )
}