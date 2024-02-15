from typing import Union
from sqlalchemy import Boolean, Column, DefaultClause, Integer, String
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.log import Actions, Log, Tables
from data.get_datetime_now import get_datetime_now
from data.randstr import randstr
from data.user_quest import UserQuest
from .db_session import SqlAlchemyBase


class Quest(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "Quest"

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    id_big = Column(String(8), unique=True, nullable=False)
    deleted = Column(Boolean, DefaultClause("0"), nullable=False)
    name = Column(String(128), nullable=False)
    description = Column(String(256), nullable=False)
    reward = Column(Integer, nullable=False)
    hidden = Column(Boolean, nullable=False)

    def __repr__(self):
        return f"<Quest> [{self.id}] {self.name}"

    @staticmethod
    def new(db_sess: Session, actor, name: str, description: str, reward: int, hidden: bool):
        quest = Quest(name=name, description=description, reward=reward, hidden=hidden)
        db_sess.add(quest)

        q = quest
        while q is not None:
            id_big = randstr(8)
            q = db_sess.query(Quest).filter(Quest.id_big == id_big).first()
        quest.id_big = id_big

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
        quest = db_sess.get(Quest, id)
        if quest is None or (not includeDeleted and quest.deleted):
            return None
        return quest

    @staticmethod
    def get_by_big_id(db_sess: Session, big_id: int):
        quest = db_sess.query(Quest).filter(Quest.deleted == False, Quest.id_big == big_id).first()
        return quest

    @staticmethod
    def all(db_sess: Session, includeHidden=False, includeDeleted=False):
        quests = db_sess.query(Quest)
        if not includeDeleted:
            quests = quests.filter(Quest.deleted == False)
        if not includeHidden:
            quests = quests.filter(Quest.hidden == False)
        return quests.all()

    @staticmethod
    def all_for_user(user):
        db_sess = Session.object_session(user)
        quests = db_sess\
            .query(Quest)\
            .join(UserQuest, UserQuest.questId == Quest.id, isouter=True)\
            .filter((UserQuest.userId == user.id) | (UserQuest.userId == None))\
            .values(Quest.id, Quest.name, Quest.reward, UserQuest.userId)
        return list(map(lambda v: {
            "id": v[0],
            "name": v[1],
            "reward": v[2],
            "completed": v[3] is not None,
        }, quests))

    def update(self, actor, name: Union[str, None], description: Union[str, None], reward: Union[int, None], hidden: Union[bool, None]):
        db_sess = Session.object_session(self)
        changes = []

        def updateField(field: str, value, changes: list):
            cur = getattr(self, field)
            if value is not None and cur != value:
                changes.append(("name", cur, value))
                setattr(self, field, value)

        updateField("name", name, changes)
        updateField("description", description, changes)
        updateField("reward", reward, changes)
        updateField("hidden", hidden, changes)

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.updated,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.StoreItem,
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
            tableName=Tables.Quest,
            recordId=self.id,
            changes=[]
        ))
        db_sess.commit()

    def get_creation_changes(self):
        return [
            ("name", None, self.name),
            ("reward", None, self.reward),
            ("hidden", None, self.hidden),
        ]

    def get_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "reward": self.reward,
        }

    def get_dict_full(self):
        return {
            "id": self.id,
            "id_big": self.id_big,
            "name": self.name,
            "description": self.description,
            "reward": self.reward,
            "hidden": self.hidden,
        }
