from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
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
    photo_url = Column(Text, nullable=True)
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

    # --- NEW WORK PROOF & CHECKOUT EXTENSION FIELDS ---
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    working_hours = Column(String(100), nullable=True)
    checkout_latitude = Column(Float, nullable=True)
    checkout_longitude = Column(Float, nullable=True)
    checkout_location_name = Column(String(255), nullable=True)
    checkout_selfie_url = Column(Text, nullable=True)
    checkout_work_photo_url = Column(Text, nullable=True)
    checkout_work_video_url = Column(Text, nullable=True)
    work_photo_url = Column(Text, nullable=True)
    work_video_url = Column(Text, nullable=True)

    employee = relationship("Employee", backref="attendance_records")

    @property
    def selfie_url(self) -> str | None:
        return self.photo_url

