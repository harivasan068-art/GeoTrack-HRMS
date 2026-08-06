/**
 * GeoTrack HRMS — Entry Point Router
 * File: Code.gs
 */

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "health";
    
    // Router logic for GET requests
    switch (action) {
      case "health":
        return jsonResponse({ status: "healthy", message: "GeoTrack HRMS Apps Script Operational", version: CONFIG.VERSION });
        
      case "company":
      case "getCompanySettings":
        return jsonResponse(getCompanySettings());
        
      case "employees":
      case "getEmployees":
        return jsonResponse(getEmployees());
        
      case "employee":
      case "getEmployeeById":
        return jsonResponse(getEmployeeById(params.id || params.employee_id));
        
      case "todayAttendance":
      case "getTodayAttendance":
        return jsonResponse(getTodayAttendance(params.employee_id));
        
      case "attendanceHistory":
      case "getAttendanceHistory":
        return jsonResponse(getAttendanceHistory(params.employee_id));
        
      case "workProofs":
      case "getWorkProofs":
        return jsonResponse(getWorkProofs(params.attendance_id));
        
      case "auditLogs":
      case "getAuditLogs":
        return jsonResponse(getAuditLogs());
        
      default:
        return jsonResponse({ error: "Invalid action parameter '" + action + "'" }, 404);
    }
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        body = e.parameter || {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }
    
    var action = body.action || (e && e.parameter && e.parameter.action);
    
    if (!action) {
      return jsonResponse({ error: "Missing required 'action' parameter" }, 400);
    }
    
    // Router logic for POST / PUT / DELETE requests
    switch (action) {
      case "login":
        var loginResult = handleLogin(body.email, body.password);
        return jsonResponse(loginResult, loginResult.status || 200);
        
      case "register":
      case "createEmployee":
        var regResult = createEmployee(body);
        return jsonResponse(regResult, regResult.status || 201);
        
      case "updateEmployee":
        return jsonResponse(updateEmployee(body.employee_id || body.id, body));
        
      case "deleteEmployee":
        return jsonResponse(deleteEmployee(body.employee_id || body.id));
        
      case "geotagUpload":
      case "submitGeotagPhoto":
        return jsonResponse(submitGeotagPhoto(body.fileBase64, body.filename, body.mimeType));
        
      case "checkIn":
        return jsonResponse(checkIn(body));
        
      case "checkOut":
        return jsonResponse(checkOut(body));
        
      case "verifyAttendance":
        return jsonResponse(verifyAttendance(body.attendance_id || body.id, body.status, body.admin_notes, body.admin_name));
        
      case "uploadWorkProof":
        return jsonResponse(uploadWorkProof(
          body.attendance_id,
          body.employee_id,
          body.fileBase64,
          body.filename,
          body.mimeType,
          body.description
        ));
        
      case "deleteWorkProof":
        return jsonResponse(deleteWorkProof(body.id || body.proof_id));
        
      case "updateCompanySettings":
        return jsonResponse(updateCompanySettings(body));
        
      case "logAuditAction":
        return jsonResponse(logAuditAction(body.action_description, body.admin_name, body.employee_id, body.remarks));
        
      default:
        return jsonResponse({ error: "Invalid action parameter '" + action + "'" }, 400);
    }
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}
