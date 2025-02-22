from __future__ import annotations

from sqlalchemy import Boolean, Column, DefaultClause, Integer, String
from sqlalchemy.orm import Session

from bfs import UserBase, Log
from utils import BigIdMixin


class User(UserBase, BigIdMixin):
    lastName   = Column(String(128), nullable=True)
    imageUrl   = Column(String(256), nullable=True)
    ticketType = Column(String(128), nullable=True)
    ticketTId  = Column(Integer, nullable=True)
    balance    = Column(Integer, nullable=False)
    group      = Column(Integer, DefaultClause("0"), nullable=False)
    gameOpened = Column(Boolean, DefaultClause("0"), nullable=False)

    @staticmethod
    def _new(db_sess: Session, user_kwargs: dict):
        user = User(**user_kwargs, balance=0)
        user.set_unique_big_id(db_sess)
        changes = [("balance", 0)]
        return user, changes

    def set_group(self, group: int):
        if group not in (0, 1, 2):
            group = 0
        if self.group == group:
            return group

        old_group = self.group
        self.group = group
        Log.updated(self, self, [("group", old_group, group)])

        return group

    def get_complited_quests(self):
        from data.quest import Quest
        from data.user_quest import UserQuest
        db_sess = Session.object_session(self)
        quests = db_sess\
            .query(Quest)\
            .join(UserQuest, UserQuest.questId == Quest.id)\
            .filter(UserQuest.userId == self.id, UserQuest.completeDate != None)\
            .all()

        return quests

    def get_complited_quest_ids(self):
        from data.user_quest import UserQuest
        db_sess = Session.object_session(self)
        quests = db_sess\
            .query(UserQuest)\
            .filter(UserQuest.userId == self.id, UserQuest.completeDate != None)\
            .values(UserQuest.questId)

        return list(map(lambda v: v[0], quests))

    def get_dict(self):
        return {
            "id": self.id_big,
            "name": self.name,
            "last_name": self.lastName,
            "photo": self.imageUrl,
            "balance": self.balance,
            "roles": self.get_roles(),
            "operations": self.get_operations(),
            "group": self.group,
            "gameOpened": self.gameOpened,
        }

    def get_dict_full(self):
        return {
            "id": self.id,
            "id_big": self.id_big,
            "login": self.login,
            "name": self.name,
            "last_name": self.lastName,
            "photo": self.imageUrl,
            "balance": self.balance,
            "roles": self.get_roles(),
            "deleted": self.deleted,
            "operations": self.get_operations(),
            "group": self.group,
            "gameOpened": self.gameOpened,
        }
