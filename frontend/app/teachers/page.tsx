'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

// Subject filters matching reference design
const subjectFilters = [
  'All Teachers', 'Science', 'History', 'Art', 'Mathematics', 'Physics', 'Chemistry', 'Literature', 'Information Technology'
]

// Teachers data matching the reference exactly
const teachersData = [
  {
    id: 1,
    name: "Josh Homme",
    email: "j.homme@teacher.io",
    subjects: ["Science", "Chemistry"],
    avatar: "🧪",
    rating: 4.9,
    students: 234,
    status: "online",
    initials: "JH"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "s.johnson@teacher.io",
    subjects: ["Mathematics", "Physics"],
    avatar: "📐",
    rating: 4.8,
    students: 189,
    status: "online",
    initials: "SJ"
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "e.davis@teacher.io",
    subjects: ["Art", "History"],
    avatar: "🎨",
    rating: 4.7,
    students: 156,
    status: "offline",
    initials: "ED"
  },
  {
    id: 4,
    name: "Michael Brown",
    email: "m.brown@teacher.io",
    subjects: ["Literature", "English"],
    avatar: "📚",
    rating: 4.9,
    students: 298,
    status: "online",
    initials: "MB"
  },
  {
    id: 5,
    name: "Lisa Wilson",
    email: "l.wilson@teacher.io",
    subjects: ["Chemistry", "Biology"],
    avatar: "🔬",
    rating: 4.6,
    students: 167,
    status: "online",
    initials: "LW"
  },
  {
    id: 6,
    name: "David Miller",
    email: "d.miller@teacher.io",
    subjects: ["Information Technology"],
    avatar: "💻",
    rating: 4.8,
    students: 203,
    status: "offline",
    initials: "DM"
  }
]

export default function TeachersPage() {
  const [selectedFilter, setSelectedFilter] = useState('All Teachers')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter teachers based on selected category and search
  const filteredTeachers = teachersData.filter(teacher => {
    const matchesFilter = selectedFilter === 'All Teachers' || 
                         teacher.subjects.some(subject => 
                           subject.toLowerCase().includes(selectedFilter.toLowerCase())
                         )
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.subjects.some(subject => 
                           subject.toLowerCase().includes(searchQuery.toLowerCase())
                         )
    return matchesFilter && matchesSearch
  })

  const getSubjectBadgeColor = (subject: string) => {
    const colorMap: { [key: string]: string } = {
      'Science': 'ai-badge-science',
      'Chemistry': 'ai-badge-science', 
      'Biology': 'ai-badge-science',
      'Physics': 'ai-badge-science',
      'Mathematics': 'ai-badge-math',
      'Art': 'ai-badge-art',
      'History': 'ai-badge-art',
      'Literature': 'ai-badge-language',
      'English': 'ai-badge-language',
      'Information Technology': 'ai-badge-tech'
    }
    return colorMap[subject] || 'ai-badge-science'
  }

  const getInitialsColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500'
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      <Sidebar />
      <TopBar />
      
      <main className="md:pl-64 pt-16 h-full overflow-auto">
        {/* Search and filters */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse and connect with your instructors
            </p>
            
            {/* Search */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <span className="text-gray-400 text-sm">🔍</span>
                </div>
              </div>
              
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                View notifications
              </button>
              
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                View messages
              </button>
              
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create
              </button>
              
              <div className="relative">
                <button className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                  <span className="text-lg">👤</span>
                </button>
                <span className="text-xs text-gray-600 mt-1 block text-center">Open user menu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Section */}
        <div className="px-8 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Teachers</h2>
            
            {/* Subject Filter Tabs exactly like reference */}
            <div className="flex flex-wrap gap-2 mb-4">
              {subjectFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedFilter === filter
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Filter indicator like reference */}
            {selectedFilter !== 'All Teachers' && (
              <div className="mb-4 text-sm text-gray-600">
                {selectedFilter}Chemistry
                <span className="ml-2 text-yellow-500 cursor-pointer" onClick={() => setSelectedFilter('All Teachers')}>
                  ⭐
                </span>
              </div>
            )}
          </div>

          {/* Teachers Grid matching reference layout */}
          <div className="space-y-4">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  {/* Teacher Info Section */}
                  <div className="flex items-center space-x-4">
                    {/* Avatar with status dot */}
                    <div className="relative">
                      <div className={`w-12 h-12 ${getInitialsColor(teacher.name)} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                        {teacher.initials}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        teacher.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                      }`}></div>
                    </div>

                    {/* Name and Email */}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {teacher.email}
                      </p>
                    </div>
                  </div>

                  {/* Subject Badges */}
                  <div className="flex items-center space-x-2">
                    {teacher.subjects.map((subject) => (
                      <span
                        key={subject}
                        className={`ai-badge ${getSubjectBadgeColor(subject)}`}
                      >
                        {subject}
                      </span>
                    ))}
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-medium">{teacher.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">Rating</span>
                    </div>
                    <div className="text-center">
                      <span className="font-medium">{teacher.students}</span>
                      <div className="text-xs text-gray-500">Students</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center justify-center text-sm transition-colors">
                      ✉️
                    </button>
                    <button className="w-8 h-8 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg flex items-center justify-center text-sm transition-colors">
                      📞
                    </button>
                    <button className="w-8 h-8 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center text-sm transition-colors">
                      ⋯
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No teachers found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}