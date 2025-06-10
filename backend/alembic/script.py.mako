<%text># Template used by Alembic to generate migration scripts</%text>
"""${message}"""

revision = '${up_revision}'
down_revision = ${down_revision if down_revision else None}
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
