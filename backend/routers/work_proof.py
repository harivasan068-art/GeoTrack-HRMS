import os
from datetime import datetime
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.database import get_db
from models.attendance import Attendance
from models.employee import Employee
from models.work_proof import WorkProof
from schemas.work_proof import WorkProofResponse
from services.cloudinary_service import upload_image, upload_video

router = APIRouter()

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm"}


@router.post("/upload", response_model=WorkProofResponse, status_code=status.HTTP_201_CREATED)
async def upload_work_proof(
    attendance_id: int = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )

    # Access check: Only attendance owner or admin can upload
    is_admin = current_user.designation == "Admin" or getattr(current_user, "role", "") == "admin"
    if attendance.employee_id != current_user.employee_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to upload proof for this attendance record",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file uploaded",
        )

    filename = file.filename or "file"
    ext = os.path.splitext(filename)[1].lower()
    content_type = (file.content_type or "").lower()

    if ext in VIDEO_EXTENSIONS or content_type.startswith("video/"):
        media_type = "video"
        res = upload_video(file_bytes, filename=filename, folder="geotrack_hrms/work_proofs/videos")
    elif ext in IMAGE_EXTENSIONS or content_type.startswith("image/") or not ext:
        media_type = "image"
        res = upload_image(file_bytes, filename=filename, folder="geotrack_hrms/work_proofs/images")
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP, MP4, MOV, WEBM",
        )

    file_url = res.get("secure_url")
    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to obtain secure URL for uploaded media",
        )

    work_proof = WorkProof(
        attendance_id=attendance_id,
        employee_id=current_user.employee_id,
        media_type=media_type,
        file_url=file_url,
        description=description,
        uploaded_at=datetime.utcnow(),
    )

    db.add(work_proof)
    db.commit()
    db.refresh(work_proof)
    return work_proof


@router.get("/{attendance_id}", response_model=list[WorkProofResponse])
def get_work_proofs(
    attendance_id: int,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )

    proofs = (
        db.query(WorkProof)
        .filter(WorkProof.attendance_id == attendance_id)
        .order_by(WorkProof.uploaded_at.asc())
        .all()
    )
    return proofs


@router.delete("/{proof_id}")
def delete_work_proof(
    proof_id: int,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    proof = db.query(WorkProof).filter(WorkProof.id == proof_id).first()
    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work proof record not found",
        )

    is_admin = current_user.designation == "Admin" or getattr(current_user, "role", "") == "admin"
    if proof.employee_id != current_user.employee_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this work proof",
        )

    db.delete(proof)
    db.commit()
    return {"message": "Work proof deleted successfully"}
