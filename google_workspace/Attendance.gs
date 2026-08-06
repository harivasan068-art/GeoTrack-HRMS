/**
 * GeoTrack HRMS — Attendance Module
 * File: Attendance.gs
 * 
 * Handles Check In, Check Out, Today's Attendance, Attendance History,
 * GPS Coordinates, Address, Remarks, and Status calculations.
 * Matches FastAPI AttendanceResponse schemas and formatting.
 */

/**
 * Format raw attendance object from sheet to match FastAPI AttendanceResponse schema
 */
function formatAttendanceResponse(att) {
  if (!att) return null;
  var copy = Object.assign({}, att);
  
  // Format numeric types
  copy.id = parseInt(copy.id, 10) || 0;
  copy.latitude = (copy.latitude !== "" && copy.latitude !== null && copy.latitude !== undefined) ? parseFloat(copy.latitude) : null;
  copy.longitude = (copy.longitude !== "" && copy.longitude !== null && copy.longitude !== undefined) ? parseFloat(copy.longitude) : null;
  
  // Format boolean type
  copy.is_inside_geofence = (copy.is_inside_geofence === true || String(copy.is_inside_geofence).toUpperCase() === "TRUE");
  
  // Format nullables
  copy.check_in = copy.check_in || null;
  copy.check_out = copy.check_out || null;
  copy.location_name = copy.location_name || null;
  copy.address = copy.address || null;
  copy.campaign_name = copy.campaign_name || null;
  copy.photo_url = copy.photo_url || null;
  copy.browser = copy.browser || null;
  copy.device = copy.device || null;
  copy.ip_address = copy.ip_address || null;
  copy.admin_notes = copy.admin_notes || null;
  copy.remarks = copy.remarks || null;
  copy.approved_by = copy.approved_by || null;
  copy.approved_at = copy.approved_at || null;
  copy.verified_at = copy.verified_at || null;
  
  // Format date
  if (copy.date && copy.date instanceof Date) {
    copy.date = copy.date.toISOString().split("T")[0];
  } else if (!copy.date) {
    copy.date = new Date().toISOString().split("T")[0];
  }
  
  // Include empty work_proofs list for schema parity
  copy.work_proofs = copy.work_proofs || [];
  
  return copy;
}

/**
 * 1. Check In API (GPS Coordinates, Address, Remarks, Status & Geofence Calculation)
 */
function checkIn(data) {
  if (!data || !data.employee_id) {
    return {
      errorDetail: { detail: "employee_id parameter is required" },
      statusCode: 400
    };
  }
  
  var settings = getCompanySettings();
  var lat = (data.latitude !== undefined && data.latitude !== null) ? parseFloat(data.latitude) : parseFloat(settings.office_latitude);
  var lon = (data.longitude !== undefined && data.longitude !== null) ? parseFloat(data.longitude) : parseFloat(settings.office_longitude);
  
  // Calculate distance in meters using Haversine formula
  var distanceMeters = calculateDistanceMeters(
    lat, lon,
    parseFloat(settings.office_latitude), parseFloat(settings.office_longitude)
  );
  
  var isInsideGeofence = distanceMeters <= parseFloat(settings.geofence_radius_meters);
  var defaultStatus = isInsideGeofence ? "Pending Approval" : "Pending Approval (Outside Zone)";
  
  var records = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  var now = new Date();
  var todayDateStr = now.toISOString().split("T")[0];
  var nowISO = now.toISOString();
  
  // Check if check-in already exists for today
  for (var i = records.length - 1; i >= 0; i--) {
    if (String(records[i].employee_id) === String(data.employee_id) && records[i].date === todayDateStr) {
      // Return existing today record
      return {
        response: formatAttendanceResponse(records[i]),
        statusCode: 200
      };
    }
  }
  
  var newId = records.length + 1;
  
  var newAttendanceRecord = {
    id: newId,
    employee_id: String(data.employee_id),
    check_in: nowISO,
    check_out: "",
    latitude: lat,
    longitude: lon,
    location_name: data.location_name || settings.company_name,
    address: data.address || settings.address,
    campaign_name: data.campaign_name || "HQ Office",
    photo_url: data.photo_url || "",
    status: data.status || defaultStatus,
    is_inside_geofence: isInsideGeofence,
    browser: data.browser || "Web Browser",
    device: data.device || "Desktop/Mobile",
    ip_address: data.ip_address || "127.0.0.1",
    admin_notes: "",
    remarks: data.remarks || "Check-in recorded",
    approved_by: "",
    approved_at: "",
    verified_at: "",
    date: todayDateStr,
    created_at: nowISO
  };
  
  appendObjectToSheet(CONFIG.SHEETS.ATTENDANCE, newAttendanceRecord);
  
  return {
    response: formatAttendanceResponse(newAttendanceRecord),
    statusCode: 201
  };
}

/**
 * 2. Check Out API
 */
function checkOut(data) {
  if (!data || !data.employee_id) {
    return {
      errorDetail: { detail: "employee_id parameter is required" },
      statusCode: 400
    };
  }
  
  var records = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  var todayDateStr = new Date().toISOString().split("T")[0];
  var activeRecord = null;
  
  for (var i = records.length - 1; i >= 0; i--) {
    if (String(records[i].employee_id) === String(data.employee_id) && records[i].date === todayDateStr) {
      activeRecord = records[i];
      break;
    }
  }
  
  if (!activeRecord) {
    return {
      errorDetail: { detail: "No active check-in record found for today" },
      statusCode: 404
    };
  }
  
  var nowISO = new Date().toISOString();
  var updatePayload = {
    check_out: nowISO
  };
  
  if (data.latitude !== undefined && data.latitude !== null) updatePayload.latitude = parseFloat(data.latitude);
  if (data.longitude !== undefined && data.longitude !== null) updatePayload.longitude = parseFloat(data.longitude);
  if (data.location_name) updatePayload.location_name = data.location_name;
  if (data.address) updatePayload.address = data.address;
  if (data.remarks) updatePayload.remarks = data.remarks;
  
  updateObjectInSheet(CONFIG.SHEETS.ATTENDANCE, "id", activeRecord.id, updatePayload);
  
  activeRecord.check_out = nowISO;
  if (updatePayload.latitude) activeRecord.latitude = updatePayload.latitude;
  if (updatePayload.longitude) activeRecord.longitude = updatePayload.longitude;
  if (updatePayload.location_name) activeRecord.location_name = updatePayload.location_name;
  if (updatePayload.address) activeRecord.address = updatePayload.address;
  
  return {
    response: formatAttendanceResponse(activeRecord),
    statusCode: 200
  };
}

/**
 * 3. Today's Attendance API
 */
function getTodayAttendance(employeeId) {
  if (!employeeId) {
    return {
      errorDetail: { detail: "employee_id parameter is required" },
      statusCode: 400
    };
  }
  
  var records = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  var todayDateStr = new Date().toISOString().split("T")[0];
  
  for (var i = records.length - 1; i >= 0; i--) {
    if (String(records[i].employee_id) === String(employeeId) && records[i].date === todayDateStr) {
      return {
        response: formatAttendanceResponse(records[i]),
        statusCode: 200
      };
    }
  }
  
  return {
    response: null,
    statusCode: 200
  };
}

/**
 * 4. Attendance History API
 */
function getAttendanceHistory(employeeId) {
  var records = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  var filtered = records;
  
  if (employeeId) {
    filtered = records.filter(function(rec) {
      return String(rec.employee_id) === String(employeeId);
    });
  }
  
  // Sort date descending
  filtered.sort(function(a, b) {
    return new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime();
  });
  
  return {
    response: filtered.map(formatAttendanceResponse),
    statusCode: 200
  };
}

/**
 * Verify Attendance Status (Admin endpoint)
 */
function verifyAttendance(attendanceId, statusVal, adminNotes, adminName) {
  if (!attendanceId) {
    return {
      errorDetail: { detail: "attendanceId parameter is required" },
      statusCode: 400
    };
  }
  
  var nowISO = new Date().toISOString();
  var updatePayload = {
    status: statusVal || "Present",
    admin_notes: adminNotes || "Verified by Admin",
    approved_by: adminName || "Admin",
    approved_at: nowISO,
    verified_at: nowISO
  };
  
  var success = updateObjectInSheet(CONFIG.SHEETS.ATTENDANCE, "id", attendanceId, updatePayload);
  if (!success) {
    return {
      errorDetail: { detail: "Attendance record not found" },
      statusCode: 404
    };
  }
  
  return {
    response: {
      id: parseInt(attendanceId, 10),
      status: statusVal || "Present",
      admin_notes: adminNotes || "Verified by Admin"
    },
    statusCode: 200
  };
}
