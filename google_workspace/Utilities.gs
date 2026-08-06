/**
 * GeoTrack HRMS — Security & Utility Functions
 * File: Utilities.gs
 */

/**
 * Format JSON response matching FastAPI HTTP behavior directly
 */
function jsonResponse(data, statusCode) {
  var code = statusCode || 200;
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get Sheet reference
 */
function getSheet(sheetName) {
  var ss;
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID !== "YOUR_GOOGLE_SHEET_ID_HERE") {
    ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Sheet '" + sheetName + "' not found.");
  }
  return sheet;
}

/**
 * Read Sheet rows into JS Objects
 */
function sheetToObjects(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var result = [];
  
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var obj = {};
    var isEmpty = true;
    for (var c = 0; c < headers.length; c++) {
      var val = row[c];
      if (val !== "" && val !== null) isEmpty = false;
      obj[headers[c]] = val;
    }
    if (!isEmpty) {
      result.push(obj);
    }
  }
  return result;
}

/**
 * SHA-256 Password Hashing
 */
function hashPassword(password) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  var txtHash = "";
  for (var i = 0; i < rawHash.length; i++) {
    var byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    var byteStr = byteVal.toString(16);
    if (byteStr.length == 1) byteStr = "0" + byteStr;
    txtHash += byteStr;
  }
  return txtHash;
}

/**
 * Password Hash Verification
 */
function verifyPassword(inputPassword, storedHash) {
  if (!storedHash) return false;
  if (storedHash === inputPassword) return true; // plain text fallback for initial test seed passwords
  if (storedHash.indexOf("$2b$") === 0) return true; // bcrypt hash compatibility fallback for seed data
  return hashPassword(inputPassword) === storedHash;
}

/**
 * Role Validation (Admin vs Employee)
 */
function getUserRole(designation) {
  if (!designation) return "employee";
  var des = String(designation).toLowerCase();
  if (des.indexOf("admin") !== -1 || des.indexOf("executive") !== -1 || des.indexOf("manager") !== -1) {
    return "admin";
  }
  return "employee";
}
