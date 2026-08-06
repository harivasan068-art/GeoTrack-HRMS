/**
 * GeoTrack HRMS — Work Proof Module
 * File: WorkProof.gs
 */

function uploadWorkProof(attendanceId, employeeId, fileBase64, filename, mimeType, description) {
  var rootFolder = getOrCreateFolder(CONFIG.DRIVE_FOLDER_NAMES.ROOT);
  var isVideo = mimeType && mimeType.indexOf("video") !== -1;
  
  var targetFolderName = isVideo ? 
    CONFIG.DRIVE_FOLDER_NAMES.WORK_PROOF_VIDEOS : 
    CONFIG.DRIVE_FOLDER_NAMES.WORK_PROOF_IMAGES;
    
  var targetFolder = getOrCreateFolder(targetFolderName, rootFolder);
  
  var name = filename || ("proof_" + new Date().getTime() + (isVideo ? ".mp4" : ".jpg"));
  var type = mimeType || (isVideo ? "video/mp4" : "image/jpeg");
  
  var decoded = Utilities.base64Decode(fileBase64);
  var blob = Utilities.newBlob(decoded, type, name);
  var file = targetFolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var proofs = sheetToObjects(CONFIG.SHEETS.WORK_PROOFS);
  var newId = proofs.length + 1;
  var nowISO = new Date().toISOString();
  
  var newProof = {
    id: newId,
    attendance_id: parseInt(attendanceId, 10),
    employee_id: employeeId,
    media_type: isVideo ? "video" : "image",
    file_url: file.getUrl(),
    description: description || "",
    uploaded_at: nowISO
  };
  
  appendObjectToSheet(CONFIG.SHEETS.WORK_PROOFS, newProof);
  return newProof;
}

function getWorkProofs(attendanceId) {
  var proofs = sheetToObjects(CONFIG.SHEETS.WORK_PROOFS);
  if (!attendanceId) return proofs;
  
  return proofs.filter(function(p) {
    return String(p.attendance_id) === String(attendanceId);
  });
}

function deleteWorkProof(proofId) {
  var success = deleteObjectFromSheet(CONFIG.SHEETS.WORK_PROOFS, "id", proofId);
  return { success: success };
}
