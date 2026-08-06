/**
 * GeoTrack HRMS — Authentication API Router
 * File: Code.gs
 * 
 * Handles incoming HTTP GET & POST requests for Authentication endpoints only.
 */

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "health";
    
    // Auth Session Validation Endpoint: /auth/me or ?action=me
    if (action === "me" || action === "getMe" || action === "/api/auth/me") {
      var authHeader = (e && e.parameter && e.parameter.token) ? e.parameter.token : null;
      var meResult = handleGetMe(authHeader);
      if (meResult.errorDetail) {
        return jsonResponse(meResult.errorDetail, meResult.statusCode);
      }
      return jsonResponse(meResult.response, meResult.statusCode);
    }
    
    if (action === "health") {
      return jsonResponse({ status: "healthy", service: "GeoTrack Authentication Service", version: CONFIG.VERSION });
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
    
    // 1. POST Login Endpoint
    if (action === "login" || action === "/api/auth/login") {
      var loginResult = handleLogin(body.email, body.password);
      if (loginResult.errorDetail) {
        return jsonResponse(loginResult.errorDetail, loginResult.statusCode);
      }
      return jsonResponse(loginResult.response, loginResult.statusCode);
    }
    
    // 2. Session Validation Endpoint (POST variant)
    if (action === "me" || action === "getMe" || action === "/api/auth/me") {
      var token = body.token || (e && e.parameter && e.parameter.token);
      var meResultPost = handleGetMe(token);
      if (meResultPost.errorDetail) {
        return jsonResponse(meResultPost.errorDetail, meResultPost.statusCode);
      }
      return jsonResponse(meResultPost.response, meResultPost.statusCode);
    }
    
    // 3. Logout Endpoint
    if (action === "logout" || action === "/api/auth/logout") {
      var logoutResult = handleLogout();
      return jsonResponse(logoutResult.response, logoutResult.statusCode);
    }
    
    return jsonResponse({ detail: "Action not recognized" }, 400);
  } catch (err) {
    return jsonResponse({ detail: err.toString() }, 500);
  }
}
