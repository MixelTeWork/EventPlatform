from sqlalchemy import Boolean, Column, DefaultClause, Integer, String
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.log import Actions, Log, Tables
from data.user import User
from utils import get_datetime_now
from .db_session import SqlAlchemyBase


class Quest(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "Quest"

    id      = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    deleted = Column(Boolean, DefaultClause("0"), nullable=False)
    name    = Column(String(128), nullable=False)
    reward  = Column(Integer, nullable=False)

    def __repr__(self):
        return f"<Quest> [{self.id}] {self.name}"

    @staticmethod
    def new(db_sess: Session, actor: User, name: str, reward: int):
        quest = Quest(name=name, reward=reward)
        db_sess.add(quest)

        now = get_datetime_now()
        log = Log(
            date=now,
            actionCode=Actions.added,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.Quest,
            recordId=-1,
            changes=quest.get_creation_changes()
        )
        db_sess.add(log)
        db_sess.commit()

        log.recordId = quest.id
        db_sess.commit()

        return quest

    @staticmethod
    def get(db_sess: Session, id: int, includeDeleted=False):
        item = db_sess.get(Quest, id)
        if item is None or (not includeDeleted and item.deleted):
            return None
        return item

    @staticmethod
    def all(db_sess: Session, includeDeleted=False):
        items = db_sess.query(Quest)
        if not includeDeleted:
            items = items.filter(Quest.deleted == False)
        return items.all()

    def delete(self, db_sess: Session, actor: User):
        self.deleted = True

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.deleted,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.Quest,
            recordId=self.id,
            changes=[]
        ))
        db_sess.commit()

    def get_creation_changes(self):
        return [
            ("name", None, self.name),
            ("reward", None, self.reward),
        ]

    def get_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "reward": self.reward,
        }
