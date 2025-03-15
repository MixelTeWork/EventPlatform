import logging
from sqlalchemy import Boolean, Column, DefaultClause
from sqlalchemy.orm import Session

from bfs import SqlAlchemyBase, IdMixin
from data._tables import Tables


class Other(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.Other

    ticketLoginEnabled = Column(Boolean, DefaultClause("0"), nullable=False)

    @staticmethod
    def init(db_sess: Session):
        obj = Other.get(db_sess)
        if obj is not None:
            return
        db_sess.add(Other(id=1))
        db_sess.commit()

    @staticmethod
    def get(db_sess: Session):
        return db_sess.get(Other, 1)

    @staticmethod
    def set_ticketLoginEnabled(db_sess: Session, value: bool):
        obj = Other.get(db_sess)
        obj.ticketLoginEnabled = value
        db_sess.commit()
        logging.info(f"set_ticketLoginEnabled {value=}")
