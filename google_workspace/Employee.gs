/**
 * GeoTrack HRMS — Employee Management Module
 * File: Employee.gs
 * 
 * Handles Create, Read (Get/List/Search), Update, Delete for Employee records in Google Sheets.
 * Matches FastAPI EmployeeResponse schemas and validation rules.
 */

/**
 * Helper to strip sensitive fields (password) and format dates
 */
function formatEmployeeResponse(emp) {
  if (!emp) return null;
  var copy = Object.assign({}, emp);
  delete copy.password;
  
  // Format date strings if needed
  if (copy.joining_date && copy.joining_date instanceof Date) {
    copy.joining_date = copy.joining_date.toISOString().split("T")[0];
  }
  if (copy.created_at && copy.created_at instanceof Date) {
    copy.created_at = copy.created_at.toISOString();
  }
  if (copy.updated_at && copy.updated_at instanceof Date) {
    copy.updated_at = copy.updated_at.toISOString();
  }
  
  return copy;
}

/**
 * Auto-generate next unique Employee ID (e.g., EMP001, EMP002)
 */
function generateNextEmployeeId() {
  var employees = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  var maxNum = 0;
  
  for (var i = 0; i < employees.length; i++) {
    var empId = String(employees[i].employee_id || "");
    var match = empId.match(/EMP(\d+)/i);
    if (match) {
      var num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  
  var nextNum = maxNum + 1;
  return "EMP" + ("000" + nextNum).slice(-3);
}

/**
 * 1. List Employees
 */
function getEmployees() {
  var list = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  return {
    response: list.map(formatEmployeeResponse),
    statusCode: 200
  };
}

/**
 * 2. Get Employee by ID or employee_id
 */
function getEmployeeById(idOrEmpId) {
  if (!idOrEmpId) {
    return {
      errorDetail: { detail: "Employee ID parameter is required" },
      statusCode: 400
    };
  }
  
  var list = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  var target = null;
  
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].employee_id) === String(idOrEmpId) || String(list[i].id) === String(idOrEmpId)) {
      target = list[i];
      break;
    }
  }
  
  if (!target) {
    return {
      errorDetail: { detail: "Employee not found" },
      statusCode: 404
    };
  }
  
  return {
    response: formatEmployeeResponse(target),
    statusCode: 200
  };
}

/**
 * 3. Search Employees by query string (name, email, department, designation, employee_id)
 */
function searchEmployees(query) {
  var list = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  if (!query) {
    return getEmployees();
  }
  
  var q = String(query).toLowerCase().trim();
  var filtered = list.filter(function(emp) {
    var nameMatch = String(emp.full_name || "").toLowerCase().indexOf(q) !== -1;
    var emailMatch = String(emp.email || "").toLowerCase().indexOf(q) !== -1;
    var deptMatch = String(emp.department || "").toLowerCase().indexOf(q) !== -1;
    var desMatch = String(emp.designation || "").toLowerCase().indexOf(q) !== -1;
    var idMatch = String(emp.employee_id || "").toLowerCase().indexOf(q) !== -1;
    return nameMatch || emailMatch || deptMatch || desMatch || idMatch;
  });
  
  return {
    response: filtered.map(formatEmployeeResponse),
    statusCode: 200
  };
}

/**
 * 4. Create Employee (with Email & Employee ID validation)
 */
function createEmployee(data) {
  if (!data || !data.full_name || !data.email) {
    return {
      errorDetail: { detail: "Full name and email are required" },
      statusCode: 400
    };
  }
  
  var employees = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  var cleanEmail = String(data.email).toLowerCase().trim();
  
  // Validate duplicate email
  for (var i = 0; i < employees.length; i++) {
    if (String(employees[i].email).toLowerCase().trim() === cleanEmail) {
      return {
        errorDetail: { detail: "Email already registered" },
        statusCode: 400
      };
    }
  }
  
  // Validate or generate employee_id
  var empId = data.employee_id;
  if (empId) {
    empId = String(empId).trim();
    for (var j = 0; j < employees.length; j++) {
      if (String(employees[j].employee_id).trim() === empId) {
        return {
          errorDetail: { detail: "Employee ID already exists" },
          statusCode: 400
        };
      }
    }
  } else {
    empId = generateNextEmployeeId();
  }
  
  var newNumericId = employees.length + 1;
  var nowISO = new Date().toISOString();
  var defaultDate = nowISO.split("T")[0];
  var rawPassword = data.password || "password123";
  
  var newEmployeeRecord = {
    id: newNumericId,
    employee_id: empId,
    full_name: String(data.full_name).trim(),
    email: cleanEmail,
    phone: data.phone ? String(data.phone).trim() : "",
    department: data.department ? String(data.department).trim() : "General",
    designation: data.designation ? String(data.designation).trim() : "Employee",
    password: hashPassword(rawPassword),
    photo: data.photo || "",
    joining_date: data.joining_date || defaultDate,
    status: data.status || "Active",
    created_at: nowISO,
    updated_at: nowISO
  };
  
  appendObjectToSheet(CONFIG.SHEETS.EMPLOYEES, newEmployeeRecord);
  
  return {
    response: formatEmployeeResponse(newEmployeeRecord),
    statusCode: 201
  };
}

/**
 * 5. Update Employee (with Duplicate Email & Employee ID validation)
 */
function updateEmployee(idOrEmpId, updateData) {
  if (!idOrEmpId) {
    return {
      errorDetail: { detail: "Employee ID parameter is required" },
      statusCode: 400
    };
  }
  
  var employees = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  var targetRecord = null;
  
  for (var i = 0; i < employees.length; i++) {
    if (String(employees[i].employee_id) === String(idOrEmpId) || String(employees[i].id) === String(idOrEmpId)) {
      targetRecord = employees[i];
      break;
    }
  }
  
  if (!targetRecord) {
    return {
      errorDetail: { detail: "Employee not found" },
      statusCode: 404
    };
  }
  
  var updates = {};
  var nowISO = new Date().toISOString();
  
  // Validate duplicate email if updating email
  if (updateData.email) {
    var cleanNewEmail = String(updateData.email).toLowerCase().trim();
    if (cleanNewEmail !== String(targetRecord.email).toLowerCase().trim()) {
      for (var e = 0; e < employees.length; e++) {
        if (String(employees[e].email).toLowerCase().trim() === cleanNewEmail &&
            String(employees[e].employee_id) !== String(targetRecord.employee_id)) {
          return {
            errorDetail: { detail: "Email address is already registered to another account" },
            statusCode: 400
          };
        }
      }
      updates.email = cleanNewEmail;
    }
  }
  
  // Validate employee_id if updating employee_id
  if (updateData.employee_id) {
    var cleanNewEmpId = String(updateData.employee_id).trim();
    if (cleanNewEmpId !== String(targetRecord.employee_id).trim()) {
      for (var d = 0; d < employees.length; d++) {
        if (String(employees[d].employee_id).trim() === cleanNewEmpId &&
            String(employees[d].id) !== String(targetRecord.id)) {
          return {
            errorDetail: { detail: "Employee ID already exists" },
            statusCode: 400
          };
        }
      }
      updates.employee_id = cleanNewEmpId;
    }
  }
  
  if (updateData.full_name) updates.full_name = String(updateData.full_name).trim();
  if (updateData.phone) updates.phone = String(updateData.phone).trim();
  if (updateData.department) updates.department = String(updateData.department).trim();
  if (updateData.designation) updates.designation = String(updateData.designation).trim();
  if (updateData.status) updates.status = String(updateData.status).trim();
  if (updateData.photo !== undefined) updates.photo = updateData.photo;
  if (updateData.joining_date) updates.joining_date = updateData.joining_date;
  if (updateData.password) updates.password = hashPassword(updateData.password);
  
  updates.updated_at = nowISO;
  
  var success = updateObjectInSheet(CONFIG.SHEETS.EMPLOYEES, "employee_id", targetRecord.employee_id, updates);
  if (!success) {
    success = updateObjectInSheet(CONFIG.SHEETS.EMPLOYEES, "id", targetRecord.id, updates);
  }
  
  var updated = getEmployeeById(updates.employee_id || targetRecord.employee_id);
  return updated;
}

/**
 * 6. Delete Employee
 */
function deleteEmployee(idOrEmpId) {
  if (!idOrEmpId) {
    return {
      errorDetail: { detail: "Employee ID parameter is required" },
      statusCode: 400
    };
  }
  
  var existing = getEmployeeById(idOrEmpId);
  if (existing.errorDetail) {
    return existing;
  }
  
  var success = deleteObjectFromSheet(CONFIG.SHEETS.EMPLOYEES, "employee_id", idOrEmpId);
  if (!success) {
    success = deleteObjectFromSheet(CONFIG.SHEETS.EMPLOYEES, "id", idOrEmpId);
  }
  
  return {
    response: { message: "Employee deleted successfully" },
    statusCode: 200
  };
}
