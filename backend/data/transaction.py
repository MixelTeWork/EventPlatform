from datetime import datetime
from typing import TypedDict

from bafser import IdMixin, SqlAlchemyBase, get_datetime_now, get_db_session
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

from data import Tables, User


class Transaction(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.Transaction

    date: Mapped[datetime]
    fromId: Mapped[int] = mapped_column(ForeignKey(f"{Tables.User}.id"))
    toId: Mapped[int] = mapped_column(ForeignKey(f"{Tables.User}.id"))
    value: Mapped[int]
    action: Mapped[str] = mapped_column(String(16))
    itemId: Mapped[int]

    userFrom: Mapped[User] = relationship(foreign_keys=[fromId], init=False)
    userTo: Mapped[User] = relationship(foreign_keys=[toId], init=False)

    def __repr__(self):
        return f"<Transaction> [{self.id}] {self.action}"

    @staticmethod
    def new(userFromId: int, userToId: int, value: int, action: str, itemId: int = -1, *, commit: bool = True, db_sess: Session | None = None):
        item = Transaction(
            date=get_datetime_now(),
            fromId=userFromId,
            toId=userToId,
            value=value,
            action=action,
            itemId=itemId,
        )
        db_sess = db_sess if db_sess else get_db_session()
        db_sess.add(item)
        if commit:
            db_sess.commit()

        return item

    def get_dict(self) -> "TransactionDict":
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


class TransactionDict(TypedDict):
    id: int
    date: datetime
    fromId: int
    toId: int
    value: int
    action: str
    itemId: int
