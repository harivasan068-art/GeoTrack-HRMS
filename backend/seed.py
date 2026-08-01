import os
import sys
from datetime import date, datetime, timedelta

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from alembic.config import Config
from alembic import command
from database.database import Base, SessionLocal, engine
from models.attendance import Attendance
from models.company import AuditLog, CompanySettings
from models.employee import Employee
from utils.security import hash_password


def seed_database():
    print("Recreating database tables for Enterprise HRMS...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Stamp alembic version table so alembic upgrade head succeeds seamlessly
    alembic_ini_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "alembic.ini")
    alembic_cfg = Config(alembic_ini_path)
    command.stamp(alembic_cfg, "head")

    db = SessionLocal()

    try:
        print("Seeding Company Settings & Branding...")
        company = CompanySettings(
            company_name="GeoTrack Enterprise HRMS",
            company_logo="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
            theme_color="#4f46e5",
            phone="+1-800-555-0199",
            email="hr@geotrackhrms.com",
            address="100 Tech Park Way, Suite 400, San Francisco, CA",
            website="https://geotrackhrms.com",
            office_latitude=37.7749,
            office_longitude=-122.4194,
            geofence_radius_meters=200.0,
        )
        db.add(company)
        db.commit()

        print("Seeding Employees...")
        admin = Employee(
            employee_id="EMP001",
            full_name="Sarah Jenkins",
            email="admin@geotrack.com",
            phone="+1-555-0100",
            department="Executive Management",
            designation="Admin",
            password=hash_password("admin123"),
            joining_date=date(2022, 1, 15),
            status="Active",
            photo="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
        )

        emp1 = Employee(
            employee_id="EMP002",
            full_name="John Doe",
            email="john.doe@geotrack.com",
            phone="+1-555-0101",
            department="Software Engineering",
            designation="Senior Frontend Engineer",
            password=hash_password("password123"),
            joining_date=date(2023, 3, 10),
            status="Active",
            photo="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        )

        emp2 = Employee(
            employee_id="EMP003",
            full_name="Jane Smith",
            email="jane.smith@geotrack.com",
            phone="+1-555-0102",
            department="Product Management",
            designation="Lead Product Designer",
            password=hash_password("password123"),
            joining_date=date(2023, 6, 1),
            status="Active",
            photo="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
        )

        emp3 = Employee(
            employee_id="EMP004",
            full_name="Alex Rivera",
            email="alex.wong@geotrack.com",
            phone="+1-555-0103",
            department="Field Operations",
            designation="Site Operations Lead",
            password=hash_password("password123"),
            joining_date=date(2024, 2, 20),
            status="Active",
            photo="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
        )

        db.add_all([admin, emp1, emp2, emp3])
        db.commit()

        print("Seeding Audit Logs...")
        audit_logs = [
            AuditLog(
                action="System Initialization",
                admin_name="Sarah Jenkins",
                remarks="Enterprise HRMS database initialized and default branding loaded.",
            ),
            AuditLog(
                action="Geofence Radius Configuration",
                admin_name="Sarah Jenkins",
                remarks="Configured office geofence center (37.7749, -122.4194) with 200m radius.",
            ),
        ]
        db.add_all(audit_logs)
        db.commit()

        print("Seeding Attendance Records...")
        today = date.today()

        records = [
            # John Doe Pending Approval Today
            Attendance(
                employee_id="EMP002",
                date=today,
                check_in=datetime.combine(today, datetime.min.time()).replace(hour=9, minute=5),
                latitude=37.7749,
                longitude=-122.4194,
                location_name="San Francisco Tech Park HQ",
                address="100 Tech Park Way, Suite 400, San Francisco, CA 94105",
                campaign_name="On-Site Headquarters",
                photo_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
                status="Pending Approval",
                is_inside_geofence=True,
                browser="Chrome 125.0 / macOS",
                device="MacBook Pro",
                ip_address="192.168.1.45",
            ),
            # Jane Smith Outside Geofence Zone Pending Approval
            Attendance(
                employee_id="EMP003",
                date=today,
                check_in=datetime.combine(today, datetime.min.time()).replace(hour=8, minute=50),
                latitude=37.7833,
                longitude=-122.4167,
                location_name="Downtown Client Innovation Hub",
                address="500 Howard St, San Francisco, CA 94105",
                campaign_name="Client On-Site Activation",
                photo_url="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
                status="Pending Approval (Outside Zone)",
                is_inside_geofence=False,
                browser="Safari Mobile / iOS 17.5",
                device="iPhone 15 Pro",
                ip_address="172.56.21.9",
            ),
            # Alex Rivera Approved Present (Yesterday)
            Attendance(
                employee_id="EMP004",
                date=today - timedelta(days=1),
                check_in=datetime.combine(today - timedelta(days=1), datetime.min.time()).replace(hour=8, minute=55),
                check_out=datetime.combine(today - timedelta(days=1), datetime.min.time()).replace(hour=17, minute=45),
                latitude=37.7749,
                longitude=-122.4194,
                location_name="San Francisco Tech Park HQ",
                address="100 Tech Park Way, Suite 400, San Francisco, CA 94105",
                campaign_name="HQ Office",
                photo_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
                status="Present",
                is_inside_geofence=True,
                browser="Edge 125.0 / Windows 11",
                device="Dell XPS 15",
                ip_address="192.168.1.88",
                approved_by="Sarah Jenkins",
                approved_at=datetime.utcnow() - timedelta(days=1),
                remarks="Verified live selfie & geofence location.",
            ),
        ]

        db.add_all(records)
        db.commit()

        print("Successfully seeded Enterprise HRMS database!")
        print("-----------------------------------------------------------------")
        print("Single Admin Credentials   : admin@geotrack.com / admin123")
        print("Employee 1 (Engineering)  : john.doe@geotrack.com / password123")
        print("Employee 2 (Product)      : jane.smith@geotrack.com / password123")
        print("Employee 3 (Field Operations): alex.wong@geotrack.com / password123")
        print("-----------------------------------------------------------------")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
