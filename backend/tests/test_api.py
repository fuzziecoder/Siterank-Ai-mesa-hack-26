#!/usr/bin/env python3
"""
Comprehensive API tests for AI Website Competitor Analyzer
Tests: Auth, Analysis, Dashboard, and Auto-Detect Competitors features
"""

import pytest
import requests
import os
import time
from datetime import datetime

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data
TEST_TIMESTAMP = datetime.now().strftime('%H%M%S%f')
TEST_USER = {
    "name": f"TEST_User_{TEST_TIMESTAMP}",
    "email": f"test_{TEST_TIMESTAMP}@example.com",
    "password": "TestPass123!"
}


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Register and get authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/register", json=TEST_USER)
    if response.status_code == 200:
        return response.json().get("access_token")
    # If registration fails (user exists), try login
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ==================== Health Check Tests ====================
class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_api_root(self, api_client):
        """Test API root endpoint"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "running"
    
    def test_health_endpoint(self, api_client):
        """Test health check endpoint"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data


# ==================== Authentication Tests ====================
class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_register_new_user(self, api_client):
        """Test user registration"""
        unique_user = {
            "name": f"TEST_NewUser_{datetime.now().strftime('%H%M%S%f')}",
            "email": f"newuser_{datetime.now().strftime('%H%M%S%f')}@example.com",
            "password": "NewPass123!"
        }
        response = api_client.post(f"{BASE_URL}/api/auth/register", json=unique_user)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_user["email"]
        assert data["user"]["name"] == unique_user["name"]
    
    def test_register_duplicate_email(self, api_client, auth_token):
        """Test registration with existing email fails"""
        response = api_client.post(f"{BASE_URL}/api/auth/register", json=TEST_USER)
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    def test_login_valid_credentials(self, api_client):
        """Test login with valid credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
    
    def test_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    def test_get_current_user(self, authenticated_client):
        """Test getting current user info"""
        response = authenticated_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "name" in data
    
    def test_unauthorized_access(self, api_client):
        """Test accessing protected endpoint without token"""
        # Create new session without auth
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 403


# ==================== Dashboard Tests ====================
class TestDashboard:
    """Dashboard endpoint tests"""
    
    def test_get_dashboard_stats(self, authenticated_client):
        """Test getting dashboard statistics"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_analyses" in data
        assert "completed_analyses" in data
        assert "avg_score" in data
        assert "best_score" in data
        assert isinstance(data["total_analyses"], int)
        assert isinstance(data["completed_analyses"], int)


# ==================== Analysis Tests ====================
class TestAnalysis:
    """Analysis endpoint tests"""
    
    def test_create_analysis(self, authenticated_client):
        """Test creating a new analysis"""
        analysis_data = {
            "user_site_url": "example.com",
            "competitor_urls": ["competitor1.com", "competitor2.com"]
        }
        response = authenticated_client.post(f"{BASE_URL}/api/analyses", json=analysis_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "status" in data
        assert data["status"] in ["pending", "processing"]
        assert data["user_site_url"] == "example.com"
        # Store analysis_id for later tests
        TestAnalysis.analysis_id = data["id"]
    
    def test_create_analysis_empty_url(self, authenticated_client):
        """Test creating analysis with empty URL fails"""
        response = authenticated_client.post(f"{BASE_URL}/api/analyses", json={
            "user_site_url": "",
            "competitor_urls": []
        })
        assert response.status_code == 400
    
    def test_create_analysis_too_many_competitors(self, authenticated_client):
        """Test creating analysis with more than 5 competitors fails"""
        response = authenticated_client.post(f"{BASE_URL}/api/analyses", json={
            "user_site_url": "example.com",
            "competitor_urls": ["c1.com", "c2.com", "c3.com", "c4.com", "c5.com", "c6.com"]
        })
        assert response.status_code == 400
    
    def test_get_analyses_list(self, authenticated_client):
        """Test getting list of analyses"""
        response = authenticated_client.get(f"{BASE_URL}/api/analyses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_specific_analysis(self, authenticated_client):
        """Test getting a specific analysis"""
        if not hasattr(TestAnalysis, 'analysis_id'):
            pytest.skip("No analysis_id available")
        
        response = authenticated_client.get(f"{BASE_URL}/api/analyses/{TestAnalysis.analysis_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == TestAnalysis.analysis_id
        assert "status" in data
        assert "user_site_url" in data
    
    def test_get_nonexistent_analysis(self, authenticated_client):
        """Test getting non-existent analysis returns 404"""
        response = authenticated_client.get(f"{BASE_URL}/api/analyses/nonexistent-id-12345")
        assert response.status_code == 404


# ==================== Auto-Detect Competitors Tests ====================
class TestCompetitorDetection:
    """Auto-detect competitors endpoint tests - NEW FEATURE"""
    
    def test_detect_competitors_valid_url(self, authenticated_client):
        """Test auto-detecting competitors for a valid URL"""
        request_data = {
            "user_site_url": "amazon.com",
            "industry_hint": "e-commerce"
        }
        response = authenticated_client.post(
            f"{BASE_URL}/api/competitors/detect",
            json=request_data,
            timeout=60  # AI calls can take time
        )
        assert response.status_code == 200
        data = response.json()
        assert "competitors" in data
        assert isinstance(data["competitors"], list)
        # Should return up to 5 competitors
        assert len(data["competitors"]) <= 5
        print(f"Detected competitors: {data['competitors']}")
        
        # Check for industry insights
        if data.get("industry_insights"):
            print(f"Industry insights: {data['industry_insights']}")
    
    def test_detect_competitors_without_industry_hint(self, authenticated_client):
        """Test auto-detecting competitors without industry hint"""
        request_data = {
            "user_site_url": "github.com"
        }
        response = authenticated_client.post(
            f"{BASE_URL}/api/competitors/detect",
            json=request_data,
            timeout=60
        )
        assert response.status_code == 200
        data = response.json()
        assert "competitors" in data
        assert isinstance(data["competitors"], list)
    
    def test_detect_competitors_empty_url(self, authenticated_client):
        """Test auto-detect with empty URL fails"""
        response = authenticated_client.post(
            f"{BASE_URL}/api/competitors/detect",
            json={"user_site_url": ""}
        )
        assert response.status_code == 400
    
    def test_detect_competitors_unauthorized(self, api_client):
        """Test auto-detect without auth fails"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        response = session.post(
            f"{BASE_URL}/api/competitors/detect",
            json={"user_site_url": "example.com"}
        )
        assert response.status_code == 403


# ==================== Report Download Tests ====================
class TestReportDownload:
    """Report download tests"""
    
    def test_download_report_not_completed(self, authenticated_client):
        """Test downloading report for non-completed analysis"""
        # Create a new analysis
        response = authenticated_client.post(f"{BASE_URL}/api/analyses", json={
            "user_site_url": "test-report.com",
            "competitor_urls": ["comp1.com"]
        })
        if response.status_code == 200:
            analysis_id = response.json()["id"]
            # Try to download immediately (before completion)
            report_response = authenticated_client.get(
                f"{BASE_URL}/api/analyses/{analysis_id}/report"
            )
            # Should fail because analysis is not completed
            assert report_response.status_code in [400, 404]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
