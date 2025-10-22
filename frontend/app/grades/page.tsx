'use client'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester']

const gradesData = [
  {
    className: "Introduction to Maths",
    exam1: 86,
    exam2: 90, 
    exam3: 100,
    finalPaper: 94,
    finalGrade: "93 (A)",
    gradeColor: "text-green-600"
  },
  {
    className: "Introduction to Management", 
    exam1: 100,
    exam2: 82,
    exam3: 98,
    finalPaper: "-",
    finalGrade: "N/A",
    gradeColor: "text-gray-500"
  },
  {
    className: "Science Basics",
    exam1: 75,
    exam2: 85,
    exam3: 94, 
    finalPaper: 96,
    finalGrade: "88 (B)",
    gradeColor: "text-blue-600"
  },
  {
    className: "Art History", 
    exam1: "-",
    exam2: 80,
    exam3: 60,
    finalPaper: 72,
    finalGrade: "70 (C)",
    gradeColor: "text-orange-600"
  },
  {
    className: "Math & Numbers",
    exam1: 26,
    exam2: 48,
    exam3: 28,
    finalPaper: 34,
    finalGrade: "34 (E)",
    gradeColor: "text-red-600"
  },
  {
    className: "English Writing",
    exam1: 20,
    exam2: "-", 
    exam3: 50,
    finalPaper: 48,
    finalGrade: "40 (E)",
    gradeColor: "text-red-600"
  },
  {
    className: "Philosophy of Science",
    exam1: 92,
    exam2: 100,
    exam3: 100,
    finalPaper: 86,
    finalGrade: "95 (A)",
    gradeColor: "text-green-600"
  }
]

const progressData = [
  { category: "Lectures", completed: 30, total: 100, percentage: 90 },
  { category: "Assignments", completed: 14, total: 21, percentage: 67 },
  { category: "Exams", completed: 5, total: 7, percentage: 71 }
]

const latestGrades = [
  { subject: "Mid-term paper", term: "Summer term", grade: 98, color: "text-green-600" },
  { subject: "Art History", term: "Summer term", grade: 72, color: "text-orange-600" },
  { subject: "Maths & Numbers", term: "Summer term", grade: 34, color: "text-red-600" }
]

const nextExam = {
  title: "World Economy Exam",
  date: "Monday, 15 May 2023",
  time: "11 AM, Online",
  icon: "🌍"
}

export default function Grades() {
  const [selectedSemester, setSelectedSemester] = useState('1st Semester')

  const getGradeIcon = (grade) => {
    if (grade.includes('A')) return '🏆'
    if (grade.includes('B')) return '⭐'
    if (grade.includes('C')) return '👍'
    if (grade.includes('E')) return '📚'
    return '❓'
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const calculateGPA = () => {
    const validGrades = gradesData.filter(item => item.finalGrade !== "N/A")
    const gradePoints = validGrades.map(item => {
      const numericGrade = parseInt(item.finalGrade)
      if (numericGrade >= 90) return 4.0
      if (numericGrade >= 80) return 3.0
      if (numericGrade >= 70) return 2.0
      if (numericGrade >= 60) return 1.0
      return 0.0
    })
    const gpa = gradePoints.reduce((sum, grade) => sum + grade, 0) / gradePoints.length
    return gpa.toFixed(2)
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <TopBar />
      
      <main className="md:pl-64 pt-16 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Main Grades Content */}
            <div className="lg:col-span-3">
              
              {/* Semester Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-200">
                
                {/* Semester Tabs */}
                <div className="flex space-x-1">
                  {semesters.map((semester) => (
                    <button
                      key={semester}
                      onClick={() => setSelectedSemester(semester)}
                      className={`px-4 py-2 text-sm rounded-full transition-colors ${
                        selectedSemester === semester
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {semester}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grades Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Exam 1</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Exam 2</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Exam 3</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Final Paper</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Final Grade</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {gradesData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{row.className}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {row.exam1 || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {row.exam2 || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {row.exam3 || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {row.finalPaper || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <span className={`text-sm font-semibold ${row.gradeColor}`}>
                                {row.finalGrade}
                              </span>
                              <span className="text-lg">{getGradeIcon(row.finalGrade)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button className="text-gray-400 hover:text-gray-600">
                              ⋯
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Progress Charts */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* In Perspective Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">In Perspective</h3>
                  <div className="flex items-end justify-center space-x-4 h-32">
                    <div className="flex flex-col items-center">
                      <div className="bg-green-400 h-20 w-8 rounded-t mb-2"></div>
                      <span className="text-xs text-gray-600">A</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-300 h-4 w-8 rounded-t mb-2"></div>
                      <span className="text-xs text-gray-600">B</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-green-400 h-20 w-8 rounded-t mb-2"></div>
                      <span className="text-xs text-gray-600">C</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-orange-400 h-16 w-8 rounded-t mb-2"></div>
                      <span className="text-xs text-gray-600">D</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-purple-400 h-8 w-8 rounded-t mb-2"></div>
                      <span className="text-xs text-gray-600">E</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-purple-400 h-8 w-8 rounded-t mb-2"></div>
                      <span className="text-xs text-gray-600">F</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-green-400 h-24 w-8 rounded-t mb-2"></div>
                      <span className="text-xs text-gray-600">A+</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
                  <div className="space-y-4">
                    {progressData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{item.category}</span>
                          <span className="text-sm text-gray-500">{item.percentage}% done</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-500">{item.completed}/{item.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(item.percentage)}`}
                            style={{width: `${item.percentage}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
                <div className="text-center">
                  <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mb-4">
                    Student of General Studies
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-2xl">👨‍🎓</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900">Kanye East</h4>
                  <p className="text-sm text-gray-600">k.east@student.io</p>
                </div>
              </div>

              {/* Latest Grades */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Grades</h3>
                <div className="space-y-3">
                  {latestGrades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{grade.subject}</p>
                        <p className="text-xs text-gray-500">{grade.term}</p>
                      </div>
                      <div className={`text-lg font-bold ${grade.color}`}>
                        {grade.grade}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Exam */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Exam</h3>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-2xl">{nextExam.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{nextExam.title}</p>
                    <p className="text-xs text-gray-600">{nextExam.date}</p>
                    <p className="text-xs text-gray-600">{nextExam.time}</p>
                  </div>
                </div>
              </div>

              {/* GPA and Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Summary</h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white">
                    <div className="text-2xl font-bold">{calculateGPA()}</div>
                    <div className="text-sm">Current GPA</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">{gradesData.length}</div>
                      <div className="text-xs text-gray-600">Courses</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        {gradesData.filter(g => g.finalGrade.includes('A')).length}
                      </div>
                      <div className="text-xs text-gray-600">A Grades</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inbox */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inbox</h3>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">Your summer scholarship was approved!</p>
                  <p className="text-xs text-gray-600 mt-1">For further information please contact Mrs. Horse to help you.</p>
                  <button className="text-blue-600 text-xs mt-2 hover:underline">View Details →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}