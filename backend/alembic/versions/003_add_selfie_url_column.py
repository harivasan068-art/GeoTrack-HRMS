"""Add selfie_url column to attendance table

Revision ID: 003_add_selfie_url
Revises: 002_work_proof_checkout
Create Date: 2026-08-03 00:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_add_selfie_url'
down_revision: Union[str, None] = '002_work_proof_checkout'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('attendance', sa.Column('selfie_url', sa.Text(), nullable=True))
    op.execute("UPDATE attendance SET selfie_url = photo_url WHERE selfie_url IS NULL AND photo_url IS NOT NULL;")
    op.execute("UPDATE attendance SET photo_url = selfie_url WHERE photo_url IS NULL AND selfie_url IS NOT NULL;")


def downgrade() -> None:
    op.drop_column('attendance', 'selfie_url')
