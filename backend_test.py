#!/usr/bin/env python3
"""
Comprehensive API Testing for Radiyah UK Islamic Ebook Store
Tests all public and admin endpoints using the production URL
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class RadiyahAPITester:
    def __init__(self, base_url: str = "https://radiyah-books.preview.emergentagent.com"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data storage
        self.series_ids = []
        self.ebook_ids = []
        self.contact_id = None

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        print(f"{status} | {name}")
        if details:
            print(f"    {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    expected_status: int = 200, auth_required: bool = False) -> tuple[bool, Dict]:
        """Make HTTP request and validate response"""
        url = f"{self.base_url}/api/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}
            
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    # ═══ Authentication Tests ═══
    
    def test_admin_login(self):
        """Test admin login functionality"""
        login_data = {
            "email": "admin@radiyah.co.uk",
            "password": "RadiyahAdmin2026!"
        }
        
        success, response = self.make_request('POST', 'auth/login', login_data)
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.log_test("Admin Login", True, f"Logged in as {response.get('email')}")
            return True
        else:
            self.log_test("Admin Login", False, f"Login failed: {response}")
            return False

    def test_auth_me(self):
        """Test current user endpoint"""
        if not self.admin_token:
            self.log_test("Auth Me", False, "No admin token available")
            return False
            
        success, response = self.make_request('GET', 'auth/me', auth_required=True)
        
        if success and response.get('email') == 'admin@radiyah.co.uk':
            self.log_test("Auth Me", True, f"User: {response.get('email')}, Role: {response.get('role')}")
            return True
        else:
            self.log_test("Auth Me", False, f"Failed: {response}")
            return False

    def test_auth_logout(self):
        """Test logout functionality"""
        success, response = self.make_request('POST', 'auth/logout', auth_required=True)
        
        if success:
            self.log_test("Auth Logout", True, "Successfully logged out")
            return True
        else:
            self.log_test("Auth Logout", False, f"Failed: {response}")
            return False

    # ═══ Public API Tests ═══
    
    def test_list_series(self):
        """Test GET /api/series - should return 3 series"""
        success, response = self.make_request('GET', 'series')
        
        if success and isinstance(response, list) and len(response) == 3:
            # Store series IDs for later tests
            self.series_ids = [s.get('id') for s in response if s.get('id')]
            series_titles = [s.get('title') for s in response]
            self.log_test("List Series", True, f"Found {len(response)} series: {', '.join(series_titles)}")
            return True
        else:
            self.log_test("List Series", False, f"Expected 3 series, got: {response}")
            return False

    def test_featured_series(self):
        """Test GET /api/featured - should return featured series"""
        success, response = self.make_request('GET', 'featured')
        
        if success and isinstance(response, list):
            featured_count = len(response)
            self.log_test("Featured Series", True, f"Found {featured_count} featured series")
            return True
        else:
            self.log_test("Featured Series", False, f"Failed: {response}")
            return False

    def test_series_detail(self):
        """Test GET /api/series/{id} - series detail with ebooks"""
        if not self.series_ids:
            self.log_test("Series Detail", False, "No series IDs available")
            return False
            
        series_id = self.series_ids[0]
        success, response = self.make_request('GET', f'series/{series_id}')
        
        if success and response.get('id') == series_id and 'ebooks' in response:
            ebooks = response.get('ebooks', [])
            # Store ebook IDs for later tests
            self.ebook_ids.extend([e.get('id') for e in ebooks if e.get('id')])
            self.log_test("Series Detail", True, f"Series '{response.get('title')}' has {len(ebooks)} ebooks")
            return True
        else:
            self.log_test("Series Detail", False, f"Failed: {response}")
            return False

    def test_ebook_detail(self):
        """Test GET /api/ebooks/{id} - ebook detail"""
        if not self.ebook_ids:
            self.log_test("Ebook Detail", False, "No ebook IDs available")
            return False
            
        ebook_id = self.ebook_ids[0]
        success, response = self.make_request('GET', f'ebooks/{ebook_id}')
        
        if success and response.get('id') == ebook_id:
            self.log_test("Ebook Detail", True, f"Ebook '{response.get('title')}' - £{response.get('price')}")
            return True
        else:
            self.log_test("Ebook Detail", False, f"Failed: {response}")
            return False

    def test_contact_submission(self):
        """Test POST /api/contact - contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "This is a test message from the API testing suite."
        }
        
        success, response = self.make_request('POST', 'contact', contact_data)
        
        if success and 'message' in response:
            self.log_test("Contact Submission", True, "Contact form submitted successfully")
            return True
        else:
            self.log_test("Contact Submission", False, f"Failed: {response}")
            return False

    def test_stripe_checkout(self):
        """Test POST /api/checkout - Stripe checkout session creation"""
        if not self.ebook_ids:
            self.log_test("Stripe Checkout", False, "No ebook IDs available")
            return False
            
        checkout_data = {
            "ebook_id": self.ebook_ids[0],
            "email": "test@example.com",
            "origin_url": "https://radiyah-books.preview.emergentagent.com"
        }
        
        success, response = self.make_request('POST', 'checkout', checkout_data)
        
        if success and 'url' in response and 'session_id' in response:
            self.log_test("Stripe Checkout", True, f"Checkout session created: {response.get('session_id')}")
            return True
        else:
            self.log_test("Stripe Checkout", False, f"Failed: {response}")
            return False

    # ═══ Admin API Tests ═══
    
    def test_admin_list_series(self):
        """Test GET /api/admin/series - admin series list"""
        success, response = self.make_request('GET', 'admin/series', auth_required=True)
        
        if success and isinstance(response, list):
            self.log_test("Admin List Series", True, f"Admin can view {len(response)} series")
            return True
        else:
            self.log_test("Admin List Series", False, f"Failed: {response}")
            return False

    def test_admin_list_ebooks(self):
        """Test GET /api/admin/ebooks - admin ebook list"""
        success, response = self.make_request('GET', 'admin/ebooks', auth_required=True)
        
        if success and isinstance(response, list):
            self.log_test("Admin List Ebooks", True, f"Admin can view {len(response)} ebooks")
            return True
        else:
            self.log_test("Admin List Ebooks", False, f"Failed: {response}")
            return False

    def test_admin_list_orders(self):
        """Test GET /api/admin/orders - admin orders list"""
        success, response = self.make_request('GET', 'admin/orders', auth_required=True)
        
        if success and isinstance(response, list):
            self.log_test("Admin List Orders", True, f"Admin can view {len(response)} orders")
            return True
        else:
            self.log_test("Admin List Orders", False, f"Failed: {response}")
            return False

    def test_admin_list_contacts(self):
        """Test GET /api/admin/contacts - admin contact messages"""
        success, response = self.make_request('GET', 'admin/contacts', auth_required=True)
        
        if success and isinstance(response, list):
            self.log_test("Admin List Contacts", True, f"Admin can view {len(response)} contact messages")
            return True
        else:
            self.log_test("Admin List Contacts", False, f"Failed: {response}")
            return False

    def test_admin_create_series(self):
        """Test POST /api/admin/series - create new series"""
        series_data = {
            "title": "Test Series",
            "description": "A test series created by the API testing suite",
            "image_url": "https://example.com/test.jpg",
            "is_featured": False,
            "order": 99
        }
        
        success, response = self.make_request('POST', 'admin/series', series_data, auth_required=True, expected_status=200)
        
        if success and response.get('title') == 'Test Series':
            test_series_id = response.get('id')
            self.log_test("Admin Create Series", True, f"Created test series: {test_series_id}")
            
            # Clean up - delete the test series
            self.make_request('DELETE', f'admin/series/{test_series_id}', auth_required=True)
            return True
        else:
            self.log_test("Admin Create Series", False, f"Failed: {response}")
            return False

    # ═══ Main Test Runner ═══
    
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Radiyah UK API Testing Suite")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication tests
        print("\n🔐 Authentication Tests")
        if not self.test_admin_login():
            print("❌ Cannot proceed without admin authentication")
            return self.generate_summary()
        
        self.test_auth_me()
        
        # Public API tests
        print("\n🌐 Public API Tests")
        self.test_list_series()
        self.test_featured_series()
        self.test_series_detail()
        self.test_ebook_detail()
        self.test_contact_submission()
        self.test_stripe_checkout()
        
        # Admin API tests
        print("\n👑 Admin API Tests")
        self.test_admin_list_series()
        self.test_admin_list_ebooks()
        self.test_admin_list_orders()
        self.test_admin_list_contacts()
        self.test_admin_create_series()
        
        # Logout test
        print("\n🚪 Cleanup")
        self.test_auth_logout()
        
        return self.generate_summary()

    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['name']}: {result['details']}")
        
        print("\n✅ Passed Tests:")
        for result in self.test_results:
            if result['success']:
                print(f"  • {result['name']}")
        
        return success_rate >= 80  # Consider 80%+ success rate as passing

def main():
    """Main test execution"""
    tester = RadiyahAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())