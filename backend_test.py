#!/usr/bin/env python3

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class CompetitorAnalyzerTester:
    def __init__(self, base_url: str = "https://sitescanpro-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.analysis_id = None
        
        # Test data
        self.test_timestamp = datetime.now().strftime('%H%M%S')
        self.test_user = {
            "name": f"Test User {self.test_timestamp}",
            "email": f"test_{self.test_timestamp}@example.com",
            "password": "TestPass123!"
        }

    def log(self, message: str, level: str = "INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, headers: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        # Default headers
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.content else {}
                except:
                    response_data = {}
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json() if response.content else {}
                    self.log(f"   Error: {error_data}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                response_data = {}

            return success, response_data

        except requests.exceptions.Timeout:
            self.log(f"❌ FAILED - Request timeout")
            return False, {}
        except Exception as e:
            self.log(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_health_check(self) -> bool:
        """Test basic health endpoints"""
        self.log("\n=== HEALTH CHECK TESTS ===")
        
        success1, _ = self.run_test("API Root", "GET", "/api/", 200)
        success2, _ = self.run_test("Health Check", "GET", "/api/health", 200)
        
        return success1 and success2

    def test_user_registration(self) -> bool:
        """Test user registration"""
        self.log("\n=== USER REGISTRATION TEST ===")
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/api/auth/register",
            200,
            data=self.test_user
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response.get('user', {}).get('id')
            self.log(f"   Token obtained: {self.token[:20]}...")
            self.log(f"   User ID: {self.user_id}")
            return True
        
        return False

    def test_user_login(self) -> bool:
        """Test user login"""
        self.log("\n=== USER LOGIN TEST ===")
        
        # Clear token to test login
        old_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "/api/auth/login",
            200,
            data={
                "email": self.test_user["email"],
                "password": self.test_user["password"]
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.log(f"   Login token: {self.token[:20]}...")
            return True
        else:
            # Restore old token if login failed
            self.token = old_token
            return False

    def test_get_current_user(self) -> bool:
        """Test getting current user info"""
        self.log("\n=== GET CURRENT USER TEST ===")
        
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/api/auth/me",
            200
        )
        
        if success:
            self.log(f"   User: {response.get('name')} ({response.get('email')})")
            return True
        
        return False

    def test_dashboard_stats(self) -> bool:
        """Test dashboard statistics"""
        self.log("\n=== DASHBOARD STATS TEST ===")
        
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "/api/dashboard/stats",
            200
        )
        
        if success:
            self.log(f"   Total analyses: {response.get('total_analyses', 0)}")
            self.log(f"   Completed: {response.get('completed_analyses', 0)}")
            self.log(f"   Avg score: {response.get('avg_score', 0)}")
            return True
        
        return False

    def test_create_analysis(self) -> bool:
        """Test creating a new analysis"""
        self.log("\n=== CREATE ANALYSIS TEST ===")
        
        analysis_data = {
            "user_site_url": "example.com",
            "competitor_urls": ["competitor1.com", "competitor2.com"]
        }
        
        success, response = self.run_test(
            "Create Analysis",
            "POST",
            "/api/analyses",
            200,
            data=analysis_data
        )
        
        if success and 'id' in response:
            self.analysis_id = response['id']
            self.log(f"   Analysis ID: {self.analysis_id}")
            self.log(f"   Status: {response.get('status')}")
            return True
        
        return False

    def test_get_analyses_list(self) -> bool:
        """Test getting list of analyses"""
        self.log("\n=== GET ANALYSES LIST TEST ===")
        
        success, response = self.run_test(
            "Get Analyses List",
            "GET",
            "/api/analyses",
            200
        )
        
        if success:
            analyses_count = len(response) if isinstance(response, list) else 0
            self.log(f"   Found {analyses_count} analyses")
            return True
        
        return False

    def test_get_specific_analysis(self) -> bool:
        """Test getting a specific analysis"""
        self.log("\n=== GET SPECIFIC ANALYSIS TEST ===")
        
        if not self.analysis_id:
            self.log("❌ No analysis ID available for testing")
            return False
        
        success, response = self.run_test(
            "Get Specific Analysis",
            "GET",
            f"/api/analyses/{self.analysis_id}",
            200
        )
        
        if success:
            self.log(f"   Analysis status: {response.get('status')}")
            self.log(f"   User site: {response.get('user_site_url')}")
            return True
        
        return False

    def test_analysis_processing_wait(self) -> bool:
        """Wait for analysis to complete and test status updates"""
        self.log("\n=== ANALYSIS PROCESSING TEST ===")
        
        if not self.analysis_id:
            self.log("❌ No analysis ID available for testing")
            return False
        
        max_wait_time = 120  # 2 minutes max wait
        check_interval = 10  # Check every 10 seconds
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            success, response = self.run_test(
                "Check Analysis Status",
                "GET",
                f"/api/analyses/{self.analysis_id}",
                200
            )
            
            if not success:
                return False
            
            status = response.get('status')
            self.log(f"   Current status: {status}")
            
            if status == 'completed':
                self.log("✅ Analysis completed successfully!")
                scores = response.get('user_site_scores', {})
                self.log(f"   Overall score: {scores.get('overall_score', 0)}")
                self.log(f"   SEO: {scores.get('seo_score', 0)}, Speed: {scores.get('speed_score', 0)}")
                return True
            elif status == 'failed':
                self.log(f"❌ Analysis failed: {response.get('ai_suggestions', 'Unknown error')}")
                return False
            elif status in ['pending', 'processing']:
                self.log(f"   Waiting... ({int(time.time() - start_time)}s elapsed)")
                time.sleep(check_interval)
            else:
                self.log(f"❌ Unknown status: {status}")
                return False
        
        self.log(f"❌ Analysis did not complete within {max_wait_time} seconds")
        return False

    def test_download_report(self) -> bool:
        """Test downloading analysis report"""
        self.log("\n=== DOWNLOAD REPORT TEST ===")
        
        if not self.analysis_id:
            self.log("❌ No analysis ID available for testing")
            return False
        
        # First check if analysis is completed
        success, response = self.run_test(
            "Check Analysis Before Download",
            "GET",
            f"/api/analyses/{self.analysis_id}",
            200
        )
        
        if not success:
            return False
        
        if response.get('status') != 'completed':
            self.log(f"❌ Analysis not completed (status: {response.get('status')})")
            return False
        
        # Test report download
        url = f"{self.base_url}/api/analyses/{self.analysis_id}/report"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            self.log(f"   Downloading report from: {url}")
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                content_length = len(response.content)
                self.log(f"✅ Report downloaded successfully ({content_length} bytes)")
                
                # Check if it's a text file
                if response.headers.get('content-type', '').startswith('text/'):
                    preview = response.text[:200].replace('\n', ' ')
                    self.log(f"   Preview: {preview}...")
                
                self.tests_passed += 1
                return True
            else:
                self.log(f"❌ Download failed - Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ Download error: {str(e)}")
            return False
        finally:
            self.tests_run += 1

    def test_invalid_requests(self) -> bool:
        """Test error handling with invalid requests"""
        self.log("\n=== ERROR HANDLING TESTS ===")
        
        # Test invalid login
        success1, _ = self.run_test(
            "Invalid Login",
            "POST",
            "/api/auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"}
        )
        
        # Test unauthorized access (without token)
        old_token = self.token
        self.token = None
        success2, _ = self.run_test(
            "Unauthorized Access",
            "GET",
            "/api/auth/me",
            403
        )
        self.token = old_token
        
        # Test invalid analysis creation
        success3, _ = self.run_test(
            "Invalid Analysis Data",
            "POST",
            "/api/analyses",
            400,
            data={"user_site_url": "", "competitor_urls": []}
        )
        
        # Test non-existent analysis
        success4, _ = self.run_test(
            "Non-existent Analysis",
            "GET",
            "/api/analyses/invalid-id-12345",
            404
        )
        
        return success1 and success2 and success3 and success4

    def run_all_tests(self) -> bool:
        """Run all tests in sequence"""
        self.log("🚀 Starting AI Website Competitor Analyzer API Tests")
        self.log(f"   Base URL: {self.base_url}")
        self.log(f"   Test User: {self.test_user['email']}")
        
        start_time = time.time()
        
        # Run tests in order
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Get Current User", self.test_get_current_user),
            ("Dashboard Stats", self.test_dashboard_stats),
            ("Create Analysis", self.test_create_analysis),
            ("Get Analyses List", self.test_get_analyses_list),
            ("Get Specific Analysis", self.test_get_specific_analysis),
            ("Analysis Processing", self.test_analysis_processing_wait),
            ("Download Report", self.test_download_report),
            ("Error Handling", self.test_invalid_requests),
        ]
        
        failed_tests = []
        
        for test_name, test_func in tests:
            try:
                if not test_func():
                    failed_tests.append(test_name)
            except Exception as e:
                self.log(f"❌ {test_name} crashed: {str(e)}")
                failed_tests.append(test_name)
        
        # Final results
        elapsed_time = time.time() - start_time
        self.log(f"\n{'='*60}")
        self.log(f"🏁 TEST RESULTS SUMMARY")
        self.log(f"{'='*60}")
        self.log(f"   Total Tests: {self.tests_run}")
        self.log(f"   Passed: {self.tests_passed}")
        self.log(f"   Failed: {self.tests_run - self.tests_passed}")
        self.log(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        self.log(f"   Execution Time: {elapsed_time:.1f}s")
        
        if failed_tests:
            self.log(f"\n❌ Failed Test Categories:")
            for test in failed_tests:
                self.log(f"   - {test}")
        else:
            self.log(f"\n✅ All test categories passed!")
        
        return len(failed_tests) == 0

def main():
    """Main test execution"""
    tester = CompetitorAnalyzerTester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())