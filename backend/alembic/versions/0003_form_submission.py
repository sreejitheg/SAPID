"""add form_submission table"""

from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "form_submission",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("form_id", sa.String(), nullable=False),
        sa.Column("session_id", sa.Integer(), sa.ForeignKey("chat_session.id"), nullable=False),
        sa.Column("data", sa.Text(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("form_submission")

