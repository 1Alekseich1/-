"""Authentication fields added without changing earlier migrations."""
from alembic import op
import sqlalchemy as sa
revision = '003_auth'
down_revision = '002_indexes'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('users', sa.Column('password_hash', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('role', sa.String(20), nullable=False, server_default='member'))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()))
    op.create_check_constraint('ck_users_role', 'users', "role IN ('member', 'librarian')")

def downgrade() -> None:
    op.drop_constraint('ck_users_role', 'users', type_='check')
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'role')
    op.drop_column('users', 'password_hash')
