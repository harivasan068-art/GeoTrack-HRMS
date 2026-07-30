from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from database.database import Base


class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(150), nullable=False, default="GeoTrack HRMS")
    company_logo = Column(String(500), nullable=True)
    theme_color = Column(String(50), nullable=False, default="#4f46e5")
    phone = Column(String(50), nullable=False, default="+1-800-555-0199")
    email = Column(String(150), nullable=False, default="contact@geotrackhrms.com")
    address = Column(String(255), nullable=False, default="100 Tech Park Way, Suite 400, San Francisco, CA")
    website = Column(String(150), nullable=False, default="https://geotrackhrms.com")
    office_latitude = Column(Float, nullable=False, default=37.7749)
    office_longitude = Column(Float, nullable=False, default=-122.4194)
    geofence_radius_meters = Column(Float, nullable=False, default=100.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    action = Column(String(150), nullable=False)
    employee_id = Column(String(50), nullable=True, index=True)
    admin_name = Column(String(150), nullable=False)
    remarks = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
