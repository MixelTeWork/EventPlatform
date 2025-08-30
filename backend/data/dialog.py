from bafser import Log, ObjMixin, SqlAlchemyBase
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, Session, mapped_column

from data._tables import Tables
from data.user import User


class Dialog(SqlAlchemyBase, ObjMixin):
    __tablename__ = Tables.Dialog

    data: Mapped[object] = mapped_column(JSON)

    @staticmethod
    def new(creator: User, data: object, id: int | None = None, db_sess: Session | None = None):
        db_sess = db_sess if db_sess else Session.object_session(creator)
        assert db_sess
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
