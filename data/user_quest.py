from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin
from data.log import Actions, Log, Tables

from data.get_datetime_now import get_datetime_now
from .db_session import SqlAlchemyBase


class UserQuest(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "UserQuest"

    userId  = Column(Integer, ForeignKey("User.id"), primary_key=True)
    questId = Column(Integer, ForeignKey("Quest.id"), primary_key=True)
    date    = Column(DateTime, nullable=False)

    @staticmethod
    def new(db_sess: Session, actor, user, quest):
        now = get_datetime_now()
        userQuest = UserQuest(userId=user.id, questId=quest.id, date=now)
        db_sess.add(userQuest)

        log = Log(
            date=now,
            actionCode=Actions.added,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.UserQuest,
            recordId=-1,
            changes=userQuest.get_creation_changes()
        )
        db_sess.add(log)
        db_sess.commit()

        return userQuest

    def delete(self, actor):
        db_sess = Session.object_session(self)
        db_sess.delete(self)

        now = get_datetime_now()
        log = Log(
            date=now,
            actionCode=Actions.deleted,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.UserQuest,
            recordId=-1,
            changes=self.get_deletion_changes()
        )
        db_sess.add(log)
        db_sess.commit()

    def __repr__(self):
        return f"<UserQuest> user: {self.userId} quest: {self.questId}"

    def get_creation_changes(self):
        return [
            ("userId", None, self.userId),
            ("questId", None, self.questId),
        ]

    def get_deletion_changes(self):
        return [
            ("userId", self.userId, None),
            ("questId", self.questId, None),
        ]
