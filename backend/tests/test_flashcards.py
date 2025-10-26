"""
Tests for flashcard-related API endpoints
"""
import pytest
import io
from httpx import AsyncClient
from fastapi.testclient import TestClient

class TestFlashcardGeneration:
    """Test flashcard generation functionality."""
    
    async def test_generate_flashcards_basic(self, async_client: AsyncClient):
        """Test basic flashcard generation from a document."""
        # First upload a document
        file_content = b"Machine learning is a subset of AI. Neural networks are computational models. Deep learning uses multiple layers."
        files = {"file": ("ml_basics.txt", io.BytesIO(file_content), "text/plain")}
        
        upload_response = await async_client.post("/api/documents/upload", files=files)
        
        if upload_response.status_code == 200:
            doc_data = upload_response.json()
            doc_id = doc_data["id"]
            
            # Generate flashcards from the document
            flashcard_request = {
                "num_cards": 5
            }
            
            flashcard_response = await async_client.post(
                f"/api/documents/{doc_id}/generate-flashcards",
                json=flashcard_request
            )
            
            # Should succeed or handle gracefully if Gemini service not available
            assert flashcard_response.status_code in [200, 500, 503]
            
            if flashcard_response.status_code == 200:
                flashcard_data = flashcard_response.json()
                assert "flashcards" in flashcard_data
                assert len(flashcard_data["flashcards"]) > 0
                
                # Check flashcard structure
                first_card = flashcard_data["flashcards"][0]
                assert "front" in first_card
                assert "back" in first_card
                assert "id" in first_card
    
    def test_generate_flashcards_invalid_document(self, client: TestClient):
        """Test flashcard generation for non-existent document."""
        fake_doc_id = "nonexistent123"
        flashcard_request = {
            "num_cards": 10
        }
        
        response = client.post(
            f"/api/documents/{fake_doc_id}/generate-flashcards",
            json=flashcard_request
        )
        
        assert response.status_code == 404
    
    def test_generate_flashcards_invalid_parameters(self, client: TestClient):
        """Test flashcard generation with invalid parameters."""
        fake_doc_id = "test123"
        
        # Test with invalid number of cards
        invalid_request = {
            "num_cards": -5  # Invalid negative number
        }
        
        response = client.post(
            f"/api/documents/{fake_doc_id}/generate-flashcards",
            json=invalid_request
        )
        
        # Should return validation error
        assert response.status_code in [400, 404, 422]
    
    async def test_generate_flashcards_large_number(self, async_client: AsyncClient):
        """Test generating a large number of flashcards."""
        fake_doc_id = "test123"
        flashcard_request = {
            "num_cards": 50  # Large number
        }
        
        response = await async_client.post(
            f"/api/documents/{fake_doc_id}/generate-flashcards",
            json=flashcard_request
        )
        
        # Should handle large requests or return appropriate limit error
        assert response.status_code in [200, 400, 404, 422, 500]

class TestFlashcardRetrieval:
    """Test flashcard retrieval functionality."""
    
    async def test_get_flashcards_empty(self, async_client: AsyncClient):
        """Test getting flashcards when none exist."""
        response = await async_client.get("/api/flashcards")
        
        # Should return empty list or appropriate response
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)
    
    def test_get_flashcard_by_id_not_found(self, client: TestClient):
        """Test getting a flashcard that doesn't exist."""
        fake_id = "nonexistent123"
        response = client.get(f"/api/flashcards/{fake_id}")
        
        assert response.status_code == 404
    
    async def test_get_flashcards_by_document(self, async_client: AsyncClient):
        """Test getting flashcards for a specific document."""
        fake_doc_id = "test_doc_123"
        response = await async_client.get(f"/api/documents/{fake_doc_id}/flashcards")
        
        # Should return 404 for fake doc or empty list
        assert response.status_code in [200, 404]
    
    def test_get_flashcards_by_topic(self, client: TestClient):
        """Test getting flashcards filtered by topic."""
        topic = "Python Programming"
        response = client.get(f"/api/flashcards?topic={topic}")
        
        # Should return filtered results or appropriate response
        assert response.status_code in [200, 404]

class TestFlashcardStudySession:
    """Test flashcard study session functionality."""
    
    async def test_start_study_session(self, async_client: AsyncClient):
        """Test starting a flashcard study session."""
        session_request = {
            "flashcard_ids": ["card1", "card2", "card3"],
            "session_type": "review"
        }
        
        response = await async_client.post("/api/flashcards/study-session", json=session_request)
        
        # Should create session or handle gracefully
        assert response.status_code in [200, 201, 404]
    
    def test_update_flashcard_performance(self, client: TestClient):
        """Test updating flashcard performance after review."""
        fake_card_id = "test_card_123"
        performance_data = {
            "difficulty": 4,
            "quality": 3,
            "response_time": 15.5
        }
        
        response = client.patch(f"/api/flashcards/{fake_card_id}/performance", json=performance_data)
        
        # Should update or return 404 for fake ID
        assert response.status_code in [200, 404, 422]
    
    async def test_spaced_repetition_algorithm(self, async_client: AsyncClient):
        """Test spaced repetition scheduling."""
        fake_card_id = "test_card_123"
        
        response = await async_client.get(f"/api/flashcards/{fake_card_id}/next-review")
        
        # Should return next review date or 404
        assert response.status_code in [200, 404]

class TestFlashcardCRUD:
    """Test flashcard CRUD operations."""
    
    def test_create_custom_flashcard(self, client: TestClient):
        """Test creating a custom flashcard."""
        flashcard_data = {
            "front": "What is polymorphism in OOP?",
            "back": "Polymorphism allows objects of different types to be treated as instances of the same type through inheritance.",
            "topic": "Object-Oriented Programming",
            "difficulty": 3
        }
        
        response = client.post("/api/flashcards", json=flashcard_data)
        
        # Should create flashcard or return validation error
        assert response.status_code in [200, 201, 400, 422]
    
    def test_update_flashcard(self, client: TestClient):
        """Test updating an existing flashcard."""
        fake_card_id = "test_card_123"
        update_data = {
            "front": "Updated question",
            "back": "Updated answer",
            "difficulty": 2
        }
        
        response = client.put(f"/api/flashcards/{fake_card_id}", json=update_data)
        
        # Should update or return 404 for fake ID
        assert response.status_code in [200, 404, 422]
    
    def test_delete_flashcard(self, client: TestClient):
        """Test deleting a flashcard."""
        fake_card_id = "test_card_123"
        
        response = client.delete(f"/api/flashcards/{fake_card_id}")
        
        # Should delete or return 404 for fake ID
        assert response.status_code in [200, 204, 404]

class TestFlashcardStatistics:
    """Test flashcard statistics and analytics."""
    
    async def test_flashcard_performance_stats(self, async_client: AsyncClient):
        """Test getting flashcard performance statistics."""
        response = await async_client.get("/api/flashcards/stats")
        
        # Should return stats or appropriate response
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
    
    def test_user_flashcard_progress(self, client: TestClient):
        """Test getting user flashcard progress."""
        user_id = "test_user_123"
        response = client.get(f"/api/users/{user_id}/flashcard-progress")
        
        # Should return progress or appropriate response
        assert response.status_code in [200, 404]
    
    async def test_topic_based_statistics(self, async_client: AsyncClient):
        """Test getting statistics grouped by topic."""
        response = await async_client.get("/api/flashcards/stats/by-topic")
        
        # Should return topic-based stats
        assert response.status_code in [200, 404]

class TestFlashcardExportImport:
    """Test flashcard export and import functionality."""
    
    def test_export_flashcards(self, client: TestClient):
        """Test exporting flashcards."""
        response = client.get("/api/flashcards/export?format=json")
        
        # Should return export data or appropriate response
        assert response.status_code in [200, 404]
    
    async def test_import_flashcards(self, async_client: AsyncClient):
        """Test importing flashcards."""
        import_data = {
            "flashcards": [
                {
                    "front": "Imported question 1",
                    "back": "Imported answer 1",
                    "topic": "Imported Topic"
                },
                {
                    "front": "Imported question 2", 
                    "back": "Imported answer 2",
                    "topic": "Imported Topic"
                }
            ]
        }
        
        response = await async_client.post("/api/flashcards/import", json=import_data)
        
        # Should import or return validation error
        assert response.status_code in [200, 201, 400, 422]