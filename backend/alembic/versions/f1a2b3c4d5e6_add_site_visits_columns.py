"""Add ip_address and path columns to site_visits

Revision ID: f1a2b3c4d5e6
Revises: a1b2c3d4e5f6
Create Date: 2026-07-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add ip_address column (nullable, so existing rows are unaffected)
    op.add_column('site_visits', sa.Column('ip_address', sa.String(length=45), nullable=True))
    # Add path column (nullable, so existing rows are unaffected)
    op.add_column('site_visits', sa.Column('path', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('site_visits', 'path')
    op.drop_column('site_visits', 'ip_address')
