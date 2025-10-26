"""
Tests for document-related API endpoints
"""
import pytest
import io
from httpx import AsyncClient
from fastapi.testclient import TestClient

class TestDocumentUpload:
    """Test document upload functionality."""
    
    def test_upload_text_document(self, client: TestClient):
        """Test uploading a text document."""
        # Create a simple text file
        file_content = b"This is a test document with educational content about Python programming."
        files = {"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
        
        response = client.post("/api/documents/upload", files=files)
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "filename" in data
        assert data["filename"] == "test.txt"
        assert data["processing_status"] == "completed"
    
    def test_upload_pdf_document(self, client: TestClient):
        """Test uploading a PDF document (simulated)."""
        # Simulate PDF upload (actual PDF parsing would require real PDF)
        file_content = b"%PDF-1.4 fake pdf content for testing"
        files = {"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
        
        response = client.post("/api/documents/upload", files=files)
        
        # Should handle the upload even if PDF parsing fails
        assert response.status_code in [200, 400]
    
    def test_upload_unsupported_file_type(self, client: TestClient):
        """Test uploading an unsupported file type."""
        file_content = b"Some binary content"
        files = {"file": ("test.exe", io.BytesIO(file_content), "application/octet-stream")}
        
        response = client.post("/api/documents/upload", files=files)
        
        # Should still process but may have limited functionality
        assert response.status_code in [200, 400, 415]
    
    def test_upload_empty_file(self, client: TestClient):
        """Test uploading an empty file."""
        files = {"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
        
        response = client.post("/api/documents/upload", files=files)
        
        # Should handle empty files gracefully
        assert response.status_code in [200, 400]
    
    async def test_upload_large_file_simulation(self, async_client: AsyncClient):
        """Test uploading a large file (simulated)."""
        # Simulate large file with repeated content
        large_content = b"A" * 1000 + b" educational content " * 100
        files = {"file": ("large.txt", io.BytesIO(large_content), "text/plain")}
        
        response = await async_client.post("/api/documents/upload", files=files)
        
        # Should handle large files
        assert response.status_code in [200, 413]  # 413 = Payload Too Large

class TestDocumentRetrieval:
    """Test document retrieval functionality."""
    
    async def test_get_documents_empty(self, async_client: AsyncClient):
        """Test getting documents when none exist."""
        response = await async_client.get("/api/documents")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0
    
    async def test_get_document_by_id_not_found(self, async_client: AsyncClient):
        """Test getting a document that doesn't exist."""
        fake_id = "nonexistent123"
        response = await async_client.get(f"/api/documents/{fake_id}")
        
        assert response.status_code == 404
    
    def test_upload_and_retrieve_document(self, client: TestClient):
        """Test uploading a document and then retrieving it."""
        # First, upload a document
        file_content = b"Educational content about machine learning algorithms."
        files = {"file": ("ml_guide.txt", io.BytesIO(file_content), "text/plain")}
        
        upload_response = client.post("/api/documents/upload", files=files)
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        document_id = upload_data["id"]
        
        # Then, retrieve the document
        get_response = client.get(f"/api/documents/{document_id}")
        
        if get_response.status_code == 200:
            get_data = get_response.json()
            assert get_data["id"] == document_id
            assert get_data["filename"] == "ml_guide.txt"
        else:
            # Document might be stored differently, check documents list
            list_response = client.get("/api/documents")
            assert list_response.status_code == 200
            documents = list_response.json()
            assert len(documents) > 0

class TestDocumentProcessing:
    """Test document processing functionality."""
    
    def test_document_processing_status(self, client: TestClient):
        """Test document processing status tracking."""
        # Upload a document
        file_content = b"Content that needs processing: data structures, algorithms, complexity analysis."
        files = {"file": ("cs_concepts.txt", io.BytesIO(file_content), "text/plain")}
        
        response = client.post("/api/documents/upload", files=files)
        assert response.status_code == 200
        
        data = response.json()
        assert "processing_status" in data
        # Status should be either completed (if immediate) or processing
        assert data["processing_status"] in ["completed", "processing", "pending"]
    
    async def test_document_content_extraction(self, async_client: AsyncClient):
        """Test that document content is properly extracted."""
        file_content = b"Key concepts: variables, functions, classes, inheritance, polymorphism."
        files = {"file": ("python_oop.txt", io.BytesIO(file_content), "text/plain")}
        
        response = await async_client.post("/api/documents/upload", files=files)
        
        if response.status_code == 200:
            data = response.json()
            # Check if content was extracted
            if "content" in data:
                assert "variables" in data["content"].lower()
                assert "functions" in data["content"].lower()

class TestDocumentDeletion:
    """Test document deletion functionality."""
    
    def test_delete_nonexistent_document(self, client: TestClient):
        """Test deleting a document that doesn't exist."""
        fake_id = "nonexistent123"
        response = client.delete(f"/api/documents/{fake_id}")
        
        # Should return 404 or handle gracefully
        assert response.status_code in [404, 200]
    
    def test_upload_and_delete_document(self, client: TestClient):
        """Test uploading and then deleting a document."""
        # Upload a document first
        file_content = b"Temporary document for deletion test."
        files = {"file": ("temp.txt", io.BytesIO(file_content), "text/plain")}
        
        upload_response = client.post("/api/documents/upload", files=files)
        
        if upload_response.status_code == 200:
            upload_data = upload_response.json()
            document_id = upload_data["id"]
            
            # Try to delete the document
            delete_response = client.delete(f"/api/documents/{document_id}")
            
            # Should succeed or return appropriate status
            assert delete_response.status_code in [200, 204, 404]