"""Create seven normalized tables"""
from alembic import op
from app.db.session import Base
import app.models  # noqa: F401

revision = '001_base'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    for name in ('authors', 'genres', 'users', 'books', 'profiles', 'book_genres', 'loans'):
        Base.metadata.tables[name].create(op.get_bind())

def downgrade() -> None:
    for name in ('loans', 'book_genres', 'profiles', 'books', 'users', 'genres', 'authors'):
        Base.metadata.tables[name].drop(op.get_bind())
