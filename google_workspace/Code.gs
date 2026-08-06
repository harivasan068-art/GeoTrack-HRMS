/**
 * GeoTrack HRMS — API Router
 * File: Code.gs
 * 
 * Handles HTTP GET & POST requests for Auth, Employee, Attendance, Drive Uploads, and Reports APIs.
 */

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "health";
    
    // Auth GET Endpoints
    if (action === "me" || action === "getMe" || action === "/api/auth/me") {
      var token = params.token || (e && e.parameter && e.parameter.token);
      var meResult = handleGetMe(token);
      if (meResult.errorDetail) return jsonResponse(meResult.errorDetail, meResult.statusCode);
      return jsonResponse(meResult.response, meResult.statusCode);
    }
    
    // Employee GET Endpoints
    if (action === "employees" || action === "getEmployees" || action === "listEmployees" || action === "/api/admin/employees") {
      if (params.search || params.q || params.query) {
        var searchRes = searchEmployees(params.search || params.q || params.query);
        return jsonResponse(searchRes.response, searchRes.statusCode);
      }
      var listRes = getEmployees();
      return jsonResponse(listRes.response, listRes.statusCode);
    }
    
    if (action === "employee" || action === "getEmployee" || action === "getEmployeeById") {
      var empId = params.id || params.employee_id;
      var getRes = getEmployeeById(empId);
      if (getRes.errorDetail) return jsonResponse(getRes.errorDetail, getRes.statusCode);
      return jsonResponse(getRes.response, getRes.statusCode);
    }
    
    if (action === "searchEmployees" || action === "search") {
      var searchOnlyRes = searchEmployees(params.search || params.q || params.query || "");
      return jsonResponse(searchOnlyRes.response, searchOnlyRes.statusCode);
    }
    
    // Attendance GET Endpoints
    if (action === "today" || action === "todayAttendance" || action === "getTodayAttendance" || action === "/api/attendance/today") {
      var todayEmpId = params.employee_id || params.id;
      if (!todayEmpId && params.token) {
        var decoded = decodeAccessToken(params.token);
        if (decoded && decoded.sub) todayEmpId = decoded.sub;
      }
      var todayRes = getTodayAttendance(todayEmpId);
      if (todayRes.errorDetail) return jsonResponse(todayRes.errorDetail, todayRes.statusCode);
      return jsonResponse(todayRes.response, todayRes.statusCode);
    }
    
    if (action === "history" || action === "attendanceHistory" || action === "getAttendanceHistory" || action === "/api/attendance/history") {
      var histEmpId = params.employee_id || params.id;
      if (!histEmpId && params.token) {
        var decodedHist = decodeAccessToken(params.token);
        if (decodedHist && decodedHist.sub) histEmpId = decodedHist.sub;
      }
      var histRes = getAttendanceHistory(histEmpId);
      if (histRes.errorDetail) return jsonResponse(histRes.errorDetail, histRes.statusCode);
      return jsonResponse(histRes.response, histRes.statusCode);
    }
    
    // -------------------------------------------------------------
    // Reports & Dashboard GET Endpoints
    // -------------------------------------------------------------
    
    // 1. Dashboard Statistics (/api/admin/dashboard or action=dashboard)
    if (action === "dashboard" || action === "getDashboard" || action === "/api/admin/dashboard") {
      var dashRes = getDashboardStats();
      return jsonResponse(dashRes.response, dashRes.statusCode);
    }
    
    // 2. Attendance Reports (/api/admin/reports or action=reports)
    if (action === "reports" || action === "getReports" || action === "/api/admin/reports") {
      var reportRes = getAttendanceReports(params.start_date, params.end_date);
      return jsonResponse(reportRes.response, reportRes.statusCode);
    }
    
    // 3. Monthly Reports Breakdown (action=monthlyReports)
    if (action === "monthlyReports" || action === "getMonthlyReports") {
      var monthRes = getMonthlyReports(params.year);
      return jsonResponse(monthRes.response, monthRes.statusCode);
    }
    
    // 4. Employee Report API (action=employeeReport)
    if (action === "employeeReport" || action === "getEmployeeReport") {
      var empReportRes = getSingleEmployeeReport(params.employee_id || params.id, params.start_date, params.end_date);
      if (empReportRes.errorDetail) return jsonResponse(empReportRes.errorDetail, empReportRes.statusCode);
      return jsonResponse(empReportRes.response, empReportRes.statusCode);
    }
    
    if (action === "health") {
      return jsonResponse({ status: "healthy", service: "GeoTrack Reports, Dashboard, Drive, Attendance, Employee & Auth Services", version: CONFIG.VERSION });
    }
    
    return jsonResponse({ detail: "Endpoint or action not found" }, 404);
  } catch (err) {
    return jsonResponse({ detail: err.toString() }, 500);
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
    
    var action = body.action || (e && e.parameter && e.parameter.action) || "login";
    
    // Auth POST Endpoints
    if (action === "login" || action === "/api/auth/login") {
      var loginResult = handleLogin(body.email, body.password);
      if (loginResult.errorDetail) return jsonResponse(loginResult.errorDetail, loginResult.statusCode);
      return jsonResponse(loginResult.response, loginResult.statusCode);
    }
    
    if (action === "me" || action === "getMe" || action === "/api/auth/me") {
      var meToken = body.token || (e && e.parameter && e.parameter.token);
      var meResultPost = handleGetMe(meToken);
      if (meResultPost.errorDetail) return jsonResponse(meResultPost.errorDetail, meResultPost.statusCode);
      return jsonResponse(meResultPost.response, meResultPost.statusCode);
    }
    
    if (action === "logout" || action === "/api/auth/logout") {
      var logoutResult = handleLogout();
      return jsonResponse(logoutResult.response, logoutResult.statusCode);
    }
    
    // Employee POST Endpoints
    if (action === "createEmployee" || action === "register" || action === "/api/admin/employees") {
      var createRes = createEmployee(body);
      if (createRes.errorDetail) return jsonResponse(createRes.errorDetail, createRes.statusCode);
      return jsonResponse(createRes.response, createRes.statusCode);
    }
    
    if (action === "updateEmployee") {
      var targetId = body.employee_id || body.id || (e && e.parameter && e.parameter.id);
      var updateRes = updateEmployee(targetId, body);
      if (updateRes.errorDetail) return jsonResponse(updateRes.errorDetail, updateRes.statusCode);
      return jsonResponse(updateRes.response, updateRes.statusCode);
    }
    
    if (action === "deleteEmployee") {
      var delId = body.employee_id || body.id || (e && e.parameter && e.parameter.id);
      var delRes = deleteEmployee(delId);
      if (delRes.errorDetail) return jsonResponse(delRes.errorDetail, delRes.statusCode);
      return jsonResponse(delRes.response, delRes.statusCode);
    }
    
    // Attendance POST Endpoints
    if (action === "checkIn" || action === "/api/attendance/check-in") {
      if (body.token && !body.employee_id) {
        var decCheckIn = decodeAccessToken(body.token);
        if (decCheckIn && decCheckIn.sub) body.employee_id = decCheckIn.sub;
      }
      var checkInRes = checkIn(body);
      if (checkInRes.errorDetail) return jsonResponse(checkInRes.errorDetail, checkInRes.statusCode);
      return jsonResponse(checkInRes.response, checkInRes.statusCode);
    }
    
    if (action === "checkOut" || action === "/api/attendance/check-out") {
      if (body.token && !body.employee_id) {
        var decCheckOut = decodeAccessToken(body.token);
        if (decCheckOut && decCheckOut.sub) body.employee_id = decCheckOut.sub;
      }
      var checkOutRes = checkOut(body);
      if (checkOutRes.errorDetail) return jsonResponse(checkOutRes.errorDetail, checkOutRes.statusCode);
      return jsonResponse(checkOutRes.response, checkOutRes.statusCode);
    }
    
    // Drive Upload POST Endpoints
    if (action === "uploadEmployeePhoto" || action === "uploadPhoto" || action === "/api/auth/upload-photo") {
      var empPhotoRes = uploadEmployeePhoto(body.employee_id || body.id, body.fileBase64 || body.photo, body.filename, body.mimeType);
      return jsonResponse(empPhotoRes.response, empPhotoRes.statusCode);
    }
    
    if (action === "geotagUpload" || action === "uploadSelfie" || action === "/api/attendance/geotag-upload") {
      var selfieRes = uploadSelfie(body.employee_id, body.fileBase64 || body.photo, body.filename, body.mimeType);
      return jsonResponse(selfieRes.response, selfieRes.statusCode);
    }
    
    if (action === "uploadWorkProofImage" || action === "uploadProofImage" || action === "/api/work-proof/upload") {
      var isVid = body.mimeType && body.mimeType.indexOf("video") !== -1;
      if (isVid) {
        var vidRes = uploadWorkProofVideo(body.attendance_id, body.employee_id, body.fileBase64 || body.file, body.filename, body.mimeType, body.description);
        return jsonResponse(vidRes.response, vidRes.statusCode);
      }
      var imgRes = uploadWorkProofImage(body.attendance_id, body.employee_id, body.fileBase64 || body.file, body.filename, body.mimeType, body.description);
      return jsonResponse(imgRes.response, imgRes.statusCode);
    }
    
    if (action === "uploadWorkProofVideo" || action === "uploadProofVideo") {
      var vidProofRes = uploadWorkProofVideo(body.attendance_id, body.employee_id, body.fileBase64 || body.file, body.filename, body.mimeType, body.description);
      return jsonResponse(vidProofRes.response, vidProofRes.statusCode);
    }
    
    if (action === "uploadCompanyLogo" || action === "uploadLogo") {
      var logoRes = uploadCompanyLogo(body.fileBase64 || body.logo, body.filename, body.mimeType);
      return jsonResponse(logoRes.response, logoRes.statusCode);
    }
    
    return jsonResponse({ detail: "Action not recognized" }, 400);
  } catch (err) {
    return jsonResponse({ detail: err.toString() }, 500);
  }
}
