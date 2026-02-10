from typing import Any, Optional, TypedDict

from bafser import BigIdMixin, Log, ObjMixin, SqlAlchemyBase, get_db_session
from sqlalchemy import ForeignKey, String, literal
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

from data import Tables, User
from data.dialog import Dialog


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
    def new(name: str, description: str, reward: int, hidden: bool, *, creator: User | None = None):
        quest = Quest(name=name, description=description, reward=reward, hidden=hidden)
        quest.set_unique_big_id(db_sess=creator.db_sess if creator else get_db_session())

        Log.added(quest, creator)

        return quest

    @staticmethod
    def all(*, db_sess: Session | None = None, includeHidden: bool = False, includeDeleted: bool = False):  # pyright: ignore[reportIncompatibleMethodOverride]
        db_sess = db_sess if db_sess else get_db_session()
        quests = Quest.query(db_sess, includeDeleted)
        if not includeHidden:
            quests = quests.filter(Quest.hidden == False)
        return quests.all()

    @staticmethod
    def all_for_user(user: User | None, *, db_sess: Session | None = None):
        from data.user_quest import UserQuest

        db_sess = db_sess if db_sess else get_db_session()

        if user:
            userQuests = db_sess.query(UserQuest).filter(UserQuest.userId == user.id)
            opened_quests: list[int] = []
            completed_quests: list[int] = []
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

        all_quests = Quest.query(db_sess).with_entities(
            Quest.id, Quest.name, Quest.description, Quest.reward, Quest.hidden, dialogColumn if dialogColumn else literal(None)
        )

        quests: list[QuestUserDict] = []
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
                quests.append(
                    {
                        "id": id,
                        "name": name,
                        "description": description,
                        "reward": reward,
                        "completed": completed,
                        "dialogId": dialog,
                        "opened": opened,
                    }
                )

        return quests

    def update(
        self,
        name: str | None,
        description: str | None,
        reward: int | None,
        hidden: bool | None,
        dialog1: dict[str, Any] | None,
        dialog2: dict[str, Any] | None,
        *,
        actor: User | None = None,
    ):
        if name is not None:
            self.name = name
        if description is not None:
            self.description = description
        if reward is not None:
            self.reward = reward
        if hidden is not None:
            self.hidden = hidden

        def updateDialog(field: str, value: dict[str, Any] | None):
            cur: Dialog | None = getattr(self, field)
            if value is None:
                return
            if "__delete__" in value:
                if cur is not None:
                    cur.delete2(actor=actor)
                    setattr(self, field, None)
                return
            if cur is None:
                dialog = Dialog.new(value)
                setattr(self, field, dialog)
            else:
                cur.update(value, actor=actor)

        updateDialog("dialog1", dialog1)
        updateDialog("dialog2", dialog2)

        Log.updated(self, actor)

    def get_dict(self) -> "QuestDict":
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "reward": self.reward,
        }

    def get_dict_full(self) -> "QuestFullDict":
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


class QuestDict(TypedDict):
    id: int
    name: str
    description: str
    reward: int


class QuestFullDict(TypedDict):
    id: int
    id_big: str
    name: str
    description: str
    reward: int
    hidden: bool
    dialog1Id: int | None
    dialog2Id: int | None


class QuestUserDict(TypedDict):
    id: int
    name: str
    description: str
    reward: int
    completed: bool
    dialogId: int | None
    opened: bool
