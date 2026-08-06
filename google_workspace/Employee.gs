/**
 * GeoTrack HRMS — Employee Management Module
 * File: Employee.gs
 */

function getEmployees() {
  var list = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  return list.map(function(emp) {
    var copy = Object.assign({}, emp);
    delete copy.password;
    return copy;
  });
}

function getEmployeeById(employeeId) {
  var list = getEmployees();
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].employee_id) === String(employeeId) || String(list[i].id) === String(employeeId)) {
      return list[i];
    }
  }
  return null;
}

function createEmployee(data) {
  return registerUser(data);
}

function updateEmployee(employeeId, data) {
  data.updated_at = new Date().toISOString();
  if (data.password) {
    data.password = hashPassword(data.password);
  }
  var success = updateObjectInSheet(CONFIG.SHEETS.EMPLOYEES, "employee_id", employeeId, data);
  if (!success) {
    success = updateObjectInSheet(CONFIG.SHEETS.EMPLOYEES, "id", employeeId, data);
  }
  if (success) {
    return getEmployeeById(employeeId);
  }
  return { error: "Employee not found", status: 404 };
}

function deleteEmployee(employeeId) {
  var success = deleteObjectFromSheet(CONFIG.SHEETS.EMPLOYEES, "employee_id", employeeId);
  if (!success) {
    success = deleteObjectFromSheet(CONFIG.SHEETS.EMPLOYEES, "id", employeeId);
  }
  return { success: success };
}
