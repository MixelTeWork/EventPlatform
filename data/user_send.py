from sqlalchemy import Column, ForeignKey, Integer, orm
from sqlalchemy.orm import Session

from bafser import SqlAlchemyBase
from data._tables import Tables
from data.send import Send
from data.user import User


class UserSend(SqlAlchemyBase):
    __tablename__ = Tables.UserSend

    userId = Column(Integer, ForeignKey("User.id"), primary_key=True)
    sendId = Column(Integer, ForeignKey("Send.id"), primary_key=True)

    send = orm.relationship("Send")

    def __repr__(self):
        return f"<UserSend> user: {self.userId} send: {self.sendId}"

    @staticmethod
    def new(user: User, send: Send):
        db_sess = Session.object_session(user)
        us = UserSend(userId=user.id, sendId=send.id)
        db_sess.add(us)
        db_sess.commit()

        return us
