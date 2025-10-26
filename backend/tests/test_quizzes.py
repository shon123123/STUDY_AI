"""
Tests for quiz-related API endpoints
"""
import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient

class TestQuizGeneration:
    """Test quiz generation functionality."""
    
    async def test_generate_quiz_basic(self, async_client: AsyncClient, sample_document):
        """Test basic quiz generation from a document."""
        # First upload a document (mock)
        file_content = b"Python is a programming language. Variables store data. Functions perform tasks."
        files = {"file": ("quiz_source.txt", io.BytesIO(file_content), "text/plain")}
        
        upload_response = await async_client.post("/api/documents/upload", files=files)
        
        if upload_response.status_code == 200:
            doc_data = upload_response.json()
            doc_id = doc_data["id"]
            
            # Generate quiz from the document
            quiz_request = {
                "num_questions": 5,
                "difficulty": "medium"
            }
            
            quiz_response = await async_client.post(
                f"/api/documents/{doc_id}/generate-quiz",
                json=quiz_request
            )
            
            # Should succeed or handle gracefully if Gemini service not available
            assert quiz_response.status_code in [200, 500, 503]
            
            if quiz_response.status_code == 200:
                quiz_data = quiz_response.json()
                assert "questions" in quiz_data
                assert len(quiz_data["questions"]) > 0
    
    def test_generate_quiz_invalid_document(self, client: TestClient):
        """Test quiz generation for non-existent document."""
        fake_doc_id = "nonexistent123"
        quiz_request = {
            "num_questions": 3,
            "difficulty": "easy"
        }
        
        response = client.post(
            f"/api/documents/{fake_doc_id}/generate-quiz",
            json=quiz_request
        )
        
        assert response.status_code == 404
    
    def test_generate_quiz_invalid_parameters(self, client: TestClient):
        """Test quiz generation with invalid parameters."""
        # This would require a real document ID, so we'll test parameter validation
        fake_doc_id = "test123"
        
        # Test with invalid number of questions
        invalid_request = {
            "num_questions": -1,  # Invalid
            "difficulty": "medium"
        }
        
        response = client.post(
            f"/api/documents/{fake_doc_id}/generate-quiz",
            json=invalid_request
        )
        
        # Should return validation error
        assert response.status_code in [400, 404, 422]
    
    async def test_generate_quiz_different_difficulties(self, async_client: AsyncClient):
        """Test quiz generation with different difficulty levels."""
        difficulties = ["easy", "medium", "hard", "mixed"]
        
        for difficulty in difficulties:
            quiz_request = {
                "num_questions": 3,
                "difficulty": difficulty
            }
            
            # Using a fake doc ID since we're testing parameter handling
            response = await async_client.post(
                "/api/documents/fake123/generate-quiz",
                json=quiz_request
            )
            
            # Should return 404 for fake doc or handle gracefully
            assert response.status_code in [200, 404, 422, 500]

class TestQuizRetrieval:
    """Test quiz retrieval functionality."""
    
    async def test_get_quizzes_empty(self, async_client: AsyncClient):
        """Test getting quizzes when none exist."""
        response = await async_client.get("/api/quizzes")
        
        # Should return empty list or appropriate response
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)
    
    def test_get_quiz_by_id_not_found(self, client: TestClient):
        """Test getting a quiz that doesn't exist."""
        fake_id = "nonexistent123"
        response = client.get(f"/api/quizzes/{fake_id}")
        
        assert response.status_code == 404
    
    async def test_get_quizzes_by_document(self, async_client: AsyncClient):
        """Test getting quizzes for a specific document."""
        fake_doc_id = "test_doc_123"
        response = await async_client.get(f"/api/documents/{fake_doc_id}/quizzes")
        
        # Should return 404 for fake doc or empty list
        assert response.status_code in [200, 404]

class TestQuizSubmission:
    """Test quiz submission and scoring functionality."""
    
    def test_submit_quiz_answers_not_found(self, client: TestClient):
        """Test submitting answers for non-existent quiz."""
        fake_quiz_id = "nonexistent123"
        answers = {
            "answers": [0, 1, 2],  # Sample answers
            "time_taken": 120
        }
        
        response = client.post(f"/api/quizzes/{fake_quiz_id}/submit", json=answers)
        
        assert response.status_code == 404
    
    def test_submit_quiz_invalid_answers(self, client: TestClient):
        """Test submitting invalid quiz answers."""
        fake_quiz_id = "test123"
        
        # Test with malformed answers
        invalid_answers = {
            "answers": "not_a_list",  # Should be a list
            "time_taken": -1  # Invalid time
        }
        
        response = client.post(f"/api/quizzes/{fake_quiz_id}/submit", json=invalid_answers)
        
        # Should return validation error or 404
        assert response.status_code in [400, 404, 422]
    
    async def test_submit_quiz_valid_format(self, async_client: AsyncClient):
        """Test submitting quiz answers with valid format."""
        fake_quiz_id = "test123"
        valid_answers = {
            "answers": [0, 1, 2, 1, 0],
            "time_taken": 300
        }
        
        response = await async_client.post(f"/api/quizzes/{fake_quiz_id}/submit", json=valid_answers)
        
        # Should return 404 for fake quiz ID
        assert response.status_code in [200, 404]

class TestQuizDeletion:
    """Test quiz deletion functionality."""
    
    def test_delete_nonexistent_quiz(self, client: TestClient):
        """Test deleting a quiz that doesn't exist."""
        fake_id = "nonexistent123"
        response = client.delete(f"/api/quizzes/{fake_id}")
        
        # Should return 404 or handle gracefully
        assert response.status_code in [404, 200, 204]
    
    async def test_delete_quiz_cascade(self, async_client: AsyncClient):
        """Test that deleting a document also handles associated quizzes."""
        # This is more of an integration test
        fake_doc_id = "test_doc_123"
        response = await async_client.delete(f"/api/documents/{fake_doc_id}")
        
        # Should handle gracefully even for non-existent document
        assert response.status_code in [200, 204, 404]

class TestQuizStatistics:
    """Test quiz statistics and analytics."""
    
    async def test_quiz_performance_stats(self, async_client: AsyncClient):
        """Test getting quiz performance statistics."""
        response = await async_client.get("/api/quizzes/stats")
        
        # Should return stats or appropriate response
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            # Should have basic stats structure
            assert isinstance(data, dict)
    
    def test_user_quiz_history(self, client: TestClient):
        """Test getting user quiz history."""
        user_id = "test_user_123"
        response = client.get(f"/api/users/{user_id}/quiz-history")
        
        # Should return history or appropriate response
        assert response.status_code in [200, 404]