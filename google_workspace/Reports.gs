/**
 * GeoTrack HRMS — Reports & Analytics Module
 * File: Reports.gs
 * 
 * Generates Dashboard statistics, Monthly reports, Employee reports,
 * and Attendance reports directly from Google Sheets (Employees & Attendance sheets).
 * Returns JSON compatible with the existing frontend & FastAPI backend schemas.
 */

/**
 * 1. Dashboard Statistics API
 * Returns: { total_employees, present_count, absent_count, late_count, pending_count, geofence_violations }
 */
function getDashboardStats() {
  var employees = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  var nonAdminEmployees = employees.filter(function(emp) {
    return !emp.designation || String(emp.designation).toLowerCase().indexOf("admin") === -1;
  });
  
  var totalEmployees = nonAdminEmployees.length;
  var todayDateStr = new Date().toISOString().split("T")[0];
  var attendanceRecords = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  
  var presentCount = 0;
  var lateCount = 0;
  var pendingCount = 0;
  var geofenceViolations = 0;
  
  for (var i = 0; i < attendanceRecords.length; i++) {
    var rec = attendanceRecords[i];
    if (rec.date === todayDateStr) {
      var status = String(rec.status || "").toLowerCase();
      if (status.indexOf("present") !== -1) {
        presentCount++;
      } else if (status.indexOf("pending") !== -1) {
        pendingCount++;
      }
      
      // Late check: check_in after 09:30 AM
      if (rec.check_in) {
        var checkInDate = new Date(rec.check_in);
        var hours = checkInDate.getHours();
        var mins = checkInDate.getMinutes();
        if (hours > 9 || (hours === 9 && mins > 30)) {
          lateCount++;
        }
      }
      
      if (rec.is_inside_geofence === false || String(rec.is_inside_geofence).toUpperCase() === "FALSE") {
        geofenceViolations++;
      }
    }
  }
  
  var absentCount = Math.max(totalEmployees - (presentCount + pendingCount), 0);
  
  var result = {
    total_employees: totalEmployees,
    present_count: presentCount,
    absent_count: absentCount,
    late_count: lateCount,
    pending_count: pendingCount,
    geofence_violations: geofenceViolations,
    today_date: todayDateStr
  };
  
  return {
    response: result,
    statusCode: 200
  };
}

/**
 * 2. General Attendance Reports API
 * Returns array of AttendanceReportItem objects per employee for a date range or current month
 */
function getAttendanceReports(startDateStr, endDateStr) {
  var now = new Date();
  var defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  var defaultEnd = now.toISOString().split("T")[0];
  
  var start = startDateStr || defaultStart;
  var end = endDateStr || defaultEnd;
  
  var startDt = new Date(start);
  var endDt = new Date(end);
  var totalDays = Math.max(Math.floor((endDt - startDt) / (1000 * 60 * 60 * 24)) + 1, 1);
  
  var employees = sheetToObjects(CONFIG.SHEETS.EMPLOYEES);
  var nonAdminEmployees = employees.filter(function(emp) {
    return !emp.designation || String(emp.designation).toLowerCase().indexOf("admin") === -1;
  });
  
  var attendanceRecords = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  var reports = [];
  
  for (var i = 0; i < nonAdminEmployees.length; i++) {
    var emp = nonAdminEmployees[i];
    var empId = String(emp.employee_id);
    
    var presentDays = 0;
    var lateArrivals = 0;
    
    for (var j = 0; j < attendanceRecords.length; j++) {
      var rec = attendanceRecords[j];
      if (String(rec.employee_id) === empId && rec.date >= start && rec.date <= end) {
        var status = String(rec.status || "").toLowerCase();
        if (status.indexOf("present") !== -1 || status.indexOf("approved") !== -1) {
          presentDays++;
        }
        if (rec.check_in) {
          var cTime = new Date(rec.check_in);
          if (cTime.getHours() > 9 || (cTime.getHours() === 9 && cTime.getMinutes() > 30)) {
            lateArrivals++;
          }
        }
      }
    }
    
    var absentDays = Math.max(totalDays - presentDays, 0);
    var presentRate = totalDays > 0 ? parseFloat(((presentDays / totalDays) * 100).toFixed(2)) : 0;
    
    reports.push({
      employee_id: empId,
      full_name: String(emp.full_name || ""),
      department: String(emp.department || "General"),
      designation: String(emp.designation || "Employee"),
      total_days: totalDays,
      present_days: presentDays,
      absent_days: absentDays,
      late_arrivals: lateArrivals,
      present_rate: presentRate
    });
  }
  
  return {
    response: reports,
    statusCode: 200
  };
}

/**
 * 3. Monthly Reports Breakdown
 * Returns month-by-month attendance aggregations directly from Google Sheets
 */
function getMonthlyReports(yearVal) {
  var targetYear = yearVal ? parseInt(yearVal, 10) : new Date().getFullYear();
  var attendanceRecords = sheetToObjects(CONFIG.SHEETS.ATTENDANCE);
  
  var monthlyStats = {};
  for (var m = 1; m <= 12; m++) {
    var monthKey = targetYear + "-" + ("0" + m).slice(-2);
    monthlyStats[monthKey] = {
      month: monthKey,
      total_check_ins: 0,
      present_count: 0,
      late_count: 0,
      geofence_violations: 0
    };
  }
  
  for (var i = 0; i < attendanceRecords.length; i++) {
    var rec = attendanceRecords[i];
    var recDate = rec.date || (rec.created_at ? rec.created_at.split("T")[0] : "");
    if (recDate && recDate.indexOf(targetYear + "-") === 0) {
      var monthPrefix = recDate.substring(0, 7);
      if (monthlyStats[monthPrefix]) {
        monthlyStats[monthPrefix].total_check_ins++;
        var status = String(rec.status || "").toLowerCase();
        if (status.indexOf("present") !== -1) monthlyStats[monthPrefix].present_count++;
        if (rec.check_in) {
          var cDt = new Date(rec.check_in);
          if (cDt.getHours() > 9 || (cDt.getHours() === 9 && cDt.getMinutes() > 30)) {
            monthlyStats[monthPrefix].late_count++;
          }
        }
        if (rec.is_inside_geofence === false || String(rec.is_inside_geofence).toUpperCase() === "FALSE") {
          monthlyStats[monthPrefix].geofence_violations++;
        }
      }
    }
  }
  
  var resultList = Object.keys(monthlyStats).map(function(key) {
    return monthlyStats[key];
  });
  
  return {
    response: resultList,
    statusCode: 200
  };
}

/**
 * 4. Individual Employee Report API
 * Returns detailed attendance metrics for a specific employee over a date range
 */
function getSingleEmployeeReport(employeeId, startDateStr, endDateStr) {
  if (!employeeId) {
    return {
      errorDetail: { detail: "employee_id parameter is required" },
      statusCode: 400
    };
  }
  
  var emp = getEmployeeById(employeeId);
  if (emp.errorDetail) return emp;
  
  var empProfile = emp.response;
  var now = new Date();
  var start = startDateStr || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  var end = endDateStr || now.toISOString().split("T")[0];
  
  var startDt = new Date(start);
  var endDt = new Date(end);
  var totalDays = Math.max(Math.floor((endDt - startDt) / (1000 * 60 * 60 * 24)) + 1, 1);
  
  var history = getAttendanceHistory(employeeId).response || [];
  var filteredHistory = history.filter(function(rec) {
    return rec.date >= start && rec.date <= end;
  });
  
  var presentDays = 0;
  var lateDays = 0;
  var geofenceViolations = 0;
  
  for (var i = 0; i < filteredHistory.length; i++) {
    var rec = filteredHistory[i];
    var status = String(rec.status || "").toLowerCase();
    if (status.indexOf("present") !== -1 || status.indexOf("approved") !== -1) {
      presentDays++;
    }
    if (rec.check_in) {
      var cTime = new Date(rec.check_in);
      if (cTime.getHours() > 9 || (cTime.getHours() === 9 && cTime.getMinutes() > 30)) {
        lateDays++;
      }
    }
    if (rec.is_inside_geofence === false) {
      geofenceViolations++;
    }
  }
  
  var absentDays = Math.max(totalDays - presentDays, 0);
  var attendancePercentage = totalDays > 0 ? parseFloat(((presentDays / totalDays) * 100).toFixed(2)) : 0;
  
  var reportObj = {
    employee: empProfile,
    date_range: { start_date: start, end_date: end },
    metrics: {
      total_days: totalDays,
      present_days: presentDays,
      absent_days: absentDays,
      late_days: lateDays,
      geofence_violations: geofenceViolations,
      attendance_percentage: attendancePercentage
    },
    attendance_records: filteredHistory
  };
  
  return {
    response: reportObj,
    statusCode: 200
  };
}
