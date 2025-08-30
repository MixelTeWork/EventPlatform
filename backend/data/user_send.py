from bafser import SqlAlchemyBase
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

from data._tables import Tables
from data.send import Send
from data.user import User


class UserSend(SqlAlchemyBase):
    __tablename__ = Tables.UserSend

    userId: Mapped[int] = mapped_column(ForeignKey(f"{Tables.User}.id"), primary_key=True)
    sendId: Mapped[int] = mapped_column(ForeignKey(f"{Tables.Send}.id"), primary_key=True)

    send: Mapped[Send] = relationship(init=False)

    def __repr__(self):
        return f"<UserSend> user: {self.userId} send: {self.sendId}"

    @staticmethod
    def new(user: User, send: Send):
        db_sess = Session.object_session(user)
        assert db_sess
        us = UserSend(userId=user.id, sendId=send.id)
        db_sess.add(us)
        db_sess.commit()

        return us
