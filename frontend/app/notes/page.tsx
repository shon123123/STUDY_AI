'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

const noteData = {
  title: "Notes for Science Basics",
  lecturer: "Josh Homme (Lecturer)",
  content: [
    {
      number: 1,
      title: "The Scientific Method",
      text: "Science is a process of discovery that relies on a set of steps called the scientific method. It involves making observations, asking questions, forming hypotheses, testing those hypotheses through experiments, analyzing the results, and drawing conclusions. This method allows scientists to understand the natural world and develop new technologies and medicines."
    },
    {
      number: 2,
      title: "The Three Branches of Science", 
      text: "There are three main branches of science: physical science, life science, and earth science. Physical science deals with the study of non-living matter and energy, including chemistry, physics, and astronomy. Life science focuses on living organisms, such as biology, zoology, and botany. Earth science studies the natural processes that shape our planet, such as geology, meteorology, and oceanography."
    },
    {
      number: 3,
      title: "The Metric System",
      text: "The metric system is a system of measurement used by scientists around the world. It is based on the decimal system and uses units such as meters, grams, and liters. The metric system is important in science because it allows scientists to communicate their findings accurately and consistently, regardless of where they are in the world."
    },
    {
      number: 4,
      title: "Scientific Ethics",
      text: "Science is not just about knowledge, it's also about ethics. Scientists must be honest and transparent in their research, and they must treat research subjects with respect and dignity. They must also ensure that their research does not harm the environment or society. In addition, scientists must be aware of potential biases in their research and take steps to mitigate them. Good scientific practice involves being transparent about research methods and findings, and being willing to revise conclusions in light of new evidence."
    }
  ]
}

const materials = [
  { name: "Syllabus", type: "view", icon: "👁️" },
  { name: "Science-Book.pdf", type: "download", icon: "📥" },
  { name: "Interesting website link", type: "link", icon: "🔗" },
  { name: "History of Science", type: "download", icon: "📥" },
  { name: "Book of Science", type: "download", icon: "📥" }
]

const homework = {
  title: "The Metric System",
  deadline: "Deadline: 10 May 2023"
}

export default function Notes() {
  const [selectedNote, setSelectedNote] = useState(null)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')

  const generateAISummary = async () => {
    setAiResponse("AI Summary: The Scientific Method is a systematic approach to understanding the natural world through observation, hypothesis formation, experimentation, and analysis. This foundational process enables scientific discovery and technological advancement.")
  }

  const askAIQuestion = async () => {
    if (!aiQuery.trim()) return
    setAiResponse(`AI Response: ${aiQuery} - This is a great question! Let me help you understand this concept better with a detailed explanation and examples.`)
    setAiQuery('')
  }

  return (
    <div className="h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      
      <main className="md:pl-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Notes Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{noteData.title}</h1>
                  <div className="flex items-center mt-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      👨‍🏫
                    </div>
                    <span className="text-gray-600">{noteData.lecturer}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <span className="text-xl">🔗</span>
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <span className="text-xl">📥</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Notes Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-6">
                  {noteData.content.map((section) => (
                    <div key={section.number} className="pb-4 border-b border-gray-100 last:border-b-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {section.number}. {section.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{section.text}</p>
                      
                      {/* AI Enhancement Buttons */}
                      <div className="flex space-x-2 mt-3">
                        <button 
                          onClick={generateAISummary}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          🤖 AI Summary
                        </button>
                        <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                          💡 Explain More
                        </button>
                        <button className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
                          ❓ Generate Quiz
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Text Formatting Toolbar */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-600 hover:text-gray-900">
                      <span className="font-bold">B</span>
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900">
                      <span className="italic">I</span>
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900">
                      ✏️
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900">
                      📝
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900">
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Ongoing Lesson */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Ongoing Lesson</h3>
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-4xl">🔬</span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Live
                  </div>
                </div>
                <h4 className="font-medium text-gray-900">Science Basics</h4>
                <p className="text-sm text-gray-600">(Ends in: 45 min.)</p>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                      📹
                    </button>
                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                      🎤
                    </button>
                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                      📱
                    </button>
                  </div>
                  <button className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700">
                    ⚡
                  </button>
                </div>
              </div>

              {/* Materials and Reading */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Materials and Reading</h3>
                <div className="space-y-3">
                  {materials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{material.name}</span>
                      <button className="text-gray-500 hover:text-gray-700">
                        {material.icon}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Homework */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Homework</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{homework.title}</p>
                    <p className="text-sm text-gray-600">{homework.deadline}</p>
                  </div>
                  <button className="text-purple-600 hover:text-purple-800">
                    →
                  </button>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">🤖 AI Study Assistant</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask about the scientific method..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && askAIQuestion()}
                  />
                  <button
                    onClick={askAIQuestion}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    Ask AI
                  </button>
                  {aiResponse && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">{aiResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}