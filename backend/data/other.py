import logging

from bafser import SingletonMixin, SqlAlchemyBase
from sqlalchemy.orm import Mapped, Session, mapped_column

from data import Tables


class Other(SqlAlchemyBase, SingletonMixin):
    __tablename__ = Tables.Other

    ticketLoginEnabled: Mapped[bool] = mapped_column(default=False)

    @staticmethod
    def set_ticketLoginEnabled(value: bool, *, db_sess: Session | None = None):
        obj = Other.get2(db_sess=db_sess)
        obj.ticketLoginEnabled = value
        obj.db_sess.commit()
        logging.info(f"set_ticketLoginEnabled {value=}")
