/**
 * GeoTrack HRMS — API Router
 * File: Code.gs
 * 
 * Handles incoming HTTP GET & POST requests for Auth, Employee, and Attendance APIs.
 */

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "health";
    
    // -------------------------------------------------------------
    // Auth GET Endpoints
    // -------------------------------------------------------------
    if (action === "me" || action === "getMe" || action === "/api/auth/me") {
      var token = params.token || (e && e.parameter && e.parameter.token);
      var meResult = handleGetMe(token);
      if (meResult.errorDetail) {
        return jsonResponse(meResult.errorDetail, meResult.statusCode);
      }
      return jsonResponse(meResult.response, meResult.statusCode);
    }
    
    // -------------------------------------------------------------
    // Employee GET Endpoints
    // -------------------------------------------------------------
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
      if (getRes.errorDetail) {
        return jsonResponse(getRes.errorDetail, getRes.statusCode);
      }
      return jsonResponse(getRes.response, getRes.statusCode);
    }
    
    if (action === "searchEmployees" || action === "search") {
      var searchOnlyRes = searchEmployees(params.search || params.q || params.query || "");
      return jsonResponse(searchOnlyRes.response, searchOnlyRes.statusCode);
    }
    
    // -------------------------------------------------------------
    // Attendance GET Endpoints (Today's Attendance & History)
    // -------------------------------------------------------------
    if (action === "today" || action === "todayAttendance" || action === "getTodayAttendance" || action === "/api/attendance/today") {
      var todayEmpId = params.employee_id || params.id;
      if (!todayEmpId && params.token) {
        var decoded = decodeAccessToken(params.token);
        if (decoded && decoded.sub) todayEmpId = decoded.sub;
      }
      var todayRes = getTodayAttendance(todayEmpId);
      if (todayRes.errorDetail) {
        return jsonResponse(todayRes.errorDetail, todayRes.statusCode);
      }
      return jsonResponse(todayRes.response, todayRes.statusCode);
    }
    
    if (action === "history" || action === "attendanceHistory" || action === "getAttendanceHistory" || action === "/api/attendance/history") {
      var histEmpId = params.employee_id || params.id;
      if (!histEmpId && params.token) {
        var decodedHist = decodeAccessToken(params.token);
        if (decodedHist && decodedHist.sub) histEmpId = decodedHist.sub;
      }
      var histRes = getAttendanceHistory(histEmpId);
      if (histRes.errorDetail) {
        return jsonResponse(histRes.errorDetail, histRes.statusCode);
      }
      return jsonResponse(histRes.response, histRes.statusCode);
    }
    
    if (action === "health") {
      return jsonResponse({ status: "healthy", service: "GeoTrack Attendance, Employee & Auth Services", version: CONFIG.VERSION });
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
    
    // -------------------------------------------------------------
    // Auth POST Endpoints
    // -------------------------------------------------------------
    if (action === "login" || action === "/api/auth/login") {
      var loginResult = handleLogin(body.email, body.password);
      if (loginResult.errorDetail) {
        return jsonResponse(loginResult.errorDetail, loginResult.statusCode);
      }
      return jsonResponse(loginResult.response, loginResult.statusCode);
    }
    
    if (action === "me" || action === "getMe" || action === "/api/auth/me") {
      var meToken = body.token || (e && e.parameter && e.parameter.token);
      var meResultPost = handleGetMe(meToken);
      if (meResultPost.errorDetail) {
        return jsonResponse(meResultPost.errorDetail, meResultPost.statusCode);
      }
      return jsonResponse(meResultPost.response, meResultPost.statusCode);
    }
    
    if (action === "logout" || action === "/api/auth/logout") {
      var logoutResult = handleLogout();
      return jsonResponse(logoutResult.response, logoutResult.statusCode);
    }
    
    // -------------------------------------------------------------
    // Employee POST Endpoints
    // -------------------------------------------------------------
    if (action === "createEmployee" || action === "register" || action === "/api/admin/employees") {
      var createRes = createEmployee(body);
      if (createRes.errorDetail) {
        return jsonResponse(createRes.errorDetail, createRes.statusCode);
      }
      return jsonResponse(createRes.response, createRes.statusCode);
    }
    
    if (action === "updateEmployee") {
      var targetId = body.employee_id || body.id || (e && e.parameter && e.parameter.id);
      var updateRes = updateEmployee(targetId, body);
      if (updateRes.errorDetail) {
        return jsonResponse(updateRes.errorDetail, updateRes.statusCode);
      }
      return jsonResponse(updateRes.response, updateRes.statusCode);
    }
    
    if (action === "deleteEmployee") {
      var delId = body.employee_id || body.id || (e && e.parameter && e.parameter.id);
      var delRes = deleteEmployee(delId);
      if (delRes.errorDetail) {
        return jsonResponse(delRes.errorDetail, delRes.statusCode);
      }
      return jsonResponse(delRes.response, delRes.statusCode);
    }
    
    // -------------------------------------------------------------
    // Attendance POST Endpoints (Check In & Check Out)
    // -------------------------------------------------------------
    if (action === "checkIn" || action === "geotagUpload" || action === "/api/attendance/check-in" || action === "/api/attendance/geotag-upload") {
      if (body.token && !body.employee_id) {
        var decCheckIn = decodeAccessToken(body.token);
        if (decCheckIn && decCheckIn.sub) body.employee_id = decCheckIn.sub;
      }
      var checkInRes = checkIn(body);
      if (checkInRes.errorDetail) {
        return jsonResponse(checkInRes.errorDetail, checkInRes.statusCode);
      }
      return jsonResponse(checkInRes.response, checkInRes.statusCode);
    }
    
    if (action === "checkOut" || action === "/api/attendance/check-out") {
      if (body.token && !body.employee_id) {
        var decCheckOut = decodeAccessToken(body.token);
        if (decCheckOut && decCheckOut.sub) body.employee_id = decCheckOut.sub;
      }
      var checkOutRes = checkOut(body);
      if (checkOutRes.errorDetail) {
        return jsonResponse(checkOutRes.errorDetail, checkOutRes.statusCode);
      }
      return jsonResponse(checkOutRes.response, checkOutRes.statusCode);
    }
    
    if (action === "verifyAttendance" || action === "verify") {
      var attId = body.attendance_id || body.id;
      var verifyRes = verifyAttendance(attId, body.status, body.admin_notes, body.admin_name);
      if (verifyRes.errorDetail) {
        return jsonResponse(verifyRes.errorDetail, verifyRes.statusCode);
      }
      return jsonResponse(verifyRes.response, verifyRes.statusCode);
    }
    
    return jsonResponse({ detail: "Action not recognized" }, 400);
  } catch (err) {
    return jsonResponse({ detail: err.toString() }, 500);
  }
}
