/**
 * Study Planner Service
 * Handles API calls for AI study planning features
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface StudyPlanRequest {
  user_id: string
  available_hours_per_day: number
  learning_goals: Array<{
    title: string
    description?: string
    priority: number
  }>
  current_knowledge: Array<{
    area: string
    level: string
  }>
  learning_style: string
  study_preferences?: Record<string, any>
}

export interface SessionOptimizationRequest {
  user_id: string
  current_energy: number
  available_time: number
  subject_preferences: string[]
}

export interface ProgressTrackingRequest {
  user_id: string
  completed_sessions: Array<{
    topic: string
    duration: number
    score?: number
  }>
  performance_data: Record<string, any>
}

class StudyPlannerService {
  async createStudyPlan(planData: StudyPlanRequest) {
    const response = await fetch(`${API_BASE_URL}/api/study-planner/create-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create study plan: ${response.statusText}`)
    }

    return response.json()
  }

  async optimizeSession(sessionData: SessionOptimizationRequest) {
    const response = await fetch(`${API_BASE_URL}/api/study-planner/optimize-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      throw new Error(`Failed to optimize session: ${response.statusText}`)
    }

    return response.json()
  }

  async trackProgress(progressData: ProgressTrackingRequest) {
    const response = await fetch(`${API_BASE_URL}/api/study-planner/track-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progressData),
    })

    if (!response.ok) {
      throw new Error(`Failed to track progress: ${response.statusText}`)
    }

    return response.json()
  }

  async getDailySchedule(userId: string, date?: string) {
    const url = new URL(`${API_BASE_URL}/api/study-planner/daily-schedule/${userId}`)
    if (date) {
      url.searchParams.append('date', date)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Failed to get daily schedule: ${response.statusText}`)
    }

    return response.json()
  }

  async getLearningPaths(subject?: string, difficulty?: string) {
    const url = new URL(`${API_BASE_URL}/api/study-planner/learning-paths`)
    if (subject) {
      url.searchParams.append('subject', subject)
    }
    if (difficulty) {
      url.searchParams.append('difficulty', difficulty)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Failed to get learning paths: ${response.statusText}`)
    }

    return response.json()
  }
}

export const studyPlannerService = new StudyPlannerService()