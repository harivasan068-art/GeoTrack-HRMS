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


from schemas.work_proof import WorkProofResponse


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    check_in: datetime | None
    check_out: datetime | None
    latitude: float | None
    longitude: float | None
    location_name: str | None
    address: str | None
    campaign_name: str | None
    photo_url: str | None
    status: str
    is_inside_geofence: bool
    browser: str | None
    device: str | None
    ip_address: str | None
    admin_notes: str | None
    remarks: str | None
    approved_by: str | None
    approved_at: datetime | None
    verified_at: datetime | None
    date: date
    work_proofs: list[WorkProofResponse] = []

    model_config = {"from_attributes": True}


class GeotagAttendanceSheetItem(BaseModel):
    id: int
    employee_id: str
    full_name: str
    department: str
    designation: str
    employee_photo: str | None = None
    check_in: datetime | None
    check_out: datetime | None
    latitude: float | None
    longitude: float | None
    location_name: str | None
    address: str | None
    campaign_name: str | None
    photo_url: str | None
    status: str
    is_inside_geofence: bool
    browser: str | None
    device: str | None
    ip_address: str | None
    admin_notes: str | None
    remarks: str | None
    approved_by: str | None
    approved_at: datetime | None
    date: date
    work_proofs: list[WorkProofResponse] = []


class AttendanceReportItem(BaseModel):
    employee_id: str
    full_name: str
    department: str
    total_days: int
    present_days: int
    absent_days: int
    late_arrivals: int = 0
