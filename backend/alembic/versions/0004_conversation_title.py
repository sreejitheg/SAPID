"""add conversation title column"""

from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("conversation", sa.Column("title", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("conversation", "title")
