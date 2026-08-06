/**
 * GeoTrack HRMS — Entry Point Router
 * File: Code.gs
 * 
 * Handles incoming HTTP GET & POST requests for Google Apps Script Web App API deployment.
 * Logic implementation to follow in subsequent API phases.
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "health";
  
  if (action === "health") {
    return jsonResponse({ status: "healthy", message: "GeoTrack HRMS Apps Script Backend Operational", version: CONFIG.VERSION });
  }
  
  return jsonResponse({ error: "Endpoint or action not found" }, 404);
}

function doPost(e) {
  try {
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    }
    
    var action = postData.action || (e && e.parameter && e.parameter.action);
    
    if (action === "ping") {
      return jsonResponse({ message: "pong" });
    }
    
    return jsonResponse({ error: "Invalid action specified" }, 400);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}
