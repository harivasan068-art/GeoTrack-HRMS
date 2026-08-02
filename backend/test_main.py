import os
import sys
import unittest

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app


class TestGeoTrackAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from seed import auto_seed_if_needed
        auto_seed_if_needed()
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

    def test_06_attendance_endpoints_with_auth(self):
        login_resp = self.client.post(
            "/api/auth/login",
            json={"email": "john.doe@geotrack.com", "password": "password123"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        today_resp = self.client.get("/api/attendance/today", headers=headers)
        self.assertEqual(today_resp.status_code, 200)

        history_resp = self.client.get("/api/attendance/history", headers=headers)
        self.assertEqual(history_resp.status_code, 200)
        self.assertIsInstance(history_resp.json(), list)

    def test_07_admin_employee_list_with_auth(self):
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

    def test_08_admin_reports_with_auth(self):
        login_resp = self.client.post(
            "/api/auth/login",
            json={"email": "admin@geotrack.com", "password": "admin123"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        reports_resp = self.client.get("/api/admin/reports", headers=headers)
        self.assertEqual(reports_resp.status_code, 200)

    def test_09_admin_attendance_sheet_and_verification(self):
        login_resp = self.client.post(
            "/api/auth/login",
            json={"email": "admin@geotrack.com", "password": "admin123"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        sheet_resp = self.client.get("/api/admin/attendance-sheet", headers=headers)
        self.assertEqual(sheet_resp.status_code, 200)
        sheet_items = sheet_resp.json()
        self.assertGreaterEqual(len(sheet_items), 1)

        target_item = sheet_items[0]
        target_id = target_item["id"]

        verify_resp = self.client.post(
            f"/api/admin/verify-attendance/{target_id}",
            json={"status": "Present", "admin_notes": "Verified in automated test"},
            headers=headers,
        )
        self.assertEqual(verify_resp.status_code, 200)
        self.assertEqual(verify_resp.json()["status"], "Present")

    def test_10_company_settings_and_audit_logs(self):
        # Public Company Settings endpoint
        comp_resp = self.client.get("/api/admin/company")
        self.assertEqual(comp_resp.status_code, 200)
        data = comp_resp.json()
        self.assertIn("company_name", data)

        # Admin update company settings & get audit logs
        login_resp = self.client.post(
            "/api/auth/login",
            json={"email": "admin@geotrack.com", "password": "admin123"},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        update_resp = self.client.put(
            "/api/admin/company",
            json={"company_name": "GeoTrack HRMS Global", "geofence_radius_meters": 250.0},
            headers=headers,
        )
        self.assertEqual(update_resp.status_code, 200)
        self.assertEqual(update_resp.json()["company_name"], "GeoTrack HRMS Global")

        logs_resp = self.client.get("/api/admin/audit-logs", headers=headers)
        self.assertEqual(logs_resp.status_code, 200)
        self.assertGreaterEqual(len(logs_resp.json()), 1)


if __name__ == "__main__":
    unittest.main()
