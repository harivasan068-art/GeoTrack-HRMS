# GeoTrack HRMS — Google Workspace Backend Implementation & API Documentation

This directory contains the **complete business logic and ORM layer** for deploying GeoTrack HRMS directly on **Google Apps Script**, **Google Sheets**, and **Google Drive**.

---

## 1. Directory File Summary

- [Config.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Config.gs) — Configuration constants, Sheet IDs, Drive Folder Names, Security Key.
- [Utilities.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Utilities.gs) — Sheet ORM helpers (`sheetToObjects`, `appendObjectToSheet`, `updateObjectInSheet`, `deleteObjectFromSheet`), Haversine geofence calculation formula (`calculateDistanceMeters`), SHA-256 password hashing, Drive folder resolution.
- [Auth.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Auth.gs) — User authentication (`handleLogin`), password hash verification, user registration (`registerUser`).
- [Employee.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Employee.gs) — Employee management (`getEmployees`, `getEmployeeById`, `createEmployee`, `updateEmployee`, `deleteEmployee`).
- [Attendance.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Attendance.gs) — Attendance operations (`checkIn`, `checkOut`, `getTodayAttendance`, `getAttendanceHistory`, `verifyAttendance`), selfie Base64 upload to Google Drive (`submitGeotagPhoto`), and geofence verification.
- [Company.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Company.gs) — Company settings & branding (`getCompanySettings`, `updateCompanySettings`), audit log management (`logAuditAction`, `getAuditLogs`).
- [WorkProof.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/WorkProof.gs) — Work proof upload to Drive (`uploadWorkProof`), querying work proofs (`getWorkProofs`), deletion (`deleteWorkProof`).
- [Code.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Code.gs) — HTTP Web App entry point with complete `doGet(e)` and `doPost(e)` action routers.
- [appsscript.json](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/appsscript.json) — Manifest configuration and OAuth2 scopes.

---

## 2. API Endpoints Reference

### GET Endpoints (`doGet`)

Send HTTP GET requests to your Web App URL with an `action` query parameter:

1. **Health Check**:
   `GET .../exec?action=health`
2. **Get Company Settings**:
   `GET .../exec?action=company`
3. **Get Employees List**:
   `GET .../exec?action=employees`
4. **Get Single Employee**:
   `GET .../exec?action=employee&employee_id=EMP001`
5. **Get Today's Attendance**:
   `GET .../exec?action=todayAttendance&employee_id=EMP002`
6. **Get Attendance History**:
   `GET .../exec?action=attendanceHistory&employee_id=EMP002`
7. **Get Work Proofs**:
   `GET .../exec?action=workProofs&attendance_id=1`
8. **Get Audit Logs**:
   `GET .../exec?action=auditLogs`

---

### POST Endpoints (`doPost`)

Send HTTP POST requests to your Web App URL with a JSON payload:

1. **User Login**:
   ```json
   {
     "action": "login",
     "email": "admin@geotrack.com",
     "password": "admin123"
   }
   ```

2. **Check-In (with Geofence Calculation)**:
   ```json
   {
     "action": "checkIn",
     "employee_id": "EMP002",
     "latitude": 37.7749,
     "longitude": -122.4194,
     "location_name": "San Francisco HQ",
     "photo_url": "https://drive.google.com/uc?id=...",
     "remarks": "Morning check-in"
   }
   ```

3. **Check-Out**:
   ```json
   {
     "action": "checkOut",
     "employee_id": "EMP002"
   }
   ```

4. **Geotag Selfie Upload to Google Drive**:
   ```json
   {
     "action": "geotagUpload",
     "fileBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
     "filename": "selfie.jpg",
     "mimeType": "image/jpeg"
   }
   ```

5. **Upload Work Proof to Google Drive**:
   ```json
   {
     "action": "uploadWorkProof",
     "attendance_id": 1,
     "employee_id": "EMP004",
     "fileBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
     "filename": "poster.jpg",
     "mimeType": "image/jpeg",
     "description": "Field site poster installation"
   }
   ```

6. **Verify Attendance (Admin)**:
   ```json
   {
     "action": "verifyAttendance",
     "attendance_id": 1,
     "status": "Present",
     "admin_notes": "Verified live selfie & location",
     "admin_name": "Sarah Jenkins"
   }
   ```

---

## 3. How to Deploy to Google Apps Script

1. Open [Google Apps Script Dashboard](https://script.google.com/).
2. Create a **New project** named `GeoTrack HRMS Backend`.
3. Copy each file from `google_workspace/` into your Apps Script editor.
4. Set your Spreadsheet ID in `Config.gs`.
5. Click **Deploy** -> **New Deployment** -> Select **Web App**:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
6. Click **Deploy**, authorize permissions, and test your live Web App URL!
