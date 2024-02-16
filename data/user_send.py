from sqlalchemy import Column, ForeignKey, Integer, orm
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin
from .db_session import SqlAlchemyBase


class UserSend(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "UserSend"

    userId = Column(Integer, ForeignKey("User.id"), primary_key=True)
    sendId = Column(Integer, ForeignKey("Send.id"), primary_key=True)

    send = orm.relationship("Send")

    def __repr__(self):
        return f"<UserSend> user: {self.userId} send: {self.sendId}"

    @staticmethod
    def new(db_sess: Session, user, send):
        userQuest = UserSend(userId=user.id, sendId=send.id)
        db_sess.add(userQuest)
        db_sess.commit()

        return userQuest
