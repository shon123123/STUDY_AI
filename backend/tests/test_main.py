"""
Tests for main API endpoints and application setup
"""
import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient

class TestHealthEndpoints:
    """Test health check and basic API endpoints."""
    
    def test_root_endpoint(self, client: TestClient):
        """Test the root endpoint returns correct information."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "AI Study Assistant" in data["message"]
    
    def test_health_endpoint(self, client: TestClient):
        """Test the health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data
    
    async def test_async_health_endpoint(self, async_client: AsyncClient):
        """Test health endpoint with async client."""
        response = await async_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

class TestAPIDocumentation:
    """Test API documentation endpoints."""
    
    def test_docs_endpoint(self, client: TestClient):
        """Test that OpenAPI docs are accessible."""
        response = client.get("/docs")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
    
    def test_openapi_json(self, client: TestClient):
        """Test that OpenAPI JSON schema is accessible."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert data["info"]["title"] == "AI Study Assistant API"

class TestCORSConfiguration:
    """Test CORS configuration."""
    
    def test_cors_preflight(self, client: TestClient):
        """Test CORS preflight request."""
        response = client.options(
            "/api/documents",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        # The response should allow the request
        assert response.status_code in [200, 204]
    
    def test_cors_actual_request(self, client: TestClient):
        """Test actual CORS request."""
        response = client.get(
            "/health",
            headers={"Origin": "http://localhost:3000"}
        )
        assert response.status_code == 200
        # Should have CORS headers (if CORS is properly configured)

class TestErrorHandling:
    """Test error handling and edge cases."""
    
    def test_404_endpoint(self, client: TestClient):
        """Test accessing non-existent endpoint."""
        response = client.get("/non-existent-endpoint")
        assert response.status_code == 404
    
    def test_method_not_allowed(self, client: TestClient):
        """Test method not allowed error."""
        response = client.patch("/health")  # PATCH not allowed on health endpoint
        assert response.status_code == 405
    
    async def test_malformed_json_request(self, async_client: AsyncClient):
        """Test request with malformed JSON."""
        response = await async_client.post(
            "/api/documents/upload",
            content="{ invalid json }",
            headers={"Content-Type": "application/json"}
        )
        # Should return 422 (Unprocessable Entity) or 400 (Bad Request)
        assert response.status_code in [400, 422]

class TestApplicationStartup:
    """Test application startup and configuration."""
    
    def test_app_title(self, client: TestClient):
        """Test that the app has the correct title."""
        response = client.get("/openapi.json")
        data = response.json()
        assert data["info"]["title"] == "AI Study Assistant API"
    
    def test_app_version(self, client: TestClient):
        """Test that the app has a version."""
        response = client.get("/openapi.json")
        data = response.json()
        assert "version" in data["info"]
        assert data["info"]["version"] is not None