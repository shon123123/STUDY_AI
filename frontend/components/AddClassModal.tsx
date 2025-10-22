// Add Class Modal Component
// Allows users to dynamically add classes to their dashboard

'use client'

import { useState } from 'react'
import { Class } from '../services/api'

interface AddClassModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (classData: Omit<Class, 'id'>) => Promise<void>
}

const classIcons = [
  '📚', '🧮', '🔬', '🧪', '🌍', '🎨', '💻', '📊', '🏛️', '🎭', 
  '🎵', '📖', '✍️', '🗣️', '🧠', '⚖️', '💡', '🔬', '🏃‍♂️', '🎯'
]

const classColors = [
  'bg-blue-100', 'bg-purple-100', 'bg-green-100', 'bg-yellow-100', 
  'bg-pink-100', 'bg-indigo-100', 'bg-red-100', 'bg-teal-100',
  'bg-orange-100', 'bg-gray-100'
]

export default function AddClassModal({ isOpen, onClose, onAdd }: AddClassModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    instructor: '',
    time: '',
    location: '',
    students: 0,
    totalLessons: 12,
    icon: '📚',
    color: 'bg-blue-100',
    type: 'class' as const
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.instructor.trim()) {
      setError('Title and Instructor are required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await onAdd({
        ...formData,
        currentLesson: 1,
        progress: 0,
        description: formData.subtitle
      })
      
      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        instructor: '',
        time: '',
        location: '',
        students: 0,
        totalLessons: 12,
        icon: '📚',
        color: 'bg-blue-100',
        type: 'class'
      })
      
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add class')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Add New Class</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Introduction to Computer Science"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor *
              </label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dr. Sarah Johnson"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the class"
            />
          </div>

          {/* Schedule Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Monday & Wednesday 10:00 AM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Room 101 or Online"
              />
            </div>
          </div>

          {/* Class Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Students
              </label>
              <input
                type="number"
                value={formData.students}
                onChange={(e) => setFormData(prev => ({ ...prev, students: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Lessons
              </label>
              <input
                type="number"
                value={formData.totalLessons}
                onChange={(e) => setFormData(prev => ({ ...prev, totalLessons: parseInt(e.target.value) || 12 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>

          {/* Visual Customization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Icon
            </label>
            <div className="grid grid-cols-10 gap-2">
              {classIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`p-2 text-2xl border-2 rounded-lg hover:border-blue-500 transition-colors ${
                    formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {classColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`h-12 rounded-lg border-2 transition-colors ${color} ${
                    formData.color === color ? 'border-gray-800' : 'border-gray-200 hover:border-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className={`${formData.color} rounded-lg p-4`}>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{formData.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{formData.title || 'Class Title'}</h4>
                  <p className="text-sm text-gray-600">{formData.subtitle || 'Class description'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.instructor || 'Instructor'} • {formData.location || 'Location'}
                  </p>
                  <p className="text-sm text-gray-500">{formData.time || 'Schedule'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}