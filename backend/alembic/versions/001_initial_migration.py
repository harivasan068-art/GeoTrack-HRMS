"""Initial migration creating all tables

Revision ID: 001_initial_migration
Revises: 
Create Date: 2026-07-31 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial_migration'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create employees table
    op.create_table(
        'employees',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('employee_id', sa.String(length=50), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('department', sa.String(length=100), nullable=False),
        sa.Column('designation', sa.String(length=100), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('photo', sa.String(length=500), nullable=True),
        sa.Column('joining_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='Active'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_employees_id'), 'employees', ['id'], unique=False)
    op.create_index(op.f('ix_employees_employee_id'), 'employees', ['employee_id'], unique=True)
    op.create_index(op.f('ix_employees_email'), 'employees', ['email'], unique=True)

    # 2. Create company_settings table
    op.create_table(
        'company_settings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('company_name', sa.String(length=150), nullable=False, server_default='GeoTrack HRMS'),
        sa.Column('company_logo', sa.String(length=500), nullable=True),
        sa.Column('theme_color', sa.String(length=50), nullable=False, server_default='#4f46e5'),
        sa.Column('phone', sa.String(length=50), nullable=False, server_default='+1-800-555-0199'),
        sa.Column('email', sa.String(length=150), nullable=False, server_default='contact@geotrackhrms.com'),
        sa.Column('address', sa.String(length=255), nullable=False, server_default='100 Tech Park Way, Suite 400, San Francisco, CA'),
        sa.Column('website', sa.String(length=150), nullable=False, server_default='https://geotrackhrms.com'),
        sa.Column('office_latitude', sa.Float(), nullable=False, server_default='37.7749'),
        sa.Column('office_longitude', sa.Float(), nullable=False, server_default='-122.4194'),
        sa.Column('geofence_radius_meters', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_company_settings_id'), 'company_settings', ['id'], unique=False)

    # 3. Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('action', sa.String(length=150), nullable=False),
        sa.Column('employee_id', sa.String(length=50), nullable=True),
        sa.Column('admin_name', sa.String(length=150), nullable=False),
        sa.Column('remarks', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_audit_logs_employee_id'), 'audit_logs', ['employee_id'], unique=False)

    # 4. Create attendance table
    op.create_table(
        'attendance',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('employee_id', sa.String(length=50), nullable=False),
        sa.Column('check_in', sa.DateTime(), nullable=True),
        sa.Column('check_out', sa.DateTime(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('location_name', sa.String(length=255), nullable=True),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('campaign_name', sa.String(length=255), nullable=True),
        sa.Column('photo_url', sa.String(length=500), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='Pending Approval'),
        sa.Column('is_inside_geofence', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('browser', sa.String(length=150), nullable=True),
        sa.Column('device', sa.String(length=150), nullable=True),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('admin_notes', sa.String(length=500), nullable=True),
        sa.Column('remarks', sa.String(length=500), nullable=True),
        sa.Column('approved_by', sa.String(length=150), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('verified_at', sa.DateTime(), nullable=True),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.employee_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_attendance_id'), 'attendance', ['id'], unique=False)
    op.create_index(op.f('ix_attendance_employee_id'), 'attendance', ['employee_id'], unique=False)
    op.create_index(op.f('ix_attendance_status'), 'attendance', ['status'], unique=False)
    op.create_index(op.f('ix_attendance_date'), 'attendance', ['date'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_attendance_date'), table_name='attendance')
    op.drop_index(op.f('ix_attendance_status'), table_name='attendance')
    op.drop_index(op.f('ix_attendance_employee_id'), table_name='attendance')
    op.drop_index(op.f('ix_attendance_id'), table_name='attendance')
    op.drop_table('attendance')

    op.drop_index(op.f('ix_audit_logs_employee_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_id'), table_name='audit_logs')
    op.drop_table('audit_logs')

    op.drop_index(op.f('ix_company_settings_id'), table_name='company_settings')
    op.drop_table('company_settings')

    op.drop_index(op.f('ix_employees_email'), table_name='employees')
    op.drop_index(op.f('ix_employees_employee_id'), table_name='employees')
    op.drop_index(op.f('ix_employees_id'), table_name='employees')
    op.drop_table('employees')
