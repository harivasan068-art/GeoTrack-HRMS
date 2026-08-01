import os
from pathlib import Path
from dotenv import load_dotenv

# Absolute path to backend directory
BASE_DIR = Path(__file__).resolve().parent

# Absolute path to backend/.env
ENV_FILE = BASE_DIR / ".env"

# Load backend/.env with override=True to guarantee values override system environment
load_dotenv(dotenv_path=ENV_FILE, override=True)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(f"DATABASE_URL is not set or empty in {ENV_FILE}")

print(f"DATABASE_URL loaded: {DATABASE_URL}")

SECRET_KEY = os.getenv("SECRET_KEY", "geotrack-hrms-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

