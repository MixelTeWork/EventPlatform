from sqlalchemy import Boolean, Column, DefaultClause, Integer, JSON
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.log import Actions, Log, Tables
from data.get_datetime_now import get_datetime_now
from .db_session import SqlAlchemyBase


class Dialog(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "Dialog"

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    deleted = Column(Boolean, DefaultClause("0"), nullable=False)
    data = Column(JSON, nullable=False)

    def __repr__(self):
        return f"<Dialog> [{self.id}]"

    @staticmethod
    def new(db_sess: Session, actor, data: object, id: int = None):
        dialog = Dialog(data=data)
        if id is not None:
            dialog.id = id
        db_sess.add(dialog)

        now = get_datetime_now()
        log = Log(
            date=now,
            actionCode=Actions.added,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.Dialog,
            recordId=-1,
            changes=dialog.get_creation_changes()
        )
        db_sess.add(log)
        db_sess.commit()

        log.recordId = dialog.id
        db_sess.commit()

        return dialog

    @staticmethod
    def get(db_sess: Session, id: int, includeDeleted=False):
        dialog = db_sess.get(Dialog, id)
        if dialog is None or (not includeDeleted and dialog.deleted):
            return None
        return dialog

    @staticmethod
    def all(db_sess: Session, includeDeleted=False):
        dialogs = db_sess.query(Dialog)
        if not includeDeleted:
            dialogs = dialogs.filter(Dialog.deleted == False)
        return dialogs.all()

    def update(self, actor, data: object):
        db_sess = Session.object_session(self)
        changes = [
            ("data", self.data, data),
        ]
        self.data = data

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.updated,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.Dialog,
            recordId=self.id,
            changes=changes
        ))
        db_sess.commit()

    def delete(self, actor):
        db_sess = Session.object_session(self)
        self.deleted = True

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.deleted,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.Dialog,
            recordId=self.id,
            changes=[]
        ))
        db_sess.commit()

    def get_creation_changes(self):
        return [
            ("data", None, self.data),
        ]

    def get_dict(self):
        return {
            "id": self.id,
            "data": self.data,
        }
