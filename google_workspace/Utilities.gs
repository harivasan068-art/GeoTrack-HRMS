/**
 * GeoTrack HRMS — Helper Utilities & Sheet ORM
 * File: Utilities.gs
 */

/**
 * Format JSON API Response
 */
function jsonResponse(data, status) {
  var responseStatus = status || 200;
  var payload = {
    status: responseStatus,
    data: data
  };
  
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get Sheet reference by name
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
    throw new Error("Sheet '" + sheetName + "' not found in spreadsheet.");
  }
  return sheet;
}

/**
 * Convert sheet data rows into an array of JS Objects
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
 * Append object as new row in sheet matching headers
 */
function appendObjectToSheet(sheetName, obj) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  var newRow = [];
  for (var c = 0; c < headers.length; c++) {
    var header = headers[c];
    newRow.push(obj[header] !== undefined ? obj[header] : "");
  }
  sheet.appendRow(newRow);
  return obj;
}

/**
 * Update row by key column value
 */
function updateObjectInSheet(sheetName, keyColumn, keyValue, updateObj) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  var keyColIdx = headers.indexOf(keyColumn);
  if (keyColIdx === -1) throw new Error("Column '" + keyColumn + "' not found.");
  
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][keyColIdx]) === String(keyValue)) {
      for (var key in updateObj) {
        var colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          sheet.getRange(r + 1, colIdx + 1).setValue(updateObj[key]);
        }
      }
      return true;
    }
  }
  return false;
}

/**
 * Delete row by key column value
 */
function deleteObjectFromSheet(sheetName, keyColumn, keyValue) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var keyColIdx = headers.indexOf(keyColumn);
  if (keyColIdx === -1) return false;
  
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][keyColIdx]) === String(keyValue)) {
      sheet.deleteRow(r + 1);
      return true;
    }
  }
  return false;
}

/**
 * Haversine formula distance calculation in meters
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  var R = 6371000; // Radius of Earth in meters
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get or create subfolder in Google Drive
 */
function getOrCreateFolder(folderName, parentFolder) {
  var parent = parentFolder || DriveApp.getRootFolder();
  var folders = parent.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(folderName);
}

/**
 * Simple SHA-256 Hash for Passwords
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
 * Verify Password Hash
 */
function verifyPassword(inputPassword, storedHash) {
  if (!storedHash) return false;
  // Support both SHA-256 and legacy plain text fallback during testing
  if (storedHash === inputPassword) return true;
  return hashPassword(inputPassword) === storedHash;
}
