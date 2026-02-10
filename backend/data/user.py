from typing import Any, Optional, TypedDict, override

from bafser import BigIdMixin, Log, RoleDict, UserBase, UserKwargs
from sqlalchemy import String
from sqlalchemy.orm import Mapped, Session, mapped_column


class User(UserBase, BigIdMixin):
    lastName: Mapped[Optional[str]] = mapped_column(String(128), default=None)
    imageUrl: Mapped[Optional[str]] = mapped_column(String(256), default=None)
    ticketType: Mapped[Optional[str]] = mapped_column(String(128), default=None)
    ticketTId: Mapped[Optional[int]] = mapped_column(default=None)
    balance: Mapped[int] = mapped_column(server_default="0", default=0)
    group: Mapped[int] = mapped_column(server_default="0", default=0)
    gameOpened: Mapped[bool] = mapped_column(server_default="0", default=False)

    @classmethod
    @override
    def _new(cls, db_sess: Session, user_kwargs: UserKwargs, *, balance: int = 0, **kwargs: Any):
        user = User(**user_kwargs, balance=balance)
        user.set_unique_big_id(db_sess=db_sess)
        return user

    def set_group(self, group: int):
        if group not in (0, 1, 2):
            group = 0
        if self.group == group:
            return group

        self.group = group
        Log.updated(self, self)
        return group

    def get_complited_quests(self):
        from data.quest import Quest
        from data.user_quest import UserQuest

        return (
            Quest.query(self.db_sess)
            .join(UserQuest, UserQuest.questId == Quest.id)
            .filter(UserQuest.userId == self.id, UserQuest.completeDate != None)
            .all()
        )

    def get_complited_quest_ids(self) -> list[int]:
        from data.user_quest import UserQuest

        return [
            v[0]
            for v in self.db_sess.query(UserQuest)
            .filter(UserQuest.userId == self.id, UserQuest.completeDate != None)
            .with_entities(UserQuest.questId)
        ]

    def get_dict(self) -> "UserDict":  # pyright: ignore[reportIncompatibleMethodOverride]
        return {
            "id": self.id_big,
            "name": self.name,
            "last_name": self.lastName,
            "photo": self.imageUrl,
            "balance": self.balance,
            "roles": self.get_roles_names(),
            "operations": self.get_operations(),
            "group": self.group,
            "gameOpened": self.gameOpened,
            "ticketTId": self.ticketTId,
        }

    def get_dict_full(self) -> "UserFullDict":  # pyright: ignore[reportIncompatibleMethodOverride]
        return {
            "id": self.id,
            "id_big": self.id_big,
            "login": self.login,
            "name": self.name,
            "last_name": self.lastName,
            "photo": self.imageUrl,
            "balance": self.balance,
            "roles": [{"id": v[0], "name": v[1]} for v in self.get_roles()],
            "deleted": self.deleted,
            "operations": self.get_operations(),
            "group": self.group,
            "gameOpened": self.gameOpened,
            "ticketTId": self.ticketTId,
        }


class UserDict(TypedDict):
    id: str
    name: str
    last_name: str | None
    photo: str | None
    balance: int
    roles: list[str]
    operations: list[str]
    group: int
    gameOpened: bool
    ticketTId: int | None


class UserFullDict(TypedDict):
    id: int
    id_big: str
    login: str
    name: str
    last_name: str | None
    photo: str | None
    balance: int
    roles: list[RoleDict]
    deleted: bool
    operations: list[str]
    group: int
    gameOpened: bool
    ticketTId: int | None
