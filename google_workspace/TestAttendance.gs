/**
 * GeoTrack HRMS — Attendance Unit Tests
 * File: TestAttendance.gs
 * 
 * Run these functions in the Apps Script Editor to test all Attendance APIs.
 */

/**
 * Test 1: Check In (Inside Geofence)
 */
function test_01_check_in_inside_geofence() {
  Logger.log("--- TEST 1: Check In (Inside Geofence) ---");
  var payload = {
    employee_id: "EMP002",
    latitude: 37.7749,
    longitude: -122.4194,
    location_name: "San Francisco Tech Park HQ",
    address: "100 Tech Park Way, Suite 400",
    remarks: "Morning check in test"
  };
  
  var res = checkIn(payload);
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Attendance Record: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 201 || res.statusCode === 200) {
    if (res.response.employee_id === "EMP002" && res.response.is_inside_geofence === true) {
      Logger.log("✅ TEST 1 PASSED: Check In Succeeded inside Geofence!");
    } else {
      Logger.log("❌ TEST 1 FAILED: Geofence mismatch!");
    }
  } else {
    Logger.log("❌ TEST 1 FAILED!");
  }
}

/**
 * Test 2: Check Out
 */
function test_02_check_out() {
  Logger.log("--- TEST 2: Check Out ---");
  var payload = {
    employee_id: "EMP002",
    latitude: 37.7749,
    longitude: -122.4194,
    location_name: "San Francisco Tech Park HQ"
  };
  
  var res = checkOut(payload);
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Checked Out Record: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response.check_out) {
    Logger.log("✅ TEST 2 PASSED: Check Out Succeeded!");
  } else {
    Logger.log("❌ TEST 2 FAILED!");
  }
}

/**
 * Test 3: Get Today's Attendance
 */
function test_03_get_today_attendance() {
  Logger.log("--- TEST 3: Get Today's Attendance ---");
  var res = getTodayAttendance("EMP002");
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Today Record: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response && res.response.employee_id === "EMP002") {
    Logger.log("✅ TEST 3 PASSED: Get Today's Attendance Succeeded!");
  } else {
    Logger.log("❌ TEST 3 FAILED!");
  }
}

/**
 * Test 4: Attendance History
 */
function test_04_attendance_history() {
  Logger.log("--- TEST 4: Attendance History ---");
  var res = getAttendanceHistory("EMP002");
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("History Length: " + res.response.length);
  
  if (res.statusCode === 200 && Array.isArray(res.response)) {
    Logger.log("✅ TEST 4 PASSED: Attendance History Succeeded!");
  } else {
    Logger.log("❌ TEST 4 FAILED!");
  }
}

/**
 * Run All Attendance Unit Tests
 */
function runAllAttendanceTests() {
  test_01_check_in_inside_geofence();
  test_02_check_out();
  test_03_get_today_attendance();
  test_04_attendance_history();
}
