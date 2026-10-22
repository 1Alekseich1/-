"""Indexes for catalog search and overdue loans"""
from alembic import op

revision = '002_indexes'
down_revision = '001_base'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_index('ix_books_author_year', 'books', ['author_id', 'year'])
    op.create_index('ix_loans_due_return', 'loans', ['due_date', 'return_date'])

def downgrade() -> None:
    op.drop_index('ix_loans_due_return', table_name='loans')
    op.drop_index('ix_books_author_year', table_name='books')
