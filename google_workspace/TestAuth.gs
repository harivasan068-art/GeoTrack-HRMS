/**
 * GeoTrack HRMS — Authentication Unit Tests
 * File: TestAuth.gs
 * 
 * Run these functions directly in the Apps Script Editor to test every Auth endpoint.
 */

/**
 * Test 1: Admin Login Success
 */
function test_01_admin_login_success() {
  Logger.log("--- TEST 1: Admin Login Success ---");
  var result = handleLogin("admin@geotrack.com", "admin123");
  Logger.log("Status Code: " + result.statusCode);
  Logger.log("Response: " + JSON.stringify(result.response, null, 2));
  
  if (result.statusCode === 200 && result.response.access_token && result.response.role === "admin") {
    Logger.log("✅ TEST 1 PASSED: Admin Login Succeeded!");
  } else {
    Logger.log("❌ TEST 1 FAILED!");
  }
}

/**
 * Test 2: Employee Login Success
 */
function test_02_employee_login_success() {
  Logger.log("--- TEST 2: Employee Login Success ---");
  var result = handleLogin("john.doe@geotrack.com", "password123");
  Logger.log("Status Code: " + result.statusCode);
  Logger.log("Response: " + JSON.stringify(result.response, null, 2));
  
  if (result.statusCode === 200 && result.response.access_token && result.response.role === "employee") {
    Logger.log("✅ TEST 2 PASSED: Employee Login Succeeded!");
  } else {
    Logger.log("❌ TEST 2 FAILED!");
  }
}

/**
 * Test 3: Invalid Password Login
 */
function test_03_invalid_login_failure() {
  Logger.log("--- TEST 3: Invalid Password Login ---");
  var result = handleLogin("admin@geotrack.com", "wrongpassword");
  Logger.log("Status Code: " + result.statusCode);
  Logger.log("Response: " + JSON.stringify(result.errorDetail, null, 2));
  
  if (result.statusCode === 401 && result.errorDetail.detail === "Invalid email or password") {
    Logger.log("✅ TEST 3 PASSED: Invalid Login Correctly Rejected!");
  } else {
    Logger.log("❌ TEST 3 FAILED!");
  }
}

/**
 * Test 4: Session Validation (/auth/me)
 */
function test_04_session_validation_me() {
  Logger.log("--- TEST 4: Session Validation (/auth/me) ---");
  var loginRes = handleLogin("admin@geotrack.com", "admin123");
  var token = loginRes.response.access_token;
  
  var meRes = handleGetMe(token);
  Logger.log("Status Code: " + meRes.statusCode);
  Logger.log("User Profile: " + JSON.stringify(meRes.response, null, 2));
  
  if (meRes.statusCode === 200 && meRes.response.email === "admin@geotrack.com") {
    Logger.log("✅ TEST 4 PASSED: Session Validation Succeeded!");
  } else {
    Logger.log("❌ TEST 4 FAILED!");
  }
}

/**
 * Test 5: Logout
 */
function test_05_logout() {
  Logger.log("--- TEST 5: Logout ---");
  var res = handleLogout();
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Response: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response.message === "Logged out successfully") {
    Logger.log("✅ TEST 5 PASSED: Logout Succeeded!");
  } else {
    Logger.log("❌ TEST 5 FAILED!");
  }
}

/**
 * Run All Authentication Unit Tests
 */
function runAllAuthTests() {
  test_01_admin_login_success();
  test_02_employee_login_success();
  test_03_invalid_login_failure();
  test_04_session_validation_me();
  test_05_logout();
}
