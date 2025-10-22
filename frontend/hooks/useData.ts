// Custom hooks for managing application data
// Provides centralized state management and API integration

import { useState, useEffect, useCallback } from 'react'
import { apiService, Class, ScheduleEvent, Grade, StudentProfile } from '../services/api'

// Hook for managing classes
export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getClasses()
      setClasses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch classes')
    } finally {
      setLoading(false)
    }
  }, [])

  const addClass = useCallback(async (classData: Omit<Class, 'id'>) => {
    try {
      const newClass = await apiService.addClass(classData)
      setClasses(prev => [...prev, newClass])
      return newClass
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add class')
      throw err
    }
  }, [])

  const updateClassProgress = useCallback(async (classId: string, progress: number) => {
    try {
      await apiService.updateClassProgress(classId, progress)
      setClasses(prev => prev.map(cls => 
        cls.id === classId ? { ...cls, progress } : cls
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  return {
    classes,
    loading,
    error,
    refetch: fetchClasses,
    addClass,
    updateClassProgress
  }
}

// Hook for managing schedule
export function useSchedule(startDate?: string, endDate?: string) {
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getSchedule(startDate, endDate)
      setSchedule(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  return {
    schedule,
    loading,
    error,
    refetch: fetchSchedule
  }
}

// Hook for managing grades
export function useGrades(semester?: string) {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getGrades(semester)
      setGrades(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch grades')
    } finally {
      setLoading(false)
    }
  }, [semester])

  useEffect(() => {
    fetchGrades()
  }, [fetchGrades])

  return {
    grades,
    loading,
    error,
    refetch: fetchGrades
  }
}

// Hook for managing student profile
export function useProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getProfile()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile
  }
}

// Hook for combined dashboard data
export function useDashboard() {
  const { classes, loading: classesLoading, error: classesError } = useClasses()
  const { schedule, loading: scheduleLoading, error: scheduleError } = useSchedule()
  const { grades, loading: gradesLoading, error: gradesError } = useGrades()
  const { profile, loading: profileLoading, error: profileError } = useProfile()

  const loading = classesLoading || scheduleLoading || gradesLoading || profileLoading
  const errors = [classesError, scheduleError, gradesError, profileError].filter(Boolean)

  // Calculate dashboard statistics
  const stats = {
    totalClasses: classes.length,
    averageProgress: classes.length > 0 
      ? Math.round(classes.reduce((sum, cls) => sum + cls.progress, 0) / classes.length)
      : 0,
    upcomingEvents: schedule.filter(event => 
      new Date(event.date) >= new Date() && event.status === 'scheduled'
    ).length,
    recentGrades: grades.slice(-3),
    currentGPA: profile?.gpa || 0,
    studyStreak: 5 // This would come from study tracking
  }

  return {
    classes,
    schedule,
    grades,
    profile,
    stats,
    loading,
    errors,
    hasErrors: errors.length > 0
  }
}