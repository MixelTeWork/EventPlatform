from datetime import datetime
from typing import Optional

from bafser import Log, SqlAlchemyBase, get_datetime_now, get_db_session
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from data._tables import Tables
from data.quest import Quest
from data.user import User


class UserQuest(SqlAlchemyBase):
    __tablename__ = Tables.UserQuest

    userId: Mapped[int] = mapped_column(ForeignKey(f"{Tables.User}.id"), primary_key=True)
    questId: Mapped[int] = mapped_column(ForeignKey(f"{Tables.Quest}.id"), primary_key=True)
    openDate: Mapped[Optional[datetime]] = mapped_column(default=None)
    completeDate: Mapped[Optional[datetime]] = mapped_column(default=None)

    def __repr__(self):
        return f"<UserQuest> user: {self.userId} quest: {self.questId}"

    @staticmethod
    def open_quest(user: User, quest: Quest, *, actor: User | None = None) -> bool:
        """returns False if already opened"""
        uq = UserQuest._get_or_create(actor, user, quest)

        if uq.openDate != None:
            return False

        now = get_datetime_now()
        uq.openDate = now
        uq._log(actor, now)

        return True

    @staticmethod
    def complete_quest(user: User, quest: Quest, *, actor: User | None = None) -> bool:
        """returns False if already completed"""
        uq = UserQuest._get_or_create(actor, user, quest)

        if uq.completeDate != None:
            return False

        now = get_datetime_now()
        uq.completeDate = now
        uq._log(actor, now)

        return True

    @staticmethod
    def _get_or_create(actor: User | None, user: User, quest: Quest):
        db_sess = actor.db_sess if actor else get_db_session()
        uq = db_sess.query(UserQuest).filter(UserQuest.userId == user.id, UserQuest.questId == quest.id).first()

        if uq is None:
            uq = UserQuest(userId=user.id, questId=quest.id)
            db_sess.add(uq)

        return uq

    def _log(self, actor: User | None, now: datetime):
        if self.get_session() is None:
            Log.added(self, actor, now=now)
        else:
            Log.updated(self, actor, now=now)
