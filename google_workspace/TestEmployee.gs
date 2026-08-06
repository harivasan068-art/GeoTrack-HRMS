/**
 * GeoTrack HRMS — Employee Management Unit Tests
 * File: TestEmployee.gs
 * 
 * Run these functions in the Apps Script Editor to test all Employee APIs.
 */

/**
 * Test 1: List All Employees
 */
function test_01_list_employees() {
  Logger.log("--- TEST 1: List Employees ---");
  var res = getEmployees();
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Total Employees: " + res.response.length);
  Logger.log("First Employee: " + JSON.stringify(res.response[0], null, 2));
  
  if (res.statusCode === 200 && Array.isArray(res.response)) {
    Logger.log("✅ TEST 1 PASSED: List Employees Succeeded!");
  } else {
    Logger.log("❌ TEST 1 FAILED!");
  }
}

/**
 * Test 2: Create Employee
 */
function test_02_create_employee() {
  Logger.log("--- TEST 2: Create Employee ---");
  var testEmail = "test.worker." + new Date().getTime() + "@geotrack.com";
  var newEmp = {
    full_name: "Test Field Worker",
    email: testEmail,
    phone: "+1-555-9999",
    department: "Software Engineering",
    designation: "Frontend Developer",
    password: "password123"
  };
  
  var res = createEmployee(newEmp);
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Created Employee: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 201 && res.response.employee_id && res.response.email === testEmail) {
    Logger.log("✅ TEST 2 PASSED: Create Employee Succeeded!");
  } else {
    Logger.log("❌ TEST 2 FAILED!");
  }
}

/**
 * Test 3: Duplicate Email Validation
 */
function test_03_duplicate_email_validation() {
  Logger.log("--- TEST 3: Duplicate Email Validation ---");
  var duplicateEmp = {
    full_name: "Duplicate User",
    email: "admin@geotrack.com", // existing email
    phone: "+1-555-8888",
    department: "Engineering",
    designation: "Developer",
    password: "password123"
  };
  
  var res = createEmployee(duplicateEmp);
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Error Detail: " + JSON.stringify(res.errorDetail, null, 2));
  
  if (res.statusCode === 400 && res.errorDetail.detail === "Email already registered") {
    Logger.log("✅ TEST 3 PASSED: Duplicate Email Validation Correctly Rejected!");
  } else {
    Logger.log("❌ TEST 3 FAILED!");
  }
}

/**
 * Test 4: Search Employees
 */
function test_04_search_employees() {
  Logger.log("--- TEST 4: Search Employees ---");
  var res = searchEmployees("Sarah");
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Found Records: " + res.response.length);
  
  if (res.statusCode === 200 && res.response.length >= 1) {
    Logger.log("✅ TEST 4 PASSED: Search Employees Succeeded!");
  } else {
    Logger.log("❌ TEST 4 FAILED!");
  }
}

/**
 * Test 5: Get Employee by ID
 */
function test_05_get_employee_by_id() {
  Logger.log("--- TEST 5: Get Employee By ID ---");
  var res = getEmployeeById("EMP001");
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Employee: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response.employee_id === "EMP001") {
    Logger.log("✅ TEST 5 PASSED: Get Employee By ID Succeeded!");
  } else {
    Logger.log("❌ TEST 5 FAILED!");
  }
}

/**
 * Run All Employee Unit Tests
 */
function runAllEmployeeTests() {
  test_01_list_employees();
  test_02_create_employee();
  test_03_duplicate_email_validation();
  test_04_search_employees();
  test_05_get_employee_by_id();
}
