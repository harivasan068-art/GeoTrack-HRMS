import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database.database import Base, engine
from routers import admin, attendance, auth, employees, work_proof

os.makedirs("uploads", exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            try:
                conn.execute(text("ALTER TABLE company_settings ALTER COLUMN company_logo TYPE TEXT;"))
                conn.commit()
            except Exception:
                pass
    except Exception:
        pass

    try:
        from seed import auto_seed_if_needed
        auto_seed_if_needed()
    except Exception as e:
        print(f"Auto-seed warning on startup: {e}")
    yield


app = FastAPI(
    title="GeoTrack HRMS API",
    description="Employee Attendance System with GPS Tracking",
    version="1.0.0",
    lifespan=lifespan,
)

# Allowed CORS Origins
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://geo-track-hrms.vercel.app",
    "https://www.geo-track-hrms.vercel.app",
]

env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    allowed_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(work_proof.router, prefix="/api/work-proof", tags=["Work Proof"])


@app.get("/")
def root():
    return {
        "message": "GeoTrack HRMS API is running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
