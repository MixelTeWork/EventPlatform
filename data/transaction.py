from sqlalchemy import Column, ForeignKey, Integer, DateTime, String, orm
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.user import User
from data.get_datetime_now import get_datetime_now
from .db_session import SqlAlchemyBase


class Transaction(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "Transaction"

    id     = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    date   = Column(DateTime, nullable=False)
    fromId = Column(Integer, ForeignKey("User.id"), nullable=False)
    toId   = Column(Integer, ForeignKey("User.id"), nullable=False)
    value  = Column(Integer, nullable=False)
    action = Column(String(16), nullable=False)
    itemId = Column(Integer, nullable=False)

    userFrom = orm.relationship("User", foreign_keys=[fromId])
    userTo = orm.relationship("User", foreign_keys=[toId])

    def __repr__(self):
        return f"<Transaction> [{self.id}] {self.action}"

    @staticmethod
    def new(db_sess: Session, userFrom: User, userTo: User, value: int, action: str, itemId: int = -1):
        now = get_datetime_now()
        item = Transaction(
            date=now,
            fromId=userFrom.id,
            toId=userTo.id,
            value=value,
            action=action,
            itemId=itemId,
        )
        db_sess.add(item)
        db_sess.commit()

        return item

    def get_dict(self):
        return {
            "id": self.id,
            "date": self.date,
            "fromId": self.fromId,
            "toId": self.toId,
            "value": self.value,
            "action": self.action,
            "itemId": self.itemId,
        }


class Actions:
    buyItem = "buyItem"
    endQuest = "endQuest"
