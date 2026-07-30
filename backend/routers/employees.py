from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.database import get_db
from models.employee import Employee
from schemas.employee import EmployeeResponse, EmployeeUpdate

router = APIRouter()


@router.get("/profile", response_model=EmployeeResponse)
def get_profile(current_user: Employee = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=EmployeeResponse)
def update_profile(
    profile_data: EmployeeUpdate,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_data = profile_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee_by_id(
    employee_id: str,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.employee_id != employee_id and current_user.designation.strip().lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this employee",
        )

    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    return employee
