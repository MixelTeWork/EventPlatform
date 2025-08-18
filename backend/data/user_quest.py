from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Session, Mapped, mapped_column

from bafser import SqlAlchemyBase, Log, get_datetime_now
from data._tables import Tables
from data.user import User
from data.quest import Quest


class UserQuest(SqlAlchemyBase):
    __tablename__ = Tables.UserQuest

    userId: Mapped[int] = mapped_column(ForeignKey(f"{Tables.User}.id"), primary_key=True)
    questId: Mapped[int] = mapped_column(ForeignKey(f"{Tables.Quest}.id"), primary_key=True)
    openDate: Mapped[Optional[datetime]] = mapped_column(default=None)
    completeDate: Mapped[Optional[datetime]] = mapped_column(default=None)

    def __repr__(self):
        return f"<UserQuest> user: {self.userId} quest: {self.questId}"

    @staticmethod
    def open_quest(actor: User, user: User, quest: Quest) -> bool:
        """returns False if already opened"""
        uq = UserQuest._get_or_create(actor, user, quest)

        if uq.openDate != None:
            return False

        now = get_datetime_now()
        uq.openDate = now
        uq._log(actor, now, [("openDate", now.isoformat())])

        return True

    @staticmethod
    def complete_quest(actor: User, user: User, quest: Quest) -> bool:
        """returns False if already completed"""
        uq = UserQuest._get_or_create(actor, user, quest)

        if uq.completeDate != None:
            return False

        now = get_datetime_now()
        uq.completeDate = now
        uq._log(actor, now, [("completeDate", now.isoformat())])

        return True

    @staticmethod
    def _get_or_create(actor: User, user: User, quest: Quest):
        db_sess = Session.object_session(actor)
        assert db_sess
        uq = db_sess.query(UserQuest).filter(UserQuest.userId == user.id, UserQuest.questId == quest.id).first()

        if uq is None:
            uq = UserQuest(userId=user.id, questId=quest.id)
            db_sess.add(uq)

        return uq

    def _log(self, actor: User, now: datetime, changes):
        if Session.object_session(self) is None:
            Log.added(self, actor, [
                ("userId", self.userId),
                ("questId", self.questId),
                *changes,
            ], now=now)
        else:
            Log.updated(self, actor, [(v if len(v) == 3 else (v[0], None, v[1])) for v in changes], now=now)
