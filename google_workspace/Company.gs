/**
 * GeoTrack HRMS — Company Branding & Audit Logs Module
 * File: Company.gs
 */

function getCompanySettings() {
  var settings = sheetToObjects(CONFIG.SHEETS.COMPANY_SETTINGS);
  if (settings.length > 0) {
    return settings[0];
  }
  
  // Default fallback company settings
  return {
    id: 1,
    company_name: "GeoTrack Enterprise HRMS",
    company_logo: "",
    theme_color: "#4f46e5",
    phone: "+1-800-555-0199",
    email: "contact@geotrackhrms.com",
    address: "100 Tech Park Way, Suite 400, San Francisco, CA",
    website: "https://geotrackhrms.com",
    office_latitude: 37.7749,
    office_longitude: -122.4194,
    geofence_radius_meters: 200.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function updateCompanySettings(data) {
  var nowISO = new Date().toISOString();
  data.updated_at = nowISO;
  var success = updateObjectInSheet(CONFIG.SHEETS.COMPANY_SETTINGS, "id", 1, data);
  if (!success) {
    data.id = 1;
    data.created_at = nowISO;
    appendObjectToSheet(CONFIG.SHEETS.COMPANY_SETTINGS, data);
  }
  return getCompanySettings();
}

function logAuditAction(action, adminName, employeeId, remarks) {
  var logs = sheetToObjects(CONFIG.SHEETS.AUDIT_LOGS);
  var newId = logs.length + 1;
  var nowISO = new Date().toISOString();
  
  var newLog = {
    id: newId,
    action: action,
    employee_id: employeeId || "",
    admin_name: adminName || "System",
    remarks: remarks || "",
    created_at: nowISO
  };
  
  appendObjectToSheet(CONFIG.SHEETS.AUDIT_LOGS, newLog);
  return newLog;
}

function getAuditLogs() {
  return sheetToObjects(CONFIG.SHEETS.AUDIT_LOGS);
}
