/**
 * GeoTrack HRMS — Authentication Module
 * File: Auth.gs
 */

/**
 * Handle user login
 */
function handleLogin(email, password) {
  if (!email || !password) {
    return { error: "Email and password are required", status: 400 };
  }
  
  var employees = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  var user = null;
  
  for (var i = 0; i < employees.length; i++) {
    if (String(employees[i].email).toLowerCase() === String(email).toLowerCase()) {
      user = employees[i];
      break;
    }
  }
  
  if (!user) {
    return { error: "Invalid credentials", status: 401 };
  }
  
  if (!verifyPassword(password, user.password)) {
    return { error: "Invalid credentials", status: 401 };
  }
  
  var role = (user.designation && String(user.designation).toLowerCase().indexOf("admin") !== -1) ? "admin" : "employee";
  
  // Clean user object for token/session
  var userClean = {
    id: user.id,
    employee_id: user.employee_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    designation: user.designation,
    photo: user.photo,
    joining_date: user.joining_date,
    status: user.status,
    role: role
  };
  
  // Generate dummy JWT / session payload
  var tokenPayload = {
    sub: user.email,
    employee_id: user.employee_id,
    role: role,
    exp: new Date().getTime() + (CONFIG.SECURITY.TOKEN_EXPIRE_HOURS * 3600 * 1000)
  };
  
  var token = Utilities.base64Encode(JSON.stringify(tokenPayload));
  
  return {
    access_token: token,
    token_type: "bearer",
    role: role,
    user: userClean
  };
}

/**
 * Register employee account
 */
function registerUser(userData) {
  var employees = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  
  for (var i = 0; i < employees.length; i++) {
    if (String(employees[i].email).toLowerCase() === String(userData.email).toLowerCase()) {
      return { error: "Employee email already registered", status: 400 };
    }
  }
  
  var newId = employees.length + 1;
  var employeeId = userData.employee_id || ("EMP" + ("000" + newId).slice(-3));
  var nowISO = new Date().toISOString();
  
  var newEmployee = {
    id: newId,
    employee_id: employeeId,
    full_name: userData.full_name,
    email: userData.email,
    phone: userData.phone || "",
    department: userData.department || "General",
    designation: userData.designation || "Employee",
    password: hashPassword(userData.password),
    photo: userData.photo || "",
    joining_date: userData.joining_date || nowISO.split("T")[0],
    status: "Active",
    created_at: nowISO,
    updated_at: nowISO
  };
  
  appendObjectToSheet(CONFIG.SHEETS.EMPLOYEES, newEmployee);
  
  delete newEmployee.password;
  return newEmployee;
}
