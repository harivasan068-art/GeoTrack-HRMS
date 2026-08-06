/**
 * GeoTrack HRMS — API Router
 * File: Code.gs
 * 
 * Handles incoming HTTP GET & POST requests for Authentication and Employee endpoints.
 */

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "health";
    
    // -------------------------------------------------------------
    // Authentication GET Endpoints
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
    
    if (action === "health") {
      return jsonResponse({ status: "healthy", service: "GeoTrack Employee & Auth Services", version: CONFIG.VERSION });
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
    // Authentication POST Endpoints
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
    // Employee POST / PUT / DELETE Endpoints
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
    
    return jsonResponse({ detail: "Action not recognized" }, 400);
  } catch (err) {
    return jsonResponse({ detail: err.toString() }, 500);
  }
}
