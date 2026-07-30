from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Integer, String

from database.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    department = Column(String(100), nullable=False)
    designation = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    photo = Column(String(500), nullable=True)
    joining_date = Column(Date, default=date.today, nullable=False)
    status = Column(String(20), default="Active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
