from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class CheckInRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: str | None = None
    address: str | None = None
    campaign_name: str | None = None
    browser: str | None = None
    device: str | None = None


class CheckOutRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: str | None = None
    address: str | None = None


class AttendanceCreate(BaseModel):
    employee_id: str
    latitude: float | None = None
    longitude: float | None = None
    location_name: str | None = None
    address: str | None = None
    campaign_name: str | None = None
    photo_url: str | None = None
    browser: str | None = None
    device: str | None = None


class AttendanceUpdate(BaseModel):
    check_out: datetime | None = None
    latitude: float | None = None
    longitude: float | None = None
    location_name: str | None = None
    address: str | None = None
    status: str | None = None
    admin_notes: str | None = None
    remarks: str | None = None


class AdminVerificationRequest(BaseModel):
    status: Literal["Present", "Absent", "Pending Approval"]
    admin_notes: str | None = None
    remarks: str | None = None


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    check_in: datetime | None = None
    check_out: datetime | None = None
    latitude: float | None = None
    longitude: float | None = None
    location_name: str | None = None
    address: str | None = None
    campaign_name: str | None = None
    photo_url: str | None = None
    status: str
    is_inside_geofence: bool
    browser: str | None = None
    device: str | None = None
    ip_address: str | None = None
    admin_notes: str | None = None
    remarks: str | None = None
    approved_by: str | None = None
    approved_at: datetime | None = None
    verified_at: datetime | None = None
    date: date

    # --- NEW WORK PROOF & CHECKOUT EXTENSION FIELDS ---
    check_in_time: datetime | None = None
    check_out_time: datetime | None = None
    working_hours: str | None = None
    checkout_latitude: float | None = None
    checkout_longitude: float | None = None
    checkout_location_name: str | None = None
    checkout_selfie_url: str | None = None
    checkout_work_photo_url: str | None = None
    checkout_work_video_url: str | None = None
    work_photo_url: str | None = None
    work_video_url: str | None = None

    model_config = {"from_attributes": True}


class GeotagAttendanceSheetItem(BaseModel):
    id: int
    employee_id: str
    full_name: str
    department: str
    designation: str
    employee_photo: str | None = None
    check_in: datetime | None = None
    check_out: datetime | None = None
    latitude: float | None = None
    longitude: float | None = None
    location_name: str | None = None
    address: str | None = None
    campaign_name: str | None = None
    photo_url: str | None = None
    status: str
    is_inside_geofence: bool
    browser: str | None = None
    device: str | None = None
    ip_address: str | None = None
    admin_notes: str | None = None
    remarks: str | None = None
    approved_by: str | None = None
    approved_at: datetime | None = None
    date: date

    # --- NEW WORK PROOF & CHECKOUT EXTENSION FIELDS ---
    check_in_time: datetime | None = None
    check_out_time: datetime | None = None
    working_hours: str | None = None
    checkout_latitude: float | None = None
    checkout_longitude: float | None = None
    checkout_location_name: str | None = None
    checkout_selfie_url: str | None = None
    checkout_work_photo_url: str | None = None
    checkout_work_video_url: str | None = None
    work_photo_url: str | None = None
    work_video_url: str | None = None


class AttendanceReportItem(BaseModel):
    employee_id: str
    full_name: str
    department: str
    total_days: int
    present_days: int
    absent_days: int
    late_arrivals: int = 0
