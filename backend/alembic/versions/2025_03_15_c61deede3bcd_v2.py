"""v2

Revision ID: c61deede3bcd
Revises: a5e54a362a9f
Create Date: 2025-03-15 11:37:53.664909

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import orm
from data.other import Other
from bfs import Role


# revision identifiers, used by Alembic.
revision: str = 'c61deede3bcd'
down_revision: Union[str, None] = 'a5e54a362a9f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('Other',
    sa.Column('ticketLoginEnabled', sa.Boolean(), server_default='0', nullable=False),
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_Other')),
    sa.UniqueConstraint('id', name=op.f('uq_Other_id'))
    )
    # ### end Alembic commands ###

    bind = op.get_bind()
    db_sess = orm.Session(bind=bind)

    Other.init(db_sess)
    Role.update_roles_permissions(db_sess)


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('Other')
    # ### end Alembic commands ###
