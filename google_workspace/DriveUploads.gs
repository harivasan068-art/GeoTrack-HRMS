/**
 * GeoTrack HRMS — Google Drive File Upload Module
 * File: DriveUploads.gs
 * 
 * Handles uploading:
 * 1. Employee Photo  -> 'Employee Photos' folder
 * 2. Selfie          -> 'Selfies' folder
 * 3. Work Proof Image-> 'Work Proof Images' folder
 * 4. Work Proof Video-> 'Work Proof Videos' folder
 * 5. Company Logo    -> 'Company Logos' folder
 * 
 * Stores ONLY file URLs inside Google Sheets.
 * Returns file URLs matching Cloudinary response schema ({ secure_url, public_id, url }).
 */

/**
 * Generic Drive Upload Helper
 * Converts Base64 file string into Google Drive file, places in subfolder, sets view permission.
 */
function uploadFileToDriveFolder(folderName, fileBase64, filename, mimeType) {
  if (!fileBase64) {
    throw new Error("fileBase64 parameter is required");
  }
  
  var rootFolder = getOrCreateFolder(CONFIG.DRIVE_FOLDER_NAMES.ROOT);
  var targetFolder = getOrCreateFolder(folderName, rootFolder);
  
  var name = filename || ("file_" + new Date().getTime());
  var type = mimeType || "image/jpeg";
  
  // Clean base64 data header if present (e.g. data:image/jpeg;base64,...)
  var cleanBase64 = fileBase64;
  if (fileBase64.indexOf("base64,") !== -1) {
    cleanBase64 = fileBase64.split("base64,")[1];
  }
  
  var decoded = Utilities.base64Decode(cleanBase64);
  var blob = Utilities.newBlob(decoded, type, name);
  var file = targetFolder.createFile(blob);
  
  // Set link view permissions
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    Logger.log("Sharing notice: " + e.toString());
  }
  
  var fileId = file.getId();
  // Generate direct view URL compatible with web browsers and React img tags
  var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
  var webViewLink = file.getUrl();
  
  return {
    secure_url: directUrl,
    url: directUrl,
    photo_url: directUrl,
    file_url: directUrl,
    web_view_link: webViewLink,
    public_id: fileId
  };
}

/**
 * 1. Upload Employee Photo -> 'Employee Photos' folder
 */
function uploadEmployeePhoto(employeeId, fileBase64, filename, mimeType) {
  var name = filename || ("employee_" + (employeeId || "avatar") + "_" + new Date().getTime() + ".jpg");
  var uploadResult = uploadFileToDriveFolder(
    CONFIG.DRIVE_FOLDER_NAMES.EMPLOYEE_PHOTOS,
    fileBase64,
    name,
    mimeType || "image/jpeg"
  );
  
  // If employeeId supplied, update Employee photo URL in Employees sheet
  if (employeeId) {
    updateObjectInSheet(CONFIG.SHEETS.EMPLOYEES, "employee_id", employeeId, { photo: uploadResult.secure_url });
  }
  
  return {
    response: uploadResult,
    statusCode: 200
  };
}

/**
 * 2. Upload Selfie -> 'Selfies' folder
 */
function uploadSelfie(employeeId, fileBase64, filename, mimeType) {
  var name = filename || ("selfie_" + (employeeId || "user") + "_" + new Date().getTime() + ".jpg");
  var uploadResult = uploadFileToDriveFolder(
    CONFIG.DRIVE_FOLDER_NAMES.SELFIES,
    fileBase64,
    name,
    mimeType || "image/jpeg"
  );
  
  return {
    response: uploadResult,
    statusCode: 200
  };
}

/**
 * 3. Upload Work Proof Image -> 'Work Proof Images' folder
 */
function uploadWorkProofImage(attendanceId, employeeId, fileBase64, filename, mimeType, description) {
  var name = filename || ("proof_img_" + (attendanceId || "att") + "_" + new Date().getTime() + ".jpg");
  var uploadResult = uploadFileToDriveFolder(
    CONFIG.DRIVE_FOLDER_NAMES.WORK_PROOF_IMAGES,
    fileBase64,
    name,
    mimeType || "image/jpeg"
  );
  
  // Record proof in WorkProofs sheet if attendanceId supplied
  if (attendanceId) {
    var proofs = sheetToObjects(CONFIG.SHEETS.WORK_PROOFS);
    var newId = proofs.length + 1;
    var nowISO = new Date().toISOString();
    
    var newProofObj = {
      id: newId,
      attendance_id: parseInt(attendanceId, 10),
      employee_id: employeeId || "",
      media_type: "image",
      file_url: uploadResult.secure_url,
      description: description || "",
      uploaded_at: nowISO
    };
    appendObjectToSheet(CONFIG.SHEETS.WORK_PROOFS, newProofObj);
  }
  
  return {
    response: uploadResult,
    statusCode: 200
  };
}

/**
 * 4. Upload Work Proof Video -> 'Work Proof Videos' folder
 */
function uploadWorkProofVideo(attendanceId, employeeId, fileBase64, filename, mimeType, description) {
  var name = filename || ("proof_vid_" + (attendanceId || "att") + "_" + new Date().getTime() + ".mp4");
  var uploadResult = uploadFileToDriveFolder(
    CONFIG.DRIVE_FOLDER_NAMES.WORK_PROOF_VIDEOS,
    fileBase64,
    name,
    mimeType || "video/mp4"
  );
  
  // Record proof in WorkProofs sheet if attendanceId supplied
  if (attendanceId) {
    var proofs = sheetToObjects(CONFIG.SHEETS.WORK_PROOFS);
    var newId = proofs.length + 1;
    var nowISO = new Date().toISOString();
    
    var newProofObj = {
      id: newId,
      attendance_id: parseInt(attendanceId, 10),
      employee_id: employeeId || "",
      media_type: "video",
      file_url: uploadResult.secure_url,
      description: description || "",
      uploaded_at: nowISO
    };
    appendObjectToSheet(CONFIG.SHEETS.WORK_PROOFS, newProofObj);
  }
  
  return {
    response: uploadResult,
    statusCode: 200
  };
}

/**
 * 5. Upload Company Logo -> 'Company Logos' folder
 */
function uploadCompanyLogo(fileBase64, filename, mimeType) {
  var name = filename || ("company_logo_" + new Date().getTime() + ".png");
  var uploadResult = uploadFileToDriveFolder(
    CONFIG.DRIVE_FOLDER_NAMES.COMPANY_LOGOS,
    fileBase64,
    name,
    mimeType || "image/png"
  );
  
  // Update CompanySettings sheet logo URL
  updateObjectInSheet(CONFIG.SHEETS.COMPANY_SETTINGS, "id", 1, { company_logo: uploadResult.secure_url });
  
  return {
    response: uploadResult,
    statusCode: 200
  };
}
