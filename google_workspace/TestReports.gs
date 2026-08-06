/**
 * GeoTrack HRMS — Reports & Analytics Unit Tests
 * File: TestReports.gs
 * 
 * Run these functions in the Apps Script Editor to test Dashboard & Reports APIs.
 */

/**
 * Test 1: Dashboard Statistics (total_employees, present_count, absent_count, late_count)
 */
function test_01_dashboard_stats() {
  Logger.log("--- TEST 1: Dashboard Statistics ---");
  var res = getDashboardStats();
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Dashboard Stats: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response.total_employees !== undefined && res.response.present_count !== undefined) {
    Logger.log("✅ TEST 1 PASSED: Dashboard Statistics Succeeded!");
  } else {
    Logger.log("❌ TEST 1 FAILED!");
  }
}

/**
 * Test 2: General Attendance Reports
 */
function test_02_attendance_reports() {
  Logger.log("--- TEST 2: General Attendance Reports ---");
  var res = getAttendanceReports();
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Report Records: " + res.response.length);
  if (res.response.length > 0) {
    Logger.log("First Report Item: " + JSON.stringify(res.response[0], null, 2));
  }
  
  if (res.statusCode === 200 && Array.isArray(res.response)) {
    Logger.log("✅ TEST 2 PASSED: Attendance Reports Succeeded!");
  } else {
    Logger.log("❌ TEST 2 FAILED!");
  }
}

/**
 * Test 3: Monthly Reports Breakdown
 */
function test_03_monthly_reports() {
  Logger.log("--- TEST 3: Monthly Reports Breakdown ---");
  var currentYear = new Date().getFullYear();
  var res = getMonthlyReports(currentYear);
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Total Months: " + res.response.length);
  Logger.log("First Month Item: " + JSON.stringify(res.response[0], null, 2));
  
  if (res.statusCode === 200 && res.response.length === 12) {
    Logger.log("✅ TEST 3 PASSED: Monthly Reports Succeeded!");
  } else {
    Logger.log("❌ TEST 3 FAILED!");
  }
}

/**
 * Test 4: Single Employee Report
 */
function test_04_single_employee_report() {
  Logger.log("--- TEST 4: Single Employee Report ---");
  var res = getSingleEmployeeReport("EMP002");
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Employee Report: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response.employee && res.response.metrics) {
    Logger.log("✅ TEST 4 PASSED: Single Employee Report Succeeded!");
  } else {
    Logger.log("❌ TEST 4 FAILED!");
  }
}

/**
 * Run All Reports & Dashboard Unit Tests
 */
function runAllReportsTests() {
  test_01_dashboard_stats();
  test_02_attendance_reports();
  test_03_monthly_reports();
  test_04_single_employee_report();
}
