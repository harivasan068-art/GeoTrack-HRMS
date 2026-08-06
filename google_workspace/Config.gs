/**
 * GeoTrack HRMS — Google Workspace Configuration
 * File: Config.gs
 */

var CONFIG = {
  // Spreadsheet ID (Replace with your actual Google Sheet ID)
  SPREADSHEET_ID: "YOUR_GOOGLE_SHEET_ID_HERE",
  
  // Sheet Name Mapping
  SHEETS: {
    EMPLOYEES: "Employees",
    ATTENDANCE: "Attendance",
    WORK_PROOFS: "WorkProofs",
    COMPANY_SETTINGS: "CompanySettings",
    AUDIT_LOGS: "AuditLogs"
  },
  
  // Google Drive Subfolder Names
  DRIVE_FOLDER_NAMES: {
    ROOT: "GeoTrack HRMS",
    EMPLOYEE_PHOTOS: "Employee Photos",
    SELFIES: "Selfies",
    WORK_PROOF_IMAGES: "Work Proof Images",
    WORK_PROOF_VIDEOS: "Work Proof Videos",
    COMPANY_LOGOS: "Company Logos"
  },
  
  // Security & Token Config
  SECURITY: {
    SECRET_KEY: "geotrack-hrms-google-workspace-secret-key",
    TOKEN_EXPIRE_HOURS: 24
  },

  VERSION: "1.0.0"
};
