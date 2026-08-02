import os
import sys
import unittest
from datetime import date

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app


class TestGeoTrackAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from seed import seed_database
        seed_database()
        cls.client = TestClient(app)

    def test_01_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("GeoTrack HRMS API", data["message"])

    def test_02_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "healthy"})

    def test_03_admin_login_success(self):
        response = self.client.post(
            "/api/auth/login",
            json={"email": "admin@geotrack.com", "password": "admin123"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        self.assertEqual(data["role"], "admin")

    def test_04_employee_login_success(self):
        response = self.client.post(
            "/api/auth/login",
            json={"email": "john.doe@geotrack.com", "password": "password123"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["role"], "employee")

    def test_05_invalid_login(self):
        response = self.client.post(
            "/api/auth/login",
            json={"email": "admin@geotrack.com", "password": "wrongpassword"},
        )
        self.assertEqual(response.status_code, 401)

    def test_06_attendance_checkin_checkout_working_hours(self):
        login_resp = self.client.post(
            "/api/auth/login",
            json={"email": "alex.wong@geotrack.com", "password": "password123"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Initial Check-in at HQ site
        files = {
            "photo": ("selfie.jpg", b"\xff\xd8\xff\xe0test_jpg_data", "image/jpeg")
        }
        data = {
            "latitude": 37.7749,
            "longitude": -122.4194,
            "location_name": "San Francisco Tech Park HQ",
            "address": "100 Tech Park Way",
        }
        checkin_resp = self.client.post("/api/attendance/geotag-upload", data=data, files=files, headers=headers)
        self.assertEqual(checkin_resp.status_code, 201)
        checkin_data = checkin_resp.json()
        self.assertIsNotNone(checkin_data["check_in_time"])

        # 2. Continuous location update at Customer Worksite B
        site2_data = {
            "latitude": 37.7833,
            "longitude": -122.4167,
            "location_name": "Customer Site B",
            "address": "500 Market Street",
        }
        site2_resp = self.client.post("/api/attendance/geotag-upload", data=site2_data, files=files, headers=headers)
        self.assertEqual(site2_resp.status_code, 201)

        # 3. Evening Check-out
        checkout_data = {
            "latitude": 37.7749,
            "longitude": -122.4194,
            "location_name": "San Francisco Tech Park HQ",
        }
        checkout_resp = self.client.post("/api/attendance/check-out-full", data=checkout_data, headers=headers)
        self.assertEqual(checkout_resp.status_code, 200)
        rec = checkout_resp.json()
        self.assertIsNotNone(rec["check_out_time"])
        self.assertIsNotNone(rec["working_hours"])

    def test_07_admin_employee_directory_and_sheet(self):
        login_resp = self.client.post(
            "/api/auth/login",
            json={"email": "admin@geotrack.com", "password": "admin123"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        employees_resp = self.client.get("/api/admin/employees", headers=headers)
        self.assertEqual(employees_resp.status_code, 200)
        employees = employees_resp.json()
        self.assertGreaterEqual(len(employees), 3)

        sheet_resp = self.client.get("/api/admin/attendance-sheet", headers=headers)
        self.assertEqual(sheet_resp.status_code, 200)
        sheet_items = sheet_resp.json()
        self.assertGreaterEqual(len(sheet_items), 1)

    def test_08_admin_reports_with_auth(self):
        login_resp = self.client.post(
            "/api/auth/login",
            json={"email": "admin@geotrack.com", "password": "admin123"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        reports_resp = self.client.get("/api/admin/reports", headers=headers)
        self.assertEqual(reports_resp.status_code, 200)

    def test_09_company_settings_and_audit_logs(self):
        comp_resp = self.client.get("/api/admin/company")
        self.assertEqual(comp_resp.status_code, 200)
        data = comp_resp.json()
        self.assertIn("company_name", data)


if __name__ == "__main__":
    unittest.main()
