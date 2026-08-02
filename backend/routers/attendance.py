import base64
import math
import os
import uuid
from datetime import date, datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.database import get_db
from models.attendance import Attendance
from models.company import CompanySettings
from models.employee import Employee
from schemas.attendance import AttendanceResponse, CheckInRequest, CheckOutRequest
from services.cloudinary_service import upload_image

router = APIRouter()


def calculate_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters using Haversine formula"""
    R = 6371000  # Radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_geofence_status(db: Session, lat: float, lon: float) -> bool:
    settings = db.query(CompanySettings).first()
    if not settings or not settings.office_latitude or not settings.office_longitude:
        return True

    distance = calculate_distance_meters(
        lat, lon, settings.office_latitude, settings.office_longitude
    )
    return distance <= settings.geofence_radius_meters


@router.post("/geotag-upload", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def submit_geotag_photo(
    request: Request,
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: str = Form("On-Site Customer Location"),
    address: str = Form(None),
    campaign_name: str = Form(None),
    photo: UploadFile = File(...),
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()

    # STEP 1: Does FastAPI receive UploadFile?
    print(f"[STEP 1] Received UploadFile: photo.filename = {photo.filename if photo else None}")

    # STEP 2 & 3: Upload file to Cloudinary & verify secure_url exists
    photo_bytes = await photo.read() if photo else b""
    upload_res = upload_image(photo_bytes, filename=photo.filename if photo else "selfie.jpg", folder="geotrack_hrms/selfies")
    print(f"[STEP 2] Cloudinary upload response: {upload_res}")

    secure_url = upload_res.get("secure_url")
    print(f"[STEP 3] Uploaded secure_url: {secure_url}")

    if not secure_url:
        secure_url = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"

    # Extract metadata
    user_agent = request.headers.get("user-agent", "Unknown Device")
    client_ip = request.client.host if request.client else "0.0.0.0"

    # Geofence check
    is_inside = get_geofence_status(db, latitude, longitude)
    status_label = "Pending Approval" if is_inside else "Pending Approval (Outside Zone)"

    now_local = datetime.now()

    # Every geotag submission creates a NEW site visit check-in record for customer location requests!
    attendance = Attendance(
        employee_id=current_user.employee_id,
        check_in=now_local,
        latitude=latitude,
        longitude=longitude,
        location_name=location_name,
        address=address or location_name,
        campaign_name=campaign_name,
        photo_url=secure_url,
        is_inside_geofence=is_inside,
        browser=user_agent[:150],
        device="Mobile/Web Browser",
        ip_address=client_ip,
        status=status_label,
        date=today,
    )

    # STEP 4: Immediately before db.commit()
    print(f"[STEP 4] Immediately before db.commit(): attendance.photo_url = {attendance.photo_url}")

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    # STEP 5: Immediately after db.commit()
    re_read = db.query(Attendance).filter(Attendance.id == attendance.id).first()
    print(f"[STEP 5] After db.commit() query: re_read.photo_url = {re_read.photo_url if re_read else None}")

    return attendance


@router.post("/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def check_in(
    request: Request,
    check_in_data: CheckInRequest,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    is_inside = get_geofence_status(db, check_in_data.latitude, check_in_data.longitude)
    status_label = "Pending Approval" if is_inside else "Pending Approval (Outside Zone)"

    user_agent = request.headers.get("user-agent", "Unknown Device")
    client_ip = request.client.host if request.client else "0.0.0.0"

    now_local = datetime.now()

    attendance = Attendance(
        employee_id=current_user.employee_id,
        check_in=now_local,
        latitude=check_in_data.latitude,
        longitude=check_in_data.longitude,
        location_name=check_in_data.location_name,
        address=check_in_data.address or check_in_data.location_name,
        campaign_name=check_in_data.campaign_name,
        is_inside_geofence=is_inside,
        browser=user_agent[:150],
        device="Web Client",
        ip_address=client_ip,
        status=status_label,
        date=today,
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    check_out_data: CheckOutRequest,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id,
            Attendance.date == today,
        )
        .order_by(Attendance.check_in.desc())
        .first()
    )

    if not attendance or not attendance.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must check in before checking out",
        )

    attendance.check_out = datetime.now()
    attendance.latitude = check_out_data.latitude
    attendance.longitude = check_out_data.longitude
    attendance.location_name = check_out_data.location_name
    attendance.address = check_out_data.address or check_out_data.location_name

    db.commit()
    db.refresh(attendance)
    return attendance


@router.get("/today", response_model=list[AttendanceResponse])
def get_today_attendance(
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id,
            Attendance.date == date.today(),
        )
        .order_by(Attendance.check_in.desc())
        .all()
    )
    return records


@router.get("/history", response_model=list[AttendanceResponse])
def get_attendance_history(
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
):
    query = db.query(Attendance).filter(Attendance.employee_id == current_user.employee_id)

    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)

    records = query.order_by(Attendance.date.desc()).all()
    return records
