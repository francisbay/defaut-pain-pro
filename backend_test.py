import requests
import json
import sys
from datetime import datetime

class BreadDefectAPITester:
    def __init__(self, base_url="https://defaut-pain-pro.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status=200, params=None, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            
            print(f"Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Try to parse JSON response
                try:
                    resp_json = response.json()
                    return True, resp_json
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test("Root API", "GET", "")
        if success:
            print(f"Root response: {response}")
        return success

    def test_get_defects(self):
        """Test GET /defects endpoint"""
        success, response = self.run_test("Get All Defects", "GET", "defects")
        if success:
            defects = response
            print(f"Found {len(defects)} defects")
            if len(defects) == 18:
                print("✅ Correct number of defects (18)")
            else:
                print(f"❌ Expected 18 defects, got {len(defects)}")
            
            # Check defect structure
            if defects and len(defects) > 0:
                defect = defects[0]
                required_fields = ['id', 'name', 'category', 'categoryLabel', 'description', 'stage', 'causes', 'remedies']
                missing_fields = [field for field in required_fields if field not in defect]
                if not missing_fields:
                    print("✅ Defect structure is correct")
                else:
                    print(f"❌ Missing fields in defect: {missing_fields}")
        return success

    def test_get_defects_by_category(self):
        """Test GET /defects with category filter"""
        categories = ['aspect', 'croute', 'grigne', 'mie']
        all_passed = True
        
        for category in categories:
            success, response = self.run_test(f"Get Defects - Category {category}", "GET", "defects", params={"category": category})
            if success:
                defects = response
                print(f"Found {len(defects)} defects for category '{category}'")
                # Verify all defects belong to the requested category
                wrong_category = [d for d in defects if d.get('category') != category]
                if not wrong_category:
                    print(f"✅ All defects belong to category '{category}'")
                else:
                    print(f"❌ Found {len(wrong_category)} defects with wrong category")
                    all_passed = False
            else:
                all_passed = False
        
        return all_passed

    def test_get_single_defect(self):
        """Test GET /defects/{id} endpoint"""
        # First get a defect ID
        success, defects = self.run_test("Get defects for single test", "GET", "defects")
        if not success or not defects:
            return False
            
        defect_id = defects[0]['id']
        success, response = self.run_test(f"Get Single Defect - {defect_id}", "GET", f"defects/{defect_id}")
        
        if success:
            defect = response
            print(f"Retrieved defect: {defect.get('name', 'Unknown')}")
            if defect.get('id') == defect_id:
                print("✅ Correct defect returned")
            else:
                print("❌ Wrong defect returned")
                return False
        
        return success

    def test_get_categories(self):
        """Test GET /categories endpoint"""
        success, response = self.run_test("Get Categories", "GET", "categories")
        
        if success:
            categories = response
            print(f"Found {len(categories)} categories")
            if len(categories) == 4:
                print("✅ Correct number of categories (4)")
                # Check category structure
                required_fields = ['id', 'label', 'description']
                for cat in categories:
                    missing = [field for field in required_fields if field not in cat]
                    if missing:
                        print(f"❌ Category missing fields: {missing}")
                        return False
                print("✅ Category structure is correct")
            else:
                print(f"❌ Expected 4 categories, got {len(categories)}")
                return False
        
        return success

    def test_quiz_generation(self):
        """Test GET /quiz/generate endpoint"""
        difficulties = [None, "facile", "moyen", "difficile"]
        all_passed = True
        
        for difficulty in difficulties:
            test_name = f"Generate Quiz Question{' - ' + difficulty if difficulty else ''}"
            params = {"difficulty": difficulty} if difficulty else None
            
            success, response = self.run_test(test_name, "GET", "quiz/generate", params=params)
            
            if success:
                quiz = response
                required_fields = ['id', 'question', 'options', 'correctIndex', 'explanation', 'questionType', 'difficulty', 'defectId']
                missing = [field for field in required_fields if field not in quiz]
                
                if not missing:
                    print(f"✅ Quiz structure is correct")
                    print(f"Question type: {quiz.get('questionType')}")
                    print(f"Difficulty: {quiz.get('difficulty')}")
                    print(f"Options count: {len(quiz.get('options', []))}")
                    
                    # Verify options count and correctIndex
                    options = quiz.get('options', [])
                    correct_idx = quiz.get('correctIndex')
                    
                    if len(options) == 4:
                        print("✅ Correct number of options (4)")
                    else:
                        print(f"❌ Expected 4 options, got {len(options)}")
                        all_passed = False
                    
                    if 0 <= correct_idx < len(options):
                        print("✅ Valid correctIndex")
                    else:
                        print(f"❌ Invalid correctIndex: {correct_idx}")
                        all_passed = False
                else:
                    print(f"❌ Missing fields in quiz: {missing}")
                    all_passed = False
            else:
                all_passed = False
        
        return all_passed

    def test_diagnostic_scenario(self):
        """Test GET /diagnostic/scenario endpoint"""
        success, response = self.run_test("Generate Diagnostic Scenario", "GET", "diagnostic/scenario")
        
        if success:
            scenario = response
            required_fields = ['id', 'narrative', 'defectId', 'defectName', 'steps']
            missing = [field for field in required_fields if field not in scenario]
            
            if not missing:
                print("✅ Scenario structure is correct")
                
                steps = scenario.get('steps', [])
                if len(steps) == 3:
                    print("✅ Correct number of steps (3)")
                    
                    # Check each step structure
                    step_valid = True
                    for i, step in enumerate(steps):
                        step_fields = ['step', 'title', 'instruction', 'options', 'correctIndex', 'explanation']
                        step_missing = [field for field in step_fields if field not in step]
                        if step_missing:
                            print(f"❌ Step {i+1} missing fields: {step_missing}")
                            step_valid = False
                        elif len(step.get('options', [])) != 4:
                            print(f"❌ Step {i+1} should have 4 options, got {len(step.get('options', []))}")
                            step_valid = False
                    
                    if step_valid:
                        print("✅ All steps have correct structure")
                    else:
                        return False
                else:
                    print(f"❌ Expected 3 steps, got {len(steps)}")
                    return False
            else:
                print(f"❌ Missing fields in scenario: {missing}")
                return False
        
        return success

    def test_stats_endpoint(self):
        """Test GET /stats endpoint"""
        success, response = self.run_test("Get Stats", "GET", "stats")
        
        if success:
            stats = response
            required_fields = ['totalDefects', 'totalCategories', 'categories']
            missing = [field for field in required_fields if field not in stats]
            
            if not missing:
                print("✅ Stats structure is correct")
                total_defects = stats.get('totalDefects')
                total_categories = stats.get('totalCategories')
                
                if total_defects == 18:
                    print(f"✅ Correct total defects count: {total_defects}")
                else:
                    print(f"❌ Expected 18 total defects, got {total_defects}")
                
                if total_categories == 4:
                    print(f"✅ Correct total categories count: {total_categories}")
                else:
                    print(f"❌ Expected 4 total categories, got {total_categories}")
            else:
                print(f"❌ Missing fields in stats: {missing}")
                return False
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Bread Defect API Tests")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)
        
        # Run all tests
        tests = [
            ("Root API", self.test_root_endpoint),
            ("Get All Defects", self.test_get_defects),
            ("Get Defects by Category", self.test_get_defects_by_category),
            ("Get Single Defect", self.test_get_single_defect),
            ("Get Categories", self.test_get_categories),
            ("Quiz Generation", self.test_quiz_generation),
            ("Diagnostic Scenario", self.test_diagnostic_scenario),
            ("Stats Endpoint", self.test_stats_endpoint),
        ]
        
        test_results = {}
        for test_name, test_func in tests:
            print(f"\n{'='*60}")
            print(f"Running: {test_name}")
            print('='*60)
            try:
                result = test_func()
                test_results[test_name] = result
                print(f"\n{test_name}: {'✅ PASSED' if result else '❌ FAILED'}")
            except Exception as e:
                print(f"\n❌ {test_name} FAILED with exception: {str(e)}")
                test_results[test_name] = False
                self.failed_tests.append({
                    "test": test_name,
                    "error": str(e)
                })
        
        # Final summary
        print(f"\n{'='*60}")
        print("📊 TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed tests: {len(self.failed_tests)}")
            for failure in self.failed_tests:
                print(f"  - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")
        
        return self.tests_passed == self.tests_run, test_results

def main():
    tester = BreadDefectAPITester()
    success, results = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())