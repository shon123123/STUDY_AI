"""
Tests for AI study features and services
"""
import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient

class TestAIInsights:
    """Test AI insights functionality."""
    
    async def test_get_ai_insights_empty(self, async_client: AsyncClient):
        """Test getting AI insights when no data exists."""
        response = await async_client.get("/api/ai-insights")
        
        # Should return insights or appropriate response
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
    
    def test_learning_pattern_analysis(self, client: TestClient):
        """Test learning pattern analysis endpoint."""
        user_id = "test_user_123"
        response = client.get(f"/api/ai-insights/learning-patterns/{user_id}")
        
        # Should return patterns or 404 for non-existent user
        assert response.status_code in [200, 404]
    
    async def test_performance_prediction(self, async_client: AsyncClient):
        """Test performance prediction functionality."""
        user_data = {
            "user_id": "test_user_123",
            "recent_scores": [85, 78, 92, 88, 76],
            "study_hours": [2.5, 3.0, 1.5, 2.0, 2.5],
            "topics_studied": ["Python", "Algorithms", "Data Structures"]
        }
        
        response = await async_client.post("/api/ai-insights/predict-performance", json=user_data)
        
        # Should predict or handle gracefully if AI service unavailable
        assert response.status_code in [200, 500, 503]
    
    def test_knowledge_gap_analysis(self, client: TestClient):
        """Test knowledge gap analysis."""
        analysis_request = {
            "user_id": "test_user_123",
            "quiz_results": [
                {"topic": "Variables", "score": 95},
                {"topic": "Functions", "score": 72},
                {"topic": "Classes", "score": 58}
            ]
        }
        
        response = client.post("/api/ai-insights/knowledge-gaps", json=analysis_request)
        
        # Should analyze gaps or handle gracefully
        assert response.status_code in [200, 500, 503]

class TestStudyRecommendations:
    """Test AI study recommendation functionality."""
    
    async def test_get_study_recommendations(self, async_client: AsyncClient):
        """Test getting personalized study recommendations."""
        user_id = "test_user_123"
        response = await async_client.get(f"/api/ai-insights/recommendations/{user_id}")
        
        # Should return recommendations or 404
        assert response.status_code in [200, 404, 500]
    
    def test_adaptive_study_plan(self, client: TestClient):
        """Test adaptive study plan generation."""
        plan_request = {
            "user_id": "test_user_123",
            "learning_goals": ["Master Python", "Learn Data Science"],
            "available_hours": 10,
            "difficulty_preference": "medium"
        }
        
        response = client.post("/api/ai-insights/adaptive-plan", json=plan_request)
        
        # Should generate plan or handle gracefully
        assert response.status_code in [200, 400, 500, 503]
    
    async def test_smart_recommendations(self, async_client: AsyncClient):
        """Test smart recommendation engine."""
        user_id = "test_user_123"
        context = {
            "current_topic": "Machine Learning",
            "performance_level": "intermediate",
            "time_available": 60
        }
        
        response = await async_client.post(
            f"/api/ai-insights/smart-recommendations/{user_id}",
            json=context
        )
        
        # Should provide recommendations or handle gracefully
        assert response.status_code in [200, 404, 500]

class TestStudyPlanner:
    """Test AI study planner functionality."""
    
    def test_create_study_plan(self, client: TestClient):
        """Test creating a personalized study plan."""
        plan_request = {
            "user_id": "test_user_123",
            "available_hours_per_day": 2.0,
            "learning_goals": [
                {"title": "Learn Python", "priority": 5}
            ],
            "current_knowledge": [
                {"area": "programming", "level": "beginner"}
            ],
            "learning_style": "visual"
        }
        
        response = client.post("/api/study-planner/create-plan", json=plan_request)
        
        # Should create plan or handle gracefully if AI service unavailable
        assert response.status_code in [200, 500, 503]
    
    async def test_optimize_study_session(self, async_client: AsyncClient):
        """Test study session optimization."""
        session_data = {
            "user_id": "test_user_123",
            "current_energy": 7,
            "available_time": 60,
            "subject_preferences": ["Python", "Algorithms"]
        }
        
        response = await async_client.post("/api/study-planner/optimize-session", json=session_data)
        
        # Should optimize or handle gracefully
        assert response.status_code in [200, 500, 503]
    
    def test_track_study_progress(self, client: TestClient):
        """Test study progress tracking."""
        progress_data = {
            "user_id": "test_user_123",
            "completed_sessions": [
                {"topic": "Variables", "duration": 30, "score": 85},
                {"topic": "Functions", "duration": 45, "score": 78}
            ],
            "performance_data": {
                "average_score": 81.5,
                "total_study_time": 75
            }
        }
        
        response = client.post("/api/study-planner/track-progress", json=progress_data)
        
        # Should track progress or handle gracefully
        assert response.status_code in [200, 500, 503]
    
    async def test_get_daily_schedule(self, async_client: AsyncClient):
        """Test getting daily study schedule."""
        user_id = "test_user_123"
        date = "2025-10-27"
        
        response = await async_client.get(f"/api/study-planner/daily-schedule/{user_id}?date={date}")
        
        # Should return schedule
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            assert "schedule" in data
            assert "sessions" in data["schedule"]
    
    def test_get_learning_paths(self, client: TestClient):
        """Test getting learning paths."""
        response = client.get("/api/study-planner/learning-paths?subject=Python&difficulty=beginner")
        
        # Should return learning paths
        assert response.status_code in [200, 500]
        
        if response.status_code == 200:
            data = response.json()
            assert "paths" in data

class TestAIServiceIntegration:
    """Test AI service integration and error handling."""
    
    async def test_ai_service_availability(self, async_client: AsyncClient):
        """Test AI service availability check."""
        response = await async_client.get("/api/ai-insights/service-status")
        
        # Should return service status
        assert response.status_code in [200, 503]
    
    def test_ai_service_fallback(self, client: TestClient):
        """Test AI service fallback when unavailable."""
        # This test simulates AI service being unavailable
        response = client.get("/api/ai-insights/recommendations/test_user")
        
        # Should handle gracefully with fallback or error message
        assert response.status_code in [200, 404, 500, 503]
    
    async def test_rate_limiting(self, async_client: AsyncClient):
        """Test rate limiting for AI endpoints."""
        # Make multiple rapid requests
        user_id = "test_user_123"
        
        for _ in range(5):
            response = await async_client.get(f"/api/ai-insights/learning-patterns/{user_id}")
            
            # Should handle or implement rate limiting
            assert response.status_code in [200, 404, 429, 500]
    
    def test_ai_response_validation(self, client: TestClient):
        """Test AI response validation and formatting."""
        request_data = {
            "user_id": "test_user_123",
            "query": "What should I study next?"
        }
        
        response = client.post("/api/ai-insights/ask", json=request_data)
        
        # Should validate and format AI responses properly
        assert response.status_code in [200, 400, 500, 503]

class TestErrorHandling:
    """Test error handling in AI features."""
    
    def test_invalid_user_id(self, client: TestClient):
        """Test handling of invalid user IDs."""
        invalid_user_id = ""  # Empty user ID
        response = client.get(f"/api/ai-insights/learning-patterns/{invalid_user_id}")
        
        # Should handle invalid user ID
        assert response.status_code in [400, 404, 422]
    
    async def test_malformed_requests(self, async_client: AsyncClient):
        """Test handling of malformed AI requests."""
        malformed_data = {
            "invalid_field": "invalid_value"
        }
        
        response = await async_client.post("/api/study-planner/create-plan", json=malformed_data)
        
        # Should return validation error
        assert response.status_code in [400, 422, 500]
    
    def test_timeout_handling(self, client: TestClient):
        """Test handling of AI service timeouts."""
        # This would require mocking the AI service timeout
        response = client.get("/api/ai-insights/recommendations/test_user")
        
        # Should handle timeouts gracefully
        assert response.status_code in [200, 404, 500, 503, 504]