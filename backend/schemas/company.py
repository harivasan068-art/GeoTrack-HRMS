from datetime import datetime

from pydantic import BaseModel, Field


class CompanySettingsBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=150)
    company_logo: str | None = None
    theme_color: str = "#4f46e5"
    phone: str = "+1-800-555-0199"
    email: str = "contact@geotrackhrms.com"
    address: str = "100 Tech Park Way, Suite 400, San Francisco, CA"
    website: str = "https://geotrackhrms.com"
    office_latitude: float = 37.7749
    office_longitude: float = -122.4194
    geofence_radius_meters: float = 100.0


class CompanySettingsUpdate(BaseModel):
    company_name: str | None = None
    company_logo: str | None = None
    theme_color: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    website: str | None = None
    office_latitude: float | None = None
    office_longitude: float | None = None
    geofence_radius_meters: float | None = None


class CompanySettingsResponse(CompanySettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AuditLogCreate(BaseModel):
    action: str
    employee_id: str | None = None
    admin_name: str
    remarks: str | None = None


class AuditLogResponse(BaseModel):
    id: int
    action: str
    employee_id: str | None
    admin_name: str
    remarks: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
