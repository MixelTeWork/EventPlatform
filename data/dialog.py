from sqlalchemy import Column, JSON
from sqlalchemy.orm import Session

from bfs import SqlAlchemyBase, Log, ObjMixin
from data._tables import Tables
from data.user import User


class Dialog(SqlAlchemyBase, ObjMixin):
    __tablename__ = Tables.Dialog

    data = Column(JSON, nullable=False)

    def __repr__(self):
        return f"<Dialog> [{self.id}]"

    @staticmethod
    def new(creator: User, data: object, id: int = None, db_sess: Session = None):
        db_sess = db_sess if db_sess else Session.object_session(creator)
        dialog = Dialog(data=data)
        if id is not None:
            dialog.id = id
        db_sess.add(dialog)

        Log.added(dialog, creator, [("data", dialog.data)], db_sess=db_sess)

        return dialog

    def update(self, actor: User, data: object):
        changes = [("data", self.data, data)]
        self.data = data
        Log.updated(self, actor, changes)

    def get_dict(self):
        return {
            "id": self.id,
            "data": self.data,
        }
