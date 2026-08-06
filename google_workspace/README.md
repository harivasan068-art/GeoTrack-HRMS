# GeoTrack HRMS — Google Workspace Backend Foundation

This document defines the complete **Google Workspace** backend design (Google Sheets, Google Drive, and Google Apps Script foundation) for GeoTrack HRMS without modifying any existing FastAPI, React, or UI components.

---

## 1. Google Sheets Structure

Create a single Google Spreadsheet titled **`GeoTrack HRMS Database`** with **5 distinct tabs (sheets)**.

---

### Sheet 1: `Employees`
Stores employee profile information, credentials (hashed), designation, status, and photo links.

| Column | Header | Data Type | Validation / Constraints | Sample Record |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `id` | Integer | Unique primary key (Auto Increment) | `1` |
| **B** | `employee_id` | String | Unique string pattern (`EMP001`, `EMP002`) | `EMP001` |
| **C** | `full_name` | String | Non-empty text | `Sarah Jenkins` |
| **D** | `email` | String | Valid Email Address (`*@*.*`) | `admin@geotrack.com` |
| **E** | `phone` | String | Phone Number | `+1-555-0100` |
| **F** | `department` | String | Dropdown: `Executive Management`, `Software Engineering`, `Product Management`, `Field Operations` | `Executive Management` |
| **G** | `designation` | String | Non-empty text | `Admin` |
| **H** | `password` | String | Hashed Password String | `$2b$12$eImiTXuWVxjM7...` |
| **I** | `photo` | String | Valid Drive URL or Image Link | `https://drive.google.com/uc?id=...` |
| **J** | `joining_date` | Date | Date format `YYYY-MM-DD` | `2022-01-15` |
| **K** | `status` | String | Dropdown: `Active`, `Inactive`, `On Leave` | `Active` |
| **L** | `created_at` | DateTime | ISO 8601 Timestamp (`YYYY-MM-DDTHH:mm:ssZ`) | `2022-01-15T09:00:00Z` |
| **M** | `updated_at` | DateTime | ISO 8601 Timestamp (`YYYY-MM-DDTHH:mm:ssZ`) | `2022-01-15T09:00:00Z` |

---

### Sheet 2: `Attendance`
Tracks daily check-ins, check-outs, GPS location coordinates, geofence validation, selfie photos, and status approvals.

| Column | Header | Data Type | Validation / Constraints | Sample Record |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `id` | Integer | Unique primary key (Auto Increment) | `1` |
| **B** | `employee_id` | String | Foreign key referencing `Employees.employee_id` | `EMP002` |
| **C** | `check_in` | DateTime | ISO 8601 Timestamp | `2026-08-06T09:05:00Z` |
| **D** | `check_out` | DateTime | ISO 8601 Timestamp (Nullable) | `2026-08-06T17:45:00Z` |
| **E** | `latitude` | Float | Geolocation latitude decimal (-90.0 to 90.0) | `37.7749` |
| **F** | `longitude` | Float | Geolocation longitude decimal (-180.0 to 180.0) | `-122.4194` |
| **G** | `location_name` | String | Location name string | `San Francisco Tech Park HQ` |
| **H** | `address` | String | Street address string | `100 Tech Park Way, Suite 400` |
| **I** | `campaign_name` | String | Campaign identifier | `On-Site Headquarters` |
| **J** | `photo_url` | String | Google Drive Selfie URL | `https://drive.google.com/uc?id=...` |
| **K** | `status` | String | Dropdown: `Present`, `Pending Approval`, `Pending Approval (Outside Zone)`, `Rejected` | `Pending Approval` |
| **L** | `is_inside_geofence` | Boolean | Boolean (`TRUE` / `FALSE`) | `TRUE` |
| **M** | `browser` | String | Browser User-Agent summary | `Chrome 125.0 / macOS` |
| **N** | `device` | String | Device type summary | `MacBook Pro` |
| **O** | `ip_address` | String | IP Address string | `192.168.1.45` |
| **P** | `admin_notes` | String | Admin verification remarks | `Verified live selfie location` |
| **Q** | `remarks` | String | Employee check-in remarks | `Regular check-in` |
| **R** | `approved_by` | String | Admin name | `Sarah Jenkins` |
| **S** | `approved_at` | DateTime | ISO 8601 Timestamp (Nullable) | `2026-08-06T09:30:00Z` |
| **T** | `verified_at` | DateTime | ISO 8601 Timestamp (Nullable) | `2026-08-06T09:30:00Z` |
| **U** | `date` | Date | Date format `YYYY-MM-DD` | `2026-08-06` |
| **V** | `created_at` | DateTime | ISO 8601 Timestamp | `2026-08-06T09:05:00Z` |

---

### Sheet 3: `WorkProofs`
Stores field work proof media (images/videos) associated with attendance records.

| Column | Header | Data Type | Validation / Constraints | Sample Record |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `id` | Integer | Unique primary key (Auto Increment) | `1` |
| **B** | `attendance_id` | Integer | Foreign key referencing `Attendance.id` | `1` |
| **C** | `employee_id` | String | Foreign key referencing `Employees.employee_id` | `EMP004` |
| **D** | `media_type` | String | Dropdown: `image`, `video` | `image` |
| **E** | `file_url` | String | Google Drive File URL | `https://drive.google.com/uc?id=...` |
| **F** | `description` | String | Text notes / description | `Completed site poster installation` |
| **G** | `uploaded_at` | DateTime | ISO 8601 Timestamp | `2026-08-06T10:15:00Z` |

---

### Sheet 4: `CompanySettings`
Stores enterprise branding, geofence coordinates, and company info.

| Column | Header | Data Type | Validation / Constraints | Sample Record |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `id` | Integer | Primary Key (Single record, ID `1`) | `1` |
| **B** | `company_name` | String | Non-empty text | `GeoTrack Enterprise HRMS` |
| **C** | `company_logo` | String | Drive Logo URL | `https://drive.google.com/uc?id=...` |
| **D** | `theme_color` | String | Hex Color Code (`#4f46e5`) | `#4f46e5` |
| **E** | `phone` | String | Phone Number | `+1-800-555-0199` |
| **F** | `email` | String | Valid Email Address | `hr@geotrackhrms.com` |
| **G** | `address` | String | Company Address | `100 Tech Park Way, Suite 400` |
| **H** | `website` | String | Website URL | `https://geotrackhrms.com` |
| **I** | `office_latitude` | Float | Office Latitude decimal | `37.7749` |
| **J** | `office_longitude` | Float | Office Longitude decimal | `-122.4194` |
| **K** | `geofence_radius_meters` | Float | Radius in meters (e.g., `200.0`) | `200.0` |
| **L** | `created_at` | DateTime | ISO 8601 Timestamp | `2026-01-01T00:00:00Z` |
| **M** | `updated_at` | DateTime | ISO 8601 Timestamp | `2026-08-06T00:00:00Z` |

---

### Sheet 5: `AuditLogs`
Stores administrative actions, system events, and audit logs.

| Column | Header | Data Type | Validation / Constraints | Sample Record |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `id` | Integer | Unique primary key (Auto Increment) | `1` |
| **B** | `action` | String | Non-empty text action description | `Geofence Radius Configuration` |
| **C** | `employee_id` | String | Optional employee reference | `EMP001` |
| **D** | `admin_name` | String | Admin who performed the action | `Sarah Jenkins` |
| **E** | `remarks` | String | Audit log notes | `Configured office geofence center with 200m radius` |
| **F** | `created_at` | DateTime | ISO 8601 Timestamp | `2026-08-06T08:00:00Z` |

---

## 2. Google Drive Structure

Create a master folder in Google Drive named **`GeoTrack HRMS`** with 5 subfolders:

```
GeoTrack HRMS/
 ├── Employee Photos/       (Stores profile avatar photos)
 ├── Selfies/               (Stores attendance verification selfie photos)
 ├── Work Proof Images/     (Stores field work proof photos)
 ├── Work Proof Videos/     (Stores field work proof videos)
 └── Company Logos/         (Stores company branding logos)
```

---

## 3. Google Apps Script Project Structure

The Google Apps Script project files are located in the [google_workspace/](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/) folder:

1. [Config.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Config.gs) — Centralized configuration, Sheet IDs, Drive Folder IDs, and secret tokens.
2. [Utilities.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Utilities.gs) — Response formatters (`jsonResponse`), sheet getters, timestamp generators, ID generators.
3. [Auth.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Auth.gs) — Authentication function skeletons (`handleLogin`, `verifyToken`, `registerUser`).
4. [Employee.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Employee.gs) — Employee CRUD function skeletons.
5. [Attendance.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Attendance.gs) — Check-in, check-out, geotag, and verification skeletons.
6. [Company.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Company.gs) — Company settings & audit logging skeletons.
7. [WorkProof.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/WorkProof.gs) — Work proof upload & deletion skeletons.
8. [Code.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Code.gs) — Entry point with `doGet(e)` and `doPost(e)` HTTP handlers.
9. [appsscript.json](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/appsscript.json) — Manifest configuration and OAuth2 scope definitions.

---

## 4. Required OAuth2 Permissions & Scopes

The Apps Script project uses the following Google Workspace authorization scopes (configured in `appsscript.json`):

- `https://www.googleapis.com/auth/spreadsheets` — Read & write access to Google Sheets database.
- `https://www.googleapis.com/auth/drive` — Full access to create folders and save files in Google Drive.
- `https://www.googleapis.com/auth/drive.file` — Access to files created or opened by the Apps Script application.
- `https://www.googleapis.com/auth/script.external_request` — Allows connecting to external API services if needed.

---

## 5. Apps Script Web App Deployment Process

1. Open [Google Apps Script Dashboard](https://script.google.com/).
2. Click **New Project** and name it **`GeoTrack HRMS Backend`**.
3. Copy the content from each file in [google_workspace/](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/) into your Apps Script project files.
4. Replace `YOUR_GOOGLE_SHEET_ID_HERE` and `YOUR_*_FOLDER_ID_HERE` in [Config.gs](file:///c:/Users/Harivasan/OneDrive/Desktop/attendence_management/google_workspace/Config.gs) with your actual Spreadsheet ID and Drive Folder IDs.
5. Click **Deploy** -> **New Deployment**.
6. Select **Web app**:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
7. Click **Deploy** and authorize the required permissions.
8. Copy the generated **Web App URL** (e.g. `https://script.google.com/macros/s/.../exec`).
