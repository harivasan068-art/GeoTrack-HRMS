/**
 * GeoTrack HRMS — Google Workspace Configuration
 * File: Config.gs
 * 
 * Global constants, Sheet IDs, Drive Folder IDs, and Configuration.
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
  
  // Google Drive Root & Subfolder IDs (Replace with your actual Folder IDs)
  DRIVE_FOLDERS: {
    ROOT: "YOUR_ROOT_FOLDER_ID_HERE",
    EMPLOYEE_PHOTOS: "YOUR_EMPLOYEE_PHOTOS_FOLDER_ID_HERE",
    SELFIES: "YOUR_SELFIES_FOLDER_ID_HERE",
    WORK_PROOF_IMAGES: "YOUR_WORK_PROOF_IMAGES_FOLDER_ID_HERE",
    WORK_PROOF_VIDEOS: "YOUR_WORK_PROOF_VIDEOS_FOLDER_ID_HERE",
    COMPANY_LOGOS: "YOUR_COMPANY_LOGOS_FOLDER_ID_HERE"
  },
  
  // JWT & Security Config
  SECURITY: {
    JWT_SECRET: "geotrack-hrms-google-workspace-secret-key",
    TOKEN_EXPIRATION_HOURS: 24
  },

  // API Version
  VERSION: "1.0.0"
};
