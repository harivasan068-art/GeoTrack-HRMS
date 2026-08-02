import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database.database import Base, engine
from routers import admin, attendance, auth, employees

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

            # Auto-migrate missing columns to attendance table (PostgreSQL & SQLite)
            new_columns = [
                ("selfie_url", "TEXT"),
                ("check_in_time", "TIMESTAMP"),
                ("check_out_time", "TIMESTAMP"),
                ("working_hours", "VARCHAR(100)"),
                ("checkout_latitude", "FLOAT"),
                ("checkout_longitude", "FLOAT"),
                ("checkout_location_name", "VARCHAR(255)"),
                ("checkout_selfie_url", "TEXT"),
                ("checkout_work_photo_url", "TEXT"),
                ("checkout_work_video_url", "TEXT"),
                ("work_photo_url", "TEXT"),
                ("work_video_url", "TEXT"),
            ]
            for col_name, col_type in new_columns:
                try:
                    conn.execute(text(f"ALTER TABLE attendance ADD COLUMN {col_name} {col_type};"))
                    conn.commit()
                except Exception:
                    pass

            try:
                for col in ["photo_url", "work_photo_url", "work_video_url", "checkout_selfie_url", "checkout_work_photo_url", "checkout_work_video_url"]:
                    conn.execute(text(f"UPDATE attendance SET {col} = NULL WHERE {col} LIKE 'data:%' AND LENGTH({col}) < 100;"))
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


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
