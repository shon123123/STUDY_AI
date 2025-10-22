// API Service for dynamic data management
// Centralized API calls with proper error handling

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Class {
  id: string
  title: string
  subtitle: string
  description?: string
  instructor: string
  time: string
  location: string
  students: number
  currentLesson: number
  totalLessons: number
  progress: number
  icon: string
  color: string
  status?: string
  type: 'class' | 'exam' | 'meeting'
}

export interface ScheduleEvent {
  id: string
  title: string
  subtitle?: string
  date: string
  time: string
  location: string
  type: 'class' | 'exam' | 'meeting' | 'assignment'
  color: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface Grade {
  id: string
  subject: string
  term: string
  grade: number
  maxGrade: number
  examType: string
  date: string
  instructor: string
}

export interface StudentProfile {
  id: string
  name: string
  email: string
  program: string
  year: number
  gpa: number
  avatar?: string
}

class ApiService {
  // User Classes
  async getClasses(): Promise<Class[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch classes: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching classes:', error)
      // Return fallback data if API fails
      return this.getFallbackClasses()
    }
  }

  // Schedule Events
  async getSchedule(startDate?: string, endDate?: string): Promise<ScheduleEvent[]> {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      
      const response = await fetch(`${API_BASE_URL}/api/schedule?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching schedule:', error)
      return this.getFallbackSchedule()
    }
  }

  // Student Grades
  async getGrades(semester?: string): Promise<Grade[]> {
    try {
      const params = new URLSearchParams()
      if (semester) params.append('semester', semester)
      
      const response = await fetch(`${API_BASE_URL}/api/grades?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch grades: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching grades:', error)
      return this.getFallbackGrades()
    }
  }

  // Student Profile
  async getProfile(): Promise<StudentProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching profile:', error)
      return this.getFallbackProfile()
    }
  }

  // Add new class
  async addClass(classData: Omit<Class, 'id'>): Promise<Class> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to add class: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error adding class:', error)
      throw error
    }
  }

  // Update class progress
  async updateClassProgress(classId: string, progress: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/${classId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update class progress: ${response.status}`)
      }
    } catch (error) {
      console.error('Error updating class progress:', error)
      throw error
    }
  }

  // Fallback data (minimal and user-customizable)
  private getFallbackClasses(): Class[] {
    return [
      {
        id: 'fallback-1',
        title: "Getting Started",
        subtitle: "Welcome to your study assistant",
        instructor: "AI Assistant",
        time: "Add your first class",
        location: "Dashboard",
        students: 0,
        currentLesson: 0,
        totalLessons: 1,
        progress: 0,
        icon: "🎓",
        color: "bg-blue-100",
        status: "Click + to add classes",
        type: 'class'
      }
    ]
  }

  private getFallbackSchedule(): ScheduleEvent[] {
    const today = new Date()
    return [
      {
        id: 'fallback-schedule-1',
        title: "Welcome",
        subtitle: "Set up your schedule",
        date: today.toISOString().split('T')[0],
        time: "12:00 PM",
        location: "Dashboard",
        type: 'class',
        color: "bg-blue-200",
        status: 'scheduled'
      }
    ]
  }

  private getFallbackGrades(): Grade[] {
    return [
      {
        id: 'fallback-grade-1',
        subject: "Sample Course",
        term: "Current Term",
        grade: 0,
        maxGrade: 100,
        examType: "Setup Required",
        date: new Date().toISOString().split('T')[0],
        instructor: "System"
      }
    ]
  }

  private getFallbackProfile(): StudentProfile {
    return {
      id: 'fallback-profile',
      name: "New Student",
      email: "student@example.com",
      program: "General Studies",
      year: 1,
      gpa: 0.0,
      avatar: "👨‍🎓"
    }
  }
}

export const apiService = new ApiService()
export default apiService