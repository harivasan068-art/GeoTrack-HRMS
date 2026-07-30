from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(50), ForeignKey("employees.employee_id"), nullable=False, index=True)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    address = Column(String(500), nullable=True)
    campaign_name = Column(String(255), nullable=True)
    photo_url = Column(String(500), nullable=True)
    status = Column(String(50), default="Pending Approval", nullable=False, index=True)
    is_inside_geofence = Column(Boolean, default=True, nullable=False)
    browser = Column(String(150), nullable=True)
    device = Column(String(150), nullable=True)
    ip_address = Column(String(50), nullable=True)
    admin_notes = Column(String(500), nullable=True)
    remarks = Column(String(500), nullable=True)
    approved_by = Column(String(150), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    date = Column(Date, default=date.today, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employee = relationship("Employee", backref="attendance_records")
