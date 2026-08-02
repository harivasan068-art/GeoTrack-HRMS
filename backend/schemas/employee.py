from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


class EmployeeBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=20)
    department: str = Field(..., min_length=2, max_length=100)
    designation: str = Field(..., min_length=2, max_length=100)
    joining_date: date | None = None
    status: str = "Active"
    photo: str | None = None


class EmployeeCreate(EmployeeBase):
    password: str = Field(..., min_length=6, max_length=128)


class EmployeeUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=150)
    email: EmailStr | None = None
    phone: str | None = Field(None, min_length=5, max_length=20)
    department: str | None = Field(None, min_length=2, max_length=100)
    designation: str | None = Field(None, min_length=2, max_length=100)
    status: str | None = None
    photo: str | None = None


class EmployeeProfileUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    department: str | None = None
    designation: str | None = None
    password: str | None = None
    photo: str | None = None


class EmployeeResponse(EmployeeBase):
    id: int
    employee_id: str
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
