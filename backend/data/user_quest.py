from typing import Any, Callable
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin
from data.log import Actions, Log, Tables

from data.get_datetime_now import get_datetime_now
from .db_session import SqlAlchemyBase


class UserQuest(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "UserQuest"

    userId = Column(Integer, ForeignKey("User.id"), primary_key=True)
    questId = Column(Integer, ForeignKey("Quest.id"), primary_key=True)
    openDate = Column(DateTime, nullable=True)
    completeDate = Column(DateTime, nullable=True)

    @staticmethod
    def get_or_create(creator, user, quest, fn: Callable[["UserQuest", DateTime], tuple[list, Any]]):
        db_sess = Session.object_session(creator)
        userQuest = db_sess.query(UserQuest).filter(UserQuest.userId == user.id, UserQuest.questId == quest.id).first()
        now = get_datetime_now()

        new = False
        if userQuest is None:
            userQuest = UserQuest(userId=user.id, questId=quest.id)
            db_sess.add(userQuest)
            new = True

        changes, r = fn(userQuest, now)

        db_sess.add(Log(
            date=now,
            actionCode=Actions.added if new else Actions.updated,
            userId=creator.id,
            userName=creator.name,
            tableName=Tables.UserQuest,
            recordId=-1,
            changes=[
                *([("userId", None, userQuest.userId),
                   ("questId", None, userQuest.questId)] if new else []),
                *changes,
            ]
        ))
        db_sess.commit()

        return r

    @staticmethod
    def open_quest(actor, user, quest) -> bool:
        """returns False if already opened"""
        def fn(userQuest: UserQuest, now: DateTime):
            r = False
            if userQuest.openDate == None:
                userQuest.openDate = now
                r = True
            return ("openDate", None, userQuest.openDate.isoformat()), r

        return UserQuest.get_or_create(actor, user, quest, fn)

    @staticmethod
    def complete_quest(actor, user, quest) -> bool:
        """returns False if already completed"""
        def fn(userQuest: UserQuest, now: DateTime):
            r = False
            if userQuest.completeDate == None:
                userQuest.completeDate = now
                r = True
            return ("completeDate", None, userQuest.completeDate.isoformat()), r

        return UserQuest.get_or_create(actor, user, quest, fn)

    def delete(self, actor):
        db_sess = Session.object_session(self)
        db_sess.delete(self)

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.deleted,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.UserQuest,
            recordId=-1,
            changes=[
                ("userId", self.userId, None),
                ("questId", self.questId, None),
                ("openDate", self.openDate, None),
                ("completeDate", self.completeDate, None),
            ]
        ))
        db_sess.commit()

    def __repr__(self):
        return f"<UserQuest> user: {self.userId} quest: {self.questId}"
