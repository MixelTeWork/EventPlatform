from typing import Literal, Union
from sqlalchemy import Boolean, Column, DefaultClause, orm, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.dialog import Dialog
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
    dialog1Id = Column(Integer, ForeignKey("Dialog.id"), nullable=True)
    dialog2Id = Column(Integer, ForeignKey("Dialog.id"), nullable=True)

    dialog1 = orm.relationship("Dialog", foreign_keys="Quest.dialog1Id")
    dialog2 = orm.relationship("Dialog", foreign_keys="Quest.dialog2Id")

    def __repr__(self):
        return f"<Quest> [{self.id}] {self.name}"

    @staticmethod
    def new(creator, name: str, description: str, reward: int, hidden: bool):
        db_sess = Session.object_session(creator)
        quest = Quest(name=name, description=description, reward=reward, hidden=hidden)

        q = quest
        while q is not None:
            id_big = randstr(8)
            q = db_sess.query(Quest).filter(Quest.id_big == id_big).first()
        quest.id_big = id_big

        db_sess.add(quest)

        now = get_datetime_now()
        log = Log(
            date=now,
            actionCode=Actions.added,
            userId=creator.id,
            userName=creator.name,
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
    def all_for_user(db_sess: Session, user):
        if user:
            userQuests = db_sess.query(UserQuest).filter(UserQuest.userId == user.id)
            opened_quests = []
            completed_quests = []
            for userQuest in userQuests:
                if userQuest.openDate != None:
                    opened_quests.append(userQuest.questId)
                if userQuest.completeDate != None:
                    completed_quests.append(userQuest.questId)
            dialogColumn = None
            if user.group == 1:
                dialogColumn = Quest.dialog1Id
            elif user.group == 2:
                dialogColumn = Quest.dialog2Id
        else:
            opened_quests = []
            completed_quests = []
            dialogColumn = None

        all_quests = db_sess\
            .query(Quest)\
            .values(Quest.id, Quest.name, Quest.description, Quest.reward, Quest.hidden, dialogColumn)

        quests = []
        for v in list(all_quests):
            id = v[0]
            name = v[1]
            description = v[2]
            reward = v[3]
            hidden = v[4]
            dialog = v[5]

            opened = False
            if id in opened_quests:
                opened = True

            completed = False
            if id in completed_quests:
                completed = True

            if not hidden or completed:
                quests.append({
                    "id": id,
                    "name": name,
                    "description": description,
                    "reward": reward,
                    "completed": completed,
                    "dialogId": dialog,
                    "opened": opened,
                })

        return quests

    def update(self, actor, name: Union[str, None], description: Union[str, None], reward: Union[int, None],
               hidden: Union[bool, None], dialog1: Union[object, Literal[False], None], dialog2: Union[object, Literal[False], None]):
        db_sess = Session.object_session(self)
        changes = []

        def updateField(field: str, value, changes: list):
            cur = getattr(self, field)
            if value is not None and cur != value:
                changes.append((field, cur, value))
                setattr(self, field, value)

        updateField("name", name, changes)
        updateField("description", description, changes)
        updateField("reward", reward, changes)
        updateField("hidden", hidden, changes)

        def updateDialog(field: str, value, changes: list):
            cur: Union[Dialog, None] = getattr(self, field)
            if value is None:
                return
            if value is False:
                if cur is not None:
                    changes.append((field, cur.id, None))
                    cur.delete(actor)
                    setattr(self, field, None)
                return
            if cur is None:
                dialog = Dialog.new(actor, value)
                changes.append((field, None, dialog.id))
                setattr(self, field, dialog)
            else:
                cur.update(actor, value)

        updateDialog("dialog1", dialog1, changes)
        updateDialog("dialog2", dialog2, changes)

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.updated,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.Quest,
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
            "dialog1Id": self.dialog1Id,
            "dialog2Id": self.dialog2Id,
        }
