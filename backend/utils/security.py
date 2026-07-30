import secrets
import string

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_employee_id() -> str:
    prefix = "EMP"
    suffix = "".join(secrets.choice(string.digits) for _ in range(6))
    return f"{prefix}{suffix}"


def get_user_role(designation: str) -> str:
    if designation.strip().lower() == "admin":
        return "admin"
    return "employee"
