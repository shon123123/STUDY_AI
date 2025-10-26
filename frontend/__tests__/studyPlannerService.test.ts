import { studyPlannerService } from '@/services/studyPlannerService'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Study Planner Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('createStudyPlan', () => {
    it('should create a study plan successfully', async () => {
      const mockResponse = {
        success: true,
        plan: {
          user_id: 'test_user',
          success_probability: 0.85,
          estimated_completion: '2025-12-01'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const planData = {
        user_id: 'test_user',
        available_hours_per_day: 2.0,
        learning_goals: [{ title: 'Learn Python', priority: 5 }],
        current_knowledge: [{ area: 'programming', level: 'beginner' }],
        learning_style: 'balanced'
      }

      const result = await studyPlannerService.createStudyPlan(planData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/study-planner/create-plan',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(planData)
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const planData = {
        user_id: 'test_user',
        available_hours_per_day: 2.0,
        learning_goals: [],
        current_knowledge: [],
        learning_style: 'balanced'
      }

      await expect(studyPlannerService.createStudyPlan(planData))
        .rejects.toThrow('Network error')
    })

    it('should handle failed HTTP responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response)

      const planData = {
        user_id: 'test_user',
        available_hours_per_day: 2.0,
        learning_goals: [],
        current_knowledge: [],
        learning_style: 'balanced'
      }

      await expect(studyPlannerService.createStudyPlan(planData))
        .rejects.toThrow('Failed to create study plan: Internal Server Error')
    })
  })

  describe('optimizeSession', () => {
    it('should optimize session successfully', async () => {
      const mockResponse = {
        success: true,
        optimization: {
          recommended_activity: 'Reading',
          target_difficulty: 'Medium'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const sessionData = {
        user_id: 'test_user',
        current_energy: 7,
        available_time: 60,
        subject_preferences: ['Python']
      }

      const result = await studyPlannerService.optimizeSession(sessionData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/study-planner/optimize-session',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getDailySchedule', () => {
    it('should get daily schedule successfully', async () => {
      const mockResponse = {
        success: true,
        schedule: {
          sessions: [
            {
              id: 'session_1',
              time: '09:00',
              subject: 'Python',
              duration_minutes: 60
            }
          ]
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await studyPlannerService.getDailySchedule('test_user', '2025-10-27')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/study-planner/daily-schedule/test_user?date=2025-10-27'
      )
      expect(result).toEqual(mockResponse)
    })

    it('should get daily schedule without date parameter', async () => {
      const mockResponse = {
        success: true,
        schedule: { sessions: [] }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await studyPlannerService.getDailySchedule('test_user')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/study-planner/daily-schedule/test_user'
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getLearningPaths', () => {
    it('should get learning paths successfully', async () => {
      const mockResponse = {
        success: true,
        paths: [
          {
            name: 'Python Fundamentals',
            description: 'Learn Python basics',
            difficulty: 'beginner'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await studyPlannerService.getLearningPaths('Python', 'beginner')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/study-planner/learning-paths?subject=Python&difficulty=beginner'
      )
      expect(result).toEqual(mockResponse)
    })

    it('should get learning paths without parameters', async () => {
      const mockResponse = {
        success: true,
        paths: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await studyPlannerService.getLearningPaths()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/study-planner/learning-paths'
      )
      expect(result).toEqual(mockResponse)
    })
  })
})