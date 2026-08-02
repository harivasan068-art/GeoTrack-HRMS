"""Add work_proofs table

Revision ID: 004_add_work_proofs
Revises: 003_add_selfie_url
Create Date: 2026-08-03 02:25:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004_add_work_proofs'
down_revision: Union[str, None] = '001_initial_migration'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'work_proofs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('attendance_id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.String(length=50), nullable=False),
        sa.Column('media_type', sa.String(length=20), nullable=False),
        sa.Column('file_url', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['attendance_id'], ['attendance.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.employee_id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_work_proofs_id'), 'work_proofs', ['id'], unique=False)
    op.create_index(op.f('ix_work_proofs_attendance_id'), 'work_proofs', ['attendance_id'], unique=False)
    op.create_index(op.f('ix_work_proofs_employee_id'), 'work_proofs', ['employee_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_work_proofs_employee_id'), table_name='work_proofs')
    op.drop_index(op.f('ix_work_proofs_attendance_id'), table_name='work_proofs')
    op.drop_index(op.f('ix_work_proofs_id'), table_name='work_proofs')
    op.drop_table('work_proofs')
