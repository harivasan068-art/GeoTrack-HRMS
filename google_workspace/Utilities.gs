/**
 * GeoTrack HRMS — Helper Utilities
 * File: Utilities.gs
 * 
 * Helper functions for response formatting, date/time handling, unique ID generation,
 * and sheet lookup logic.
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
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  return ss.getSheetByName(sheetName);
}

/**
 * Generate Timestamp string ISO 8601
 */
function getISO8601Timestamp() {
  return new Date().toISOString();
}

/**
 * Generate Auto Increment ID or Unique ID
 */
function generateUniqueId(prefix) {
  var p = prefix || "ID";
  return p + "_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
}
