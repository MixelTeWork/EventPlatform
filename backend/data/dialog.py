from typing import TypedDict

from bafser import Log, ObjMixin, SqlAlchemyBase, UserBase
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, Session, mapped_column

from data import Tables, User


class Dialog(SqlAlchemyBase, ObjMixin):
    __tablename__ = Tables.Dialog

    data: Mapped[object] = mapped_column(JSON)

    @staticmethod
    def new(data: object, *, id: int | None = None, db_sess: Session | None = None, creator: UserBase | None = None):
        dialog = Dialog(data=data)
        if id is not None:
            dialog.id = id

        Log.added(dialog, creator, db_sess=db_sess)

        return dialog

    def update(self, data: object, *, actor: User | None = None):
        self.data = data
        Log.updated(self, actor)

    def get_dict(self) -> "DialogDict":
        return {
            "id": self.id,
            "data": self.data,
        }


class DialogDict(TypedDict):
    id: int
    data: object
