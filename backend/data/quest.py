from typing import Literal, Optional

from sqlalchemy import ForeignKey, String, literal
from sqlalchemy.orm import Session, Mapped, mapped_column, relationship

from bafser import SqlAlchemyBase, Log, ObjMixin
from data._tables import Tables
from data.dialog import Dialog
from data.user import User
from utils import BigIdMixin


class Quest(SqlAlchemyBase, ObjMixin, BigIdMixin):
    __tablename__ = Tables.Quest

    name: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(String(512))
    reward: Mapped[int]
    hidden: Mapped[bool]
    dialog1Id: Mapped[Optional[int]] = mapped_column(ForeignKey(f"{Tables.Dialog}.id"), default=None)
    dialog2Id: Mapped[Optional[int]] = mapped_column(ForeignKey(f"{Tables.Dialog}.id"), default=None)

    dialog1: Mapped["Dialog"] = relationship(foreign_keys=[dialog1Id], init=False)
    dialog2: Mapped["Dialog"] = relationship(foreign_keys=[dialog2Id], init=False)

    @staticmethod
    def new(creator: User, name: str, description: str, reward: int, hidden: bool):
        db_sess = Session.object_session(creator)
        assert db_sess
        quest = Quest(name=name, description=description, reward=reward, hidden=hidden)
        quest.set_unique_big_id(db_sess)

        db_sess.add(quest)
        Log.added(quest, creator, quest.get_creation_changes())

        return quest

    def get_creation_changes(self):
        return [
            ("name", self.name),
            ("reward", self.reward),
            ("hidden", self.hidden),
        ]

    @staticmethod
    def all(db_sess: Session, includeHidden=False, includeDeleted=False):  # pyright: ignore[reportIncompatibleMethodOverride]
        quests = Quest.query(db_sess, includeDeleted)
        if not includeHidden:
            quests = quests.filter(Quest.hidden == False)
        return quests.all()

    @staticmethod
    def all_for_user(db_sess: Session, user: User | None):
        from data.user_quest import UserQuest
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

        all_quests = Quest.query(db_sess)\
            .with_entities(Quest.id, Quest.name, Quest.description, Quest.reward, Quest.hidden, dialogColumn if dialogColumn else literal(None))

        quests = []
        for v in list(all_quests):
            v = v.tuple()
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

    def update(self, actor: User, name: str | None, description: str | None, reward: int | None,
               hidden: bool | None, dialog1: object | None, dialog2: object | None):
        changes = []

        def updateField(field: str, value):
            cur = getattr(self, field)
            if value is not None and cur != value:
                changes.append((field, cur, value))
                setattr(self, field, value)

        updateField("name", name)
        updateField("description", description)
        updateField("reward", reward)
        updateField("hidden", hidden)

        def updateDialog(field: str, value, changes: list):
            cur: Dialog | None = getattr(self, field)
            if value is None:
                return
            if "__delete__" in value:
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

        Log.updated(self, actor, changes)

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
