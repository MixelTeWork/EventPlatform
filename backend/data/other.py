import logging
from sqlalchemy.orm import Session, Mapped, mapped_column

from bafser import SqlAlchemyBase, SingletonMixin
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
