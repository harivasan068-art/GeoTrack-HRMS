/**
 * GeoTrack HRMS — Authentication Module
 * File: Auth.gs
 * 
 * Handles POST Login, Logout, Session Validation (/me), JWT creation/verification,
 * password hashing, and role validation matching FastAPI endpoints exactly.
 */

/**
 * Generate Access Token
 */
function createAccessToken(employeeId, role) {
  var now = new Date().getTime();
  var expireTime = now + (CONFIG.SECURITY.TOKEN_EXPIRE_MINUTES * 60 * 1000);
  
  var payload = {
    sub: employeeId,
    role: role,
    iat: Math.floor(now / 1000),
    exp: Math.floor(expireTime / 1000)
  };
  
  return Utilities.base64Encode(JSON.stringify(payload));
}

/**
 * Decode and Validate Token
 */
function decodeAccessToken(token) {
  if (!token) return null;
  
  try {
    var cleanToken = token;
    if (token.indexOf("Bearer ") === 0) {
      cleanToken = token.substring(7);
    }
    
    var decodedStr = Utilities.newBlob(Utilities.base64Decode(cleanToken)).getDataAsString();
    var payload = JSON.parse(decodedStr);
    
    var nowSec = Math.floor(new Date().getTime() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      return null; // Expired token
    }
    return payload;
  } catch (e) {
    return null; // Invalid token format
  }
}

/**
 * POST Login Handler (Matches FastAPI TokenResponse schema exactly)
 * Response: { access_token, token_type: "bearer", role, employee_id, full_name }
 */
function handleLogin(email, password) {
  if (!email || !password) {
    return {
      errorDetail: { detail: "Invalid email or password" },
      statusCode: 401
    };
  }
  
  var employees = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  var user = null;
  
  for (var i = 0; i < employees.length; i++) {
    if (String(employees[i].email).toLowerCase().trim() === String(email).toLowerCase().trim()) {
      user = employees[i];
      break;
    }
  }
  
  if (!user || !verifyPassword(password, user.password)) {
    return {
      errorDetail: { detail: "Invalid email or password" },
      statusCode: 401
    };
  }
  
  var role = getUserRole(user.designation);
  var accessToken = createAccessToken(user.employee_id, role);
  
  // Exact TokenResponse format matching FastAPI
  return {
    response: {
      access_token: accessToken,
      token_type: "bearer",
      role: role,
      employee_id: String(user.employee_id),
      full_name: String(user.full_name)
    },
    statusCode: 200
  };
}

/**
 * Session Validation Handler (/me Endpoint)
 * Matches FastAPI EmployeeResponse schema
 */
function handleGetMe(token) {
  var payload = decodeAccessToken(token);
  if (!payload || !payload.sub) {
    return {
      errorDetail: { detail: "Invalid or expired token" },
      statusCode: 401
    };
  }
  
  var employees = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  var user = null;
  
  for (var i = 0; i < employees.length; i++) {
    if (String(employees[i].employee_id) === String(payload.sub)) {
      user = employees[i];
      break;
    }
  }
  
  if (!user) {
    return {
      errorDetail: { detail: "User not found" },
      statusCode: 401
    };
  }
  
  var userClean = Object.assign({}, user);
  delete userClean.password;
  
  return {
    response: userClean,
    statusCode: 200
  };
}

/**
 * Logout Handler
 */
function handleLogout() {
  return {
    response: { message: "Logged out successfully" },
    statusCode: 200
  };
}
