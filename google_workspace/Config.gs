/**
 * GeoTrack HRMS — Google Workspace Authentication Config
 * File: Config.gs
 */

var CONFIG = {
  // Google Spreadsheet ID (Replace with your actual Sheet ID)
  SPREADSHEET_ID: "YOUR_GOOGLE_SHEET_ID_HERE",
  
  SHEETS: {
    EMPLOYEES: "Employees"
  },
  
  SECURITY: {
    SECRET_KEY: "geotrack-hrms-secret-key-change-in-production",
    TOKEN_EXPIRE_MINUTES: 1440
  },

  VERSION: "1.0.0"
};
