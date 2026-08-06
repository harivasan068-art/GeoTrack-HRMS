/**
 * GeoTrack HRMS — Google Drive File Upload Unit Tests
 * File: TestDriveUploads.gs
 * 
 * Run these functions in the Apps Script Editor to test all 5 file uploads.
 */

// Small sample Base64 1x1 PNG image
var SAMPLE_BASE64_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * Test 1: Upload Employee Photo -> 'Employee Photos' folder
 */
function test_01_upload_employee_photo() {
  Logger.log("--- TEST 1: Upload Employee Photo ---");
  var res = uploadEmployeePhoto("EMP001", SAMPLE_BASE64_IMAGE, "avatar.png", "image/png");
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Result: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response.secure_url && res.response.public_id) {
    Logger.log("✅ TEST 1 PASSED: Employee Photo Upload Succeeded!");
  } else {
    Logger.log("❌ TEST 1 FAILED!");
  }
}

/**
 * Test 2: Upload Selfie -> 'Selfies' folder
 */
function test_02_upload_selfie() {
  Logger.log("--- TEST 2: Upload Selfie ---");
  var res = uploadSelfie("EMP002", SAMPLE_BASE64_IMAGE, "selfie.png", "image/png");
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Result: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response.secure_url) {
    Logger.log("✅ TEST 2 PASSED: Selfie Upload Succeeded!");
  } else {
    Logger.log("❌ TEST 2 FAILED!");
  }
}

/**
 * Test 3: Upload Work Proof Image -> 'Work Proof Images' folder
 */
function test_03_upload_work_proof_image() {
  Logger.log("--- TEST 3: Upload Work Proof Image ---");
  var res = uploadWorkProofImage(1, "EMP004", SAMPLE_BASE64_IMAGE, "poster.png", "image/png", "Site poster installation proof");
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Result: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response.secure_url) {
    Logger.log("✅ TEST 3 PASSED: Work Proof Image Upload Succeeded!");
  } else {
    Logger.log("❌ TEST 3 FAILED!");
  }
}

/**
 * Test 4: Upload Work Proof Video -> 'Work Proof Videos' folder
 */
function test_04_upload_work_proof_video() {
  Logger.log("--- TEST 4: Upload Work Proof Video ---");
  var res = uploadWorkProofVideo(1, "EMP004", SAMPLE_BASE64_IMAGE, "site_inspection.mp4", "video/mp4", "Site video walkthrough");
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Result: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response.secure_url) {
    Logger.log("✅ TEST 4 PASSED: Work Proof Video Upload Succeeded!");
  } else {
    Logger.log("❌ TEST 4 FAILED!");
  }
}

/**
 * Test 5: Upload Company Logo -> 'Company Logos' folder
 */
function test_05_upload_company_logo() {
  Logger.log("--- TEST 5: Upload Company Logo ---");
  var res = uploadCompanyLogo(SAMPLE_BASE64_IMAGE, "logo.png", "image/png");
  Logger.log("Status Code: " + res.statusCode);
  Logger.log("Result: " + JSON.stringify(res.response, null, 2));
  
  if (res.statusCode === 200 && res.response.secure_url) {
    Logger.log("✅ TEST 5 PASSED: Company Logo Upload Succeeded!");
  } else {
    Logger.log("❌ TEST 5 FAILED!");
  }
}

/**
 * Run All Drive Upload Unit Tests
 */
function runAllDriveUploadTests() {
  test_01_upload_employee_photo();
  test_02_upload_selfie();
  test_03_upload_work_proof_image();
  test_04_upload_work_proof_video();
  test_05_upload_company_logo();
}
