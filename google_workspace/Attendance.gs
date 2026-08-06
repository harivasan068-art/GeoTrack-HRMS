/**
 * GeoTrack HRMS — Attendance Module
 * File: Attendance.gs
 */

/**
 * Handle Base64 geotag upload to Google Drive Selfies folder
 */
function submitGeotagPhoto(fileBase64, filename, mimeType) {
  var rootFolder = getOrCreateFolder(CONFIG.DRIVE_FOLDER_NAMES.ROOT);
  var selfiesFolder = getOrCreateFolder(CONFIG.DRIVE_FOLDER_NAMES.SELFIES, rootFolder);
  
  var name = filename || ("selfie_" + new Date().getTime() + ".jpg");
  var type = mimeType || "image/jpeg";
  
  var decoded = Utilities.base64Decode(fileBase64);
  var blob = Utilities.newBlob(decoded, type, name);
  var file = selfiesFolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return {
    photo_url: file.getUrl(),
    file_id: file.getId()
  };
}

/**
 * Check In employee with Geofence Distance Calculation
 */
function checkIn(data) {
  if (!data.employee_id) {
    return { error: "employee_id is required", status: 400 };
  }
  
  var settings = getCompanySettings();
  var lat = parseFloat(data.latitude || settings.office_latitude);
  var lon = parseFloat(data.longitude || settings.office_longitude);
  
  var dist = calculateDistanceMeters(
    lat, lon,
    settings.office_latitude, settings.office_longitude
  );
  
  var isInside = dist <= settings.geofence_radius_meters;
  var attStatus = isInside ? "Pending Approval" : "Pending Approval (Outside Zone)";
  
  var records = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  var newId = records.length + 1;
  var now = new Date();
  var dateStr = now.toISOString().split("T")[0];
  var nowISO = now.toISOString();
  
  var newRecord = {
    id: newId,
    employee_id: data.employee_id,
    check_in: nowISO,
    check_out: "",
    latitude: lat,
    longitude: lon,
    location_name: data.location_name || settings.company_name,
    address: data.address || settings.address,
    campaign_name: data.campaign_name || "HQ",
    photo_url: data.photo_url || "",
    status: attStatus,
    is_inside_geofence: isInside,
    browser: data.browser || "Web",
    device: data.device || "Mobile/Desktop",
    ip_address: data.ip_address || "127.0.0.1",
    admin_notes: "",
    remarks: data.remarks || "Check in",
    approved_by: "",
    approved_at: "",
    verified_at: "",
    date: dateStr,
    created_at: nowISO
  };
  
  appendObjectToSheet(CONFIG.SHEETS.ATTENDANCE, newRecord);
  return newRecord;
}

/**
 * Check Out employee
 */
function checkOut(data) {
  if (!data.employee_id) {
    return { error: "employee_id is required", status: 400 };
  }
  
  var records = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  var dateStr = new Date().toISOString().split("T")[0];
  var todayRecord = null;
  
  for (var i = records.length - 1; i >= 0; i--) {
    if (String(records[i].employee_id) === String(data.employee_id) && records[i].date === dateStr) {
      todayRecord = records[i];
      break;
    }
  }
  
  if (!todayRecord) {
    return { error: "No check-in record found for today", status: 404 };
  }
  
  var nowISO = new Date().toISOString();
  var updateData = { check_out: nowISO };
  updateObjectInSheet(CONFIG.SHEETS.ATTENDANCE, "id", todayRecord.id, updateData);
  
  todayRecord.check_out = nowISO;
  return todayRecord;
}

/**
 * Get Today's Attendance for Employee
 */
function getTodayAttendance(employeeId) {
  var records = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  var dateStr = new Date().toISOString().split("T")[0];
  
  for (var i = records.length - 1; i >= 0; i--) {
    if (String(records[i].employee_id) === String(employeeId) && records[i].date === dateStr) {
      return records[i];
    }
  }
  return null;
}

/**
 * Get Attendance History
 */
function getAttendanceHistory(employeeId) {
  var records = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  if (!employeeId) return records;
  
  return records.filter(function(rec) {
    return String(rec.employee_id) === String(employeeId);
  });
}

/**
 * Verify Attendance (Admin)
 */
function verifyAttendance(attendanceId, statusVal, adminNotes, adminName) {
  var nowISO = new Date().toISOString();
  var updateObj = {
    status: statusVal || "Present",
    admin_notes: adminNotes || "Verified by admin",
    approved_by: adminName || "Admin",
    approved_at: nowISO,
    verified_at: nowISO
  };
  
  var success = updateObjectInSheet(CONFIG.SHEETS.ATTENDANCE, "id", attendanceId, updateObj);
  if (!success) return { error: "Attendance record not found", status: 404 };
  
  return { success: true, id: attendanceId, status: statusVal };
}
