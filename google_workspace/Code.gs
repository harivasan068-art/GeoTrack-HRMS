/**
 * GeoTrack HRMS — API Router
 * File: Code.gs
 * 
 * Handles HTTP GET & POST requests for Auth, Employee, Attendance, and Drive Upload APIs.
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
    
    if (action === "health") {
      return jsonResponse({ status: "healthy", service: "GeoTrack Drive Upload, Attendance, Employee & Auth Services", version: CONFIG.VERSION });
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
    
    // -------------------------------------------------------------
    // Google Drive File Upload POST Endpoints
    // -------------------------------------------------------------
    
    // 1. Employee Photo Upload -> 'Employee Photos' folder
    if (action === "uploadEmployeePhoto" || action === "uploadPhoto" || action === "/api/auth/upload-photo") {
      var empPhotoRes = uploadEmployeePhoto(body.employee_id || body.id, body.fileBase64 || body.photo, body.filename, body.mimeType);
      return jsonResponse(empPhotoRes.response, empPhotoRes.statusCode);
    }
    
    // 2. Selfie Upload -> 'Selfies' folder
    if (action === "geotagUpload" || action === "uploadSelfie" || action === "/api/attendance/geotag-upload") {
      var selfieRes = uploadSelfie(body.employee_id, body.fileBase64 || body.photo, body.filename, body.mimeType);
      return jsonResponse(selfieRes.response, selfieRes.statusCode);
    }
    
    // 3. Work Proof Image Upload -> 'Work Proof Images' folder
    if (action === "uploadWorkProofImage" || action === "uploadProofImage" || action === "/api/work-proof/upload") {
      var isVid = body.mimeType && body.mimeType.indexOf("video") !== -1;
      if (isVid) {
        var vidRes = uploadWorkProofVideo(body.attendance_id, body.employee_id, body.fileBase64 || body.file, body.filename, body.mimeType, body.description);
        return jsonResponse(vidRes.response, vidRes.statusCode);
      }
      var imgRes = uploadWorkProofImage(body.attendance_id, body.employee_id, body.fileBase64 || body.file, body.filename, body.mimeType, body.description);
      return jsonResponse(imgRes.response, imgRes.statusCode);
    }
    
    // 4. Work Proof Video Upload -> 'Work Proof Videos' folder
    if (action === "uploadWorkProofVideo" || action === "uploadProofVideo") {
      var vidProofRes = uploadWorkProofVideo(body.attendance_id, body.employee_id, body.fileBase64 || body.file, body.filename, body.mimeType, body.description);
      return jsonResponse(vidProofRes.response, vidProofRes.statusCode);
    }
    
    // 5. Company Logo Upload -> 'Company Logos' folder
    if (action === "uploadCompanyLogo" || action === "uploadLogo") {
      var logoRes = uploadCompanyLogo(body.fileBase64 || body.logo, body.filename, body.mimeType);
      return jsonResponse(logoRes.response, logoRes.statusCode);
    }
    
    return jsonResponse({ detail: "Action not recognized" }, 400);
  } catch (err) {
    return jsonResponse({ detail: err.toString() }, 500);
  }
}
