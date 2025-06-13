from sqlalchemy import Column, DateTime, ForeignKey, Integer, orm, String
from sqlalchemy.orm import Session

from bafser import SqlAlchemyBase, IdMixin, get_datetime_now
from data._tables import Tables


class Transaction(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.Transaction

    date = Column(DateTime, nullable=False)
    fromId = Column(Integer, ForeignKey("User.id"), nullable=False)
    toId = Column(Integer, ForeignKey("User.id"), nullable=False)
    value = Column(Integer, nullable=False)
    action = Column(String(16), nullable=False)
    itemId = Column(Integer, nullable=False)

    userFrom = orm.relationship("User", foreign_keys=[fromId])
    userTo = orm.relationship("User", foreign_keys=[toId])

    def __repr__(self):
        return f"<Transaction> [{self.id}] {self.action}"

    @staticmethod
    def new(db_sess: Session, userFromId: int, userToId: int, value: int, action: str, itemId: int = -1, commit=True):
        item = Transaction(
            date=get_datetime_now(),
            fromId=userFromId,
            toId=userToId,
            value=value,
            action=action,
            itemId=itemId,
        )
        db_sess.add(item)
        if commit:
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
    send = "sendMoney"
    gameJoin = "gameJoin"
    gameWin = "gameWin"
