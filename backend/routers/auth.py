import base64
import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from auth.jwt_handler import create_access_token
from database.database import get_db
from models.employee import Employee
from schemas.auth import LoginRequest, TokenResponse
from schemas.employee import EmployeeCreate, EmployeeProfileUpdate, EmployeeResponse
from utils.security import generate_employee_id, get_user_role, hash_password, verify_password

router = APIRouter()


@router.post("/register", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def register_employee(employee_data: EmployeeCreate, db: Session = Depends(get_db)):
    existing_email = db.query(Employee).filter(Employee.email == employee_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    employee_id = generate_employee_id()
    while db.query(Employee).filter(Employee.employee_id == employee_id).first():
        employee_id = generate_employee_id()

    new_employee = Employee(
        employee_id=employee_id,
        full_name=employee_data.full_name,
        email=employee_data.email,
        phone=employee_data.phone,
        department=employee_data.department,
        designation=employee_data.designation,
        password=hash_password(employee_data.password),
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee


@router.api_route("/seed", methods=["GET", "POST"])
def seed_endpoint():
    try:
        from seed import auto_seed_if_needed
        auto_seed_if_needed()
        return {
            "status": "success",
            "message": "Database seeded successfully with admin credentials (admin@geotrack.com / admin123)",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.email == credentials.email).first()

    if not employee or not verify_password(credentials.password, employee.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    role = get_user_role(employee.designation)
    access_token = create_access_token(
        data={"sub": employee.employee_id, "role": role},
    )

    return TokenResponse(
        access_token=access_token,
        role=role,
        employee_id=employee.employee_id,
        full_name=employee.full_name,
    )


@router.get("/me", response_model=EmployeeResponse)
def get_me(current_user: Employee = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=EmployeeResponse)
def update_profile(
    payload: EmployeeProfileUpdate,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_data = payload.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] and update_data["email"] != current_user.email:
        existing = db.query(Employee).filter(Employee.email == update_data["email"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered to another account",
            )
        current_user.email = update_data["email"]

    if "password" in update_data and update_data["password"] and isinstance(update_data["password"], str) and update_data["password"].strip() != "":
        current_user.password = hash_password(update_data["password"].strip())

    for field, value in update_data.items():
        if field not in ("email", "password") and value is not None:
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/upload-photo", response_model=EmployeeResponse)
async def upload_profile_photo(
    photo: UploadFile = File(...),
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = await photo.read()
    if content:
        mime_type = photo.content_type or "image/jpeg"
        base64_str = base64.b64encode(content).decode("utf-8")
        photo_url = f"data:{mime_type};base64,{base64_str}"

        try:
            os.makedirs("uploads", exist_ok=True)
            file_ext = os.path.splitext(photo.filename)[1] or ".jpg"
            unique_filename = f"profile_{current_user.employee_id}_{uuid.uuid4().hex[:8]}{file_ext}"
            file_path = os.path.join("uploads", unique_filename)
            with open(file_path, "wb") as buffer:
                buffer.write(content)
        except Exception:
            pass
    else:
        photo_url = current_user.photo

    current_user.photo = photo_url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
