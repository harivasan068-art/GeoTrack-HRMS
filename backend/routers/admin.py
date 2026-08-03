from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin
from database.database import get_db
from models.attendance import Attendance
from models.company import AuditLog, CompanySettings
from models.employee import Employee
from schemas.attendance import (
    AdminVerificationRequest,
    AttendanceReportItem,
    AttendanceResponse,
    GeotagAttendanceSheetItem,
)
from schemas.company import AuditLogResponse, CompanySettingsResponse, CompanySettingsUpdate
from schemas.employee import EmployeeCreate, EmployeeResponse, EmployeeUpdate
from utils.security import generate_employee_id, hash_password

router = APIRouter()


def log_audit(db: Session, action: str, admin_name: str, employee_id: str | None = None, remarks: str | None = None):
    log = AuditLog(
        action=action,
        employee_id=employee_id,
        admin_name=admin_name,
        remarks=remarks,
    )
    db.add(log)
    db.commit()


# --- COMPANY SETTINGS ---
@router.get("/company", response_model=CompanySettingsResponse)
def get_company_settings(db: Session = Depends(get_db)):
    settings = db.query(CompanySettings).first()
    if not settings:
        settings = CompanySettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/company", response_model=CompanySettingsResponse)
def update_company_settings(
    payload: CompanySettingsUpdate,
    current_admin: Employee = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    settings = db.query(CompanySettings).first()
    if not settings:
        settings = CompanySettings()
        db.add(settings)

    update_data = payload.model_dump(exclude_unset=True)

    # Convert Base64 logo Data URL into static image file to keep DB payload minimal
    if "company_logo" in update_data and update_data["company_logo"]:
        logo_str = update_data["company_logo"]
        if logo_str.startswith("data:image/"):
            try:
                import base64
                import os
                import uuid

                header, encoded = logo_str.split(",", 1)
                mime = header.split(";")[0].split(":")[1]
                ext = ".png"
                if "jpeg" in mime or "jpg" in mime:
                    ext = ".jpg"
                elif "svg" in mime:
                    ext = ".svg"
                elif "gif" in mime:
                    ext = ".gif"

                os.makedirs("uploads", exist_ok=True)
                filename = f"company_logo_{uuid.uuid4().hex[:8]}{ext}"
                file_path = os.path.join("uploads", filename)
                with open(file_path, "wb") as f:
                    f.write(base64.b64decode(encoded))

                update_data["company_logo"] = f"/uploads/{filename}"
            except Exception as e:
                print(f"Error saving base64 logo image file: {e}")

    for field, value in update_data.items():
        if value is not None:
            setattr(settings, field, value)

    db.commit()
    db.refresh(settings)

    log_audit(
        db,
        action="Updated Company Settings & Branding",
        admin_name=current_admin.full_name,
        remarks=f"Updated company '{settings.company_name}' & Geofence Radius ({settings.geofence_radius_meters}m)",
    )

    return settings


# --- AUDIT LOGS ---
@router.get("/audit-logs", response_model=list[AuditLogResponse])
def get_audit_logs(
    current_admin: Employee = Depends(get_current_admin),
    db: Session = Depends(get_db),
    limit: int = Query(100, le=500),
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs


# --- ATTENDANCE APPROVAL CONSOLE (SHEET VIEW) ---
@router.get("/attendance-sheet", response_model=list[GeotagAttendanceSheetItem])
def get_attendance_sheet(
    current_admin: Employee = Depends(get_current_admin),
    db: Session = Depends(get_db),
    status_filter: str | None = Query(None),
    attendance_date: date | None = Query(None),
):
    query = db.query(Attendance, Employee).join(
        Employee, Attendance.employee_id == Employee.employee_id
    )

    if status_filter and status_filter.lower() != "all":
        query = query.filter(Attendance.status.ilike(f"%{status_filter}%"))

    if attendance_date:
        query = query.filter(Attendance.date == attendance_date)

    records = query.order_by(Attendance.date.desc(), Attendance.check_in.desc()).all()

    sheet_items = []
    for att, emp in records:
        sheet_items.append(
            GeotagAttendanceSheetItem(
                id=att.id,
                employee_id=emp.employee_id,
                full_name=emp.full_name,
                department=emp.department,
                designation=emp.designation,
                employee_photo=emp.photo,
                check_in=att.check_in,
                check_out=att.check_out,
                latitude=att.latitude,
                longitude=att.longitude,
                location_name=att.location_name,
                address=att.address,
                campaign_name=att.campaign_name,
                photo_url=att.photo_url,
                status=att.status or "Pending Approval",
                is_inside_geofence=att.is_inside_geofence,
                browser=att.browser,
                device=att.device,
                ip_address=att.ip_address,
                admin_notes=att.admin_notes,
                remarks=att.remarks,
                approved_by=att.approved_by,
                approved_at=att.approved_at,
                date=att.date,
                work_proofs=att.work_proofs,
            )
        )

    return sheet_items


@router.post("/verify-attendance/{attendance_id}", response_model=AttendanceResponse)
def verify_attendance(
    attendance_id: int,
    payload: AdminVerificationRequest,
    current_admin: Employee = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )

    now = datetime.now()
    attendance.status = payload.status
    attendance.admin_notes = payload.admin_notes
    attendance.remarks = payload.remarks or payload.admin_notes
    attendance.approved_by = current_admin.full_name
    attendance.approved_at = now
    attendance.verified_at = now

    db.commit()
    db.refresh(attendance)

    log_audit(
        db,
        action=f"Marked Attendance as {payload.status}",
        admin_name=current_admin.full_name,
        employee_id=attendance.employee_id,
        remarks=f"Status: {payload.status} | Remarks: {payload.remarks or 'N/A'}",
    )

    return attendance


# --- DASHBOARD STATS ---
@router.get("/dashboard")
def admin_dashboard(
    current_admin: Employee = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_employees = db.query(Employee).filter(Employee.designation != "Admin").count()
    today = date.today()

    approved_today = (
        db.query(Attendance)
        .filter(Attendance.date == today, Attendance.status == "Present")
        .count()
    )

    pending_approvals = (
        db.query(Attendance)
        .filter(Attendance.date == today, Attendance.status.ilike("%Pending%"))
        .count()
    )

    absent_today = (
        db.query(Attendance)
        .filter(Attendance.date == today, Attendance.status == "Absent")
        .count()
    )

    total_submitted_today = (
        db.query(Attendance)
        .filter(Attendance.date == today)
        .count()
    )

    recent_attendance = (
        db.query(Attendance)
        .filter(Attendance.date == today)
        .order_by(Attendance.check_in.desc())
        .limit(10)
        .all()
    )

    return {
        "total_employees": total_employees,
        "present_today": approved_today,
        "pending_approvals": pending_approvals,
        "absent_today": absent_today + max(total_employees - total_submitted_today, 0),
        "checked_out_today": (
            db.query(Attendance)
            .filter(Attendance.date == today, Attendance.check_out.isnot(None))
            .count()
        ),
        "recent_attendance": [
            AttendanceResponse.model_validate(record) for record in recent_attendance
        ],
    }


# --- EMPLOYEE MANAGEMENT ---
@router.get("/employees", response_model=list[EmployeeResponse])
def get_all_employees(
    current_admin: Employee = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    employees = db.query(Employee).order_by(Employee.created_at.desc()).all()
    return employees


@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    current_admin: Employee = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing = db.query(Employee).filter(Employee.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee with this email already exists",
        )

    emp_id = generate_employee_id()
    while db.query(Employee).filter(Employee.employee_id == emp_id).first():
        emp_id = generate_employee_id()

    new_emp = Employee(
        employee_id=emp_id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        department=payload.department,
        designation=payload.designation,
        password=hash_password(payload.password),
        joining_date=payload.joining_date or date.today(),
        status=payload.status,
        photo=payload.photo,
    )

    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    log_audit(
        db,
        action="Created New Employee",
        admin_name=current_admin.full_name,
        employee_id=new_emp.employee_id,
        remarks=f"Created employee '{new_emp.full_name}' ({new_emp.email})",
    )

    return new_emp


@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str,
    payload: EmployeeUpdate,
    current_admin: Employee = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    log_audit(
        db,
        action="Updated Employee Information",
        admin_name=current_admin.full_name,
        employee_id=employee_id,
        remarks=f"Updated employee profile for '{employee.full_name}'",
    )

    return employee


@router.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: str,
    current_admin: Employee = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee and (employee_id.isdigit() or isinstance(employee_id, int)):
        employee = db.query(Employee).filter(Employee.id == int(employee_id)).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    if employee.id == current_admin.id or employee.employee_id == current_admin.employee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account",
        )

    db.query(Attendance).filter(
        (Attendance.employee_id == employee.employee_id) | (Attendance.employee_id == str(employee.id))
    ).delete(synchronize_session=False)

    db.delete(employee)
    db.commit()

    log_audit(
        db,
        action="Deleted Employee",
        admin_name=current_admin.full_name,
        employee_id=employee.employee_id,
        remarks=f"Deleted employee record '{employee.full_name}' ({employee.employee_id})",
    )

    return {"message": "Deleted successfully", "employee_id": employee.employee_id}


# --- REPORTS ---
@router.get("/reports", response_model=list[AttendanceReportItem])
def get_attendance_reports(
    current_admin: Employee = Depends(get_current_admin),
    db: Session = Depends(get_db),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
):
    if not start_date:
        start_date = date.today().replace(day=1)
    if not end_date:
        end_date = date.today()

    total_days = (end_date - start_date).days + 1
    employees = (
        db.query(Employee)
        .filter(Employee.designation != "Admin")
        .order_by(Employee.full_name)
        .all()
    )

    reports = []
    for employee in employees:
        present_days = (
            db.query(Attendance)
            .filter(
                Attendance.employee_id == employee.employee_id,
                Attendance.date >= start_date,
                Attendance.date <= end_date,
                Attendance.status == "Present",
            )
            .count()
        )

        reports.append(
            AttendanceReportItem(
                employee_id=employee.employee_id,
                full_name=employee.full_name,
                department=employee.department,
                total_days=total_days,
                present_days=present_days,
                absent_days=max(total_days - present_days, 0),
            )
        )

    return reports
