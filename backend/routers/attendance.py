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
from services.cloudinary_service import process_media_upload, upload_image, upload_video

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


def calculate_working_hours_string(start_dt: datetime | None, end_dt: datetime | None) -> str:
    if not start_dt or not end_dt:
        return "N/A"
    diff = end_dt - start_dt
    total_seconds = max(int(diff.total_seconds()), 0)
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    return f"{hours} Hours {minutes} Minutes"


@router.post("/geotag-upload", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def submit_geotag_photo(
    request: Request,
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: str = Form("On-Site Location"),
    address: str = Form(None),
    campaign_name: str = Form(None),
    photo: UploadFile = File(None),
    selfie: UploadFile = File(None),
    work_photo: UploadFile = File(None),
    work_video: UploadFile = File(None),
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()

    selfie_file = photo or selfie

    # 1. Selfie Upload
    selfie_url = await process_media_upload(selfie_file, folder="geotrack_hrms/selfies", resource_type="image")

    # 2. Work Photo Upload (Optional)
    work_photo_url = await process_media_upload(work_photo, folder="geotrack_hrms/work_photos", resource_type="image")

    # 3. Work Video Upload (Optional)
    work_video_url = await process_media_upload(work_video, folder="geotrack_hrms/work_videos", resource_type="video")

    user_agent = request.headers.get("user-agent", "Unknown Device")
    client_ip = request.client.host if request.client else "0.0.0.0"
    is_inside = get_geofence_status(db, latitude, longitude)
    status_label = "Pending Approval" if is_inside else "Pending Approval (Outside Zone)"
    now_local = datetime.now()

    existing_record = (
        db.query(Attendance)
        .filter(Attendance.employee_id == current_user.employee_id, Attendance.date == today)
        .order_by(Attendance.check_in.desc())
        .first()
    )

    if existing_record:
        if selfie_url:
            existing_record.selfie_url = selfie_url
            existing_record.photo_url = selfie_url
        if work_photo_url:
            existing_record.work_photo_url = work_photo_url
        if work_video_url:
            existing_record.work_video_url = work_video_url
        existing_record.latitude = latitude
        existing_record.longitude = longitude
        existing_record.location_name = location_name
        existing_record.address = address or location_name
        if campaign_name:
            existing_record.campaign_name = campaign_name
        existing_record.is_inside_geofence = is_inside
        existing_record.status = status_label

        print(f"[DEBUG STEP 2] Assigned to existing Attendance Model (ID: {existing_record.id}):")
        print(f"  attendance.selfie_url  = {existing_record.selfie_url}")
        print(f"  attendance.photo_url   = {existing_record.photo_url}")
        print(f"  attendance.work_photo_url        = {existing_record.work_photo_url}")
        print(f"  attendance.work_video_url        = {existing_record.work_video_url}")

        db.commit()
        db.refresh(existing_record)

        # Read SAME record back from database to verify persistence
        re_read = db.query(Attendance).filter(Attendance.id == existing_record.id).first()
        print(f"[DEBUG STEP 3] Re-read Record (ID: {re_read.id}) from DB after db.commit():")
        print(f"  re_read.selfie_url     = {re_read.selfie_url}")
        print(f"  re_read.photo_url      = {re_read.photo_url}")
        print(f"  re_read.work_photo_url = {re_read.work_photo_url}")
        print(f"  re_read.work_video_url = {re_read.work_video_url}")

        return existing_record

    attendance = Attendance(
        employee_id=current_user.employee_id,
        check_in=now_local,
        check_in_time=now_local,
        latitude=latitude,
        longitude=longitude,
        location_name=location_name,
        address=address or location_name,
        campaign_name=campaign_name,
        selfie_url=selfie_url,
        photo_url=selfie_url,
        work_photo_url=work_photo_url,
        work_video_url=work_video_url,
        is_inside_geofence=is_inside,
        browser=user_agent[:150],
        device="Mobile/Web Client",
        ip_address=client_ip,
        status=status_label,
        date=today,
    )

    print(f"[DEBUG STEP 2] Assigned to new Attendance Model:")
    print(f"  attendance.selfie_url  = {attendance.selfie_url}")
    print(f"  attendance.photo_url   = {attendance.photo_url}")
    print(f"  attendance.work_photo_url        = {attendance.work_photo_url}")
    print(f"  attendance.work_video_url        = {attendance.work_video_url}")

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    # Read SAME record back from database to verify persistence
    re_read = db.query(Attendance).filter(Attendance.id == attendance.id).first()
    print(f"[DEBUG STEP 3] Re-read Record (ID: {re_read.id}) from DB after db.commit():")
    print(f"  re_read.selfie_url     = {re_read.selfie_url}")
    print(f"  re_read.photo_url      = {re_read.photo_url}")
    print(f"  re_read.work_photo_url = {re_read.work_photo_url}")
    print(f"  re_read.work_video_url = {re_read.work_video_url}")

    return attendance



@router.post("/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def check_in(
    request: Request,
    check_in_data: CheckInRequest,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    existing = (
        db.query(Attendance)
        .filter(Attendance.employee_id == current_user.employee_id, Attendance.date == today)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already checked in for today. Multiple check-ins per day are not permitted.",
        )

    is_inside = get_geofence_status(db, check_in_data.latitude, check_in_data.longitude)
    status_label = "Pending Approval" if is_inside else "Pending Approval (Outside Zone)"
    user_agent = request.headers.get("user-agent", "Unknown Device")
    client_ip = request.client.host if request.client else "0.0.0.0"
    now_local = datetime.now()

    attendance = Attendance(
        employee_id=current_user.employee_id,
        check_in=now_local,
        check_in_time=now_local,
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


@router.post("/check-out-full", response_model=AttendanceResponse)
async def check_out_full(
    request: Request,
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: str = Form("Check-Out Location"),
    checkout_selfie: UploadFile = File(None),
    checkout_work_photo: UploadFile = File(None),
    checkout_work_video: UploadFile = File(None),
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    today_records = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id,
            Attendance.date == today,
        )
        .order_by(Attendance.check_in.asc())
        .all()
    )

    if not today_records:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot Check Out without Check In.",
        )

    first_record = today_records[0]
    attendance = today_records[-1]

    if attendance.check_out or attendance.check_out_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already checked out for today.",
        )

    now_local = datetime.now()
    attendance.check_out = now_local
    attendance.check_out_time = now_local
    attendance.checkout_latitude = latitude
    attendance.checkout_longitude = longitude
    attendance.checkout_location_name = location_name

    # Optional Checkout Selfie
    if checkout_selfie:
        attendance.checkout_selfie_url = await process_media_upload(checkout_selfie, folder="geotrack_hrms/checkout_selfies", resource_type="image")

    # Optional Checkout Work Photo
    if checkout_work_photo:
        attendance.checkout_work_photo_url = await process_media_upload(checkout_work_photo, folder="geotrack_hrms/checkout_photos", resource_type="image")

    # Optional Checkout Work Video
    if checkout_work_video:
        attendance.checkout_work_video_url = await process_media_upload(checkout_work_video, folder="geotrack_hrms/checkout_videos", resource_type="video")

    # Automatic Working Hours calculation from earliest check-in
    start_dt = first_record.check_in_time or first_record.check_in
    working_hours_str = calculate_working_hours_string(start_dt, now_local)
    for rec in today_records:
        rec.working_hours = working_hours_str
        rec.check_out = now_local
        rec.check_out_time = now_local

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
    today_records = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id,
            Attendance.date == today,
        )
        .order_by(Attendance.check_in.asc())
        .all()
    )

    if not today_records:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot Check Out without Check In.",
        )

    first_record = today_records[0]
    attendance = today_records[-1]

    now_local = datetime.now()
    attendance.check_out = now_local
    attendance.check_out_time = now_local
    attendance.checkout_latitude = check_out_data.latitude
    attendance.checkout_longitude = check_out_data.longitude
    attendance.checkout_location_name = check_out_data.location_name
    attendance.address = check_out_data.address or check_out_data.location_name

    start_dt = first_record.check_in_time or first_record.check_in
    working_hours_str = calculate_working_hours_string(start_dt, now_local)
    for rec in today_records:
        rec.working_hours = working_hours_str
        rec.check_out = now_local
        rec.check_out_time = now_local

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
