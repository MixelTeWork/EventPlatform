import logging

from bafser import SingletonMixin, SqlAlchemyBase
from sqlalchemy.orm import Mapped, Session, mapped_column

from data._tables import Tables


class Other(SqlAlchemyBase, SingletonMixin):
    __tablename__ = Tables.Other

    ticketLoginEnabled: Mapped[bool] = mapped_column(default=False)

    @staticmethod
    def set_ticketLoginEnabled(db_sess: Session, value: bool):
        obj = Other.get(db_sess)
        obj.ticketLoginEnabled = value
        db_sess.commit()
        logging.info(f"set_ticketLoginEnabled {value=}")
