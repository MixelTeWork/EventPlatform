from sqlalchemy import Column, DefaultClause, String
from sqlalchemy.orm import Session

from bfs import SqlAlchemyBase, IdMixin
from data._tables import Tables


# add init to alembic
class Tourney(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.Tourney

    startStr = Column(String(8), DefaultClause("16:30"), nullable=False)

    @staticmethod
    def init(db_sess: Session):
        game = Tourney.get(db_sess)
        if game is not None:
            return
        db_sess.add(Tourney(id=1))
        db_sess.commit()

    @staticmethod
    def get(db_sess: Session):
        return db_sess.get(Tourney, 1)
