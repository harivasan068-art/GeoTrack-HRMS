"""Add work proof uploads and check-in/check-out fields to attendance table

Revision ID: 002_work_proof_checkout
Revises: 001_initial_migration
Create Date: 2026-08-02 20:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_work_proof_checkout'
down_revision: Union[str, None] = '001_initial_migration'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('attendance', sa.Column('check_in_time', sa.DateTime(), nullable=True))
    op.add_column('attendance', sa.Column('check_out_time', sa.DateTime(), nullable=True))
    op.add_column('attendance', sa.Column('working_hours', sa.String(length=100), nullable=True))
    op.add_column('attendance', sa.Column('checkout_latitude', sa.Float(), nullable=True))
    op.add_column('attendance', sa.Column('checkout_longitude', sa.Float(), nullable=True))
    op.add_column('attendance', sa.Column('checkout_location_name', sa.String(length=255), nullable=True))
    op.add_column('attendance', sa.Column('checkout_selfie_url', sa.Text(), nullable=True))
    op.add_column('attendance', sa.Column('checkout_work_photo_url', sa.Text(), nullable=True))
    op.add_column('attendance', sa.Column('checkout_work_video_url', sa.Text(), nullable=True))
    op.add_column('attendance', sa.Column('work_photo_url', sa.Text(), nullable=True))
    op.add_column('attendance', sa.Column('work_video_url', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('attendance', 'work_video_url')
    op.drop_column('attendance', 'work_photo_url')
    op.drop_column('attendance', 'checkout_work_video_url')
    op.drop_column('attendance', 'checkout_work_photo_url')
    op.drop_column('attendance', 'checkout_selfie_url')
    op.drop_column('attendance', 'checkout_location_name')
    op.drop_column('attendance', 'checkout_longitude')
    op.drop_column('attendance', 'checkout_latitude')
    op.drop_column('attendance', 'working_hours')
    op.drop_column('attendance', 'check_out_time')
    op.drop_column('attendance', 'check_in_time')
