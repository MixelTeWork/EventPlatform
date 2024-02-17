from sqlalchemy import Column, ForeignKey, Integer, String, orm
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin
from .db_session import SqlAlchemyBase


class UserRace(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "UserRace"

    userId = Column(Integer, ForeignKey("User.id"), primary_key=True)
    team   = Column(String(8), nullable=False)

    def __repr__(self):
        return f"<UserRace> user: {self.userId} team: {self.team}"

    @staticmethod
    def new(db_sess: Session, user, team):
        userQuest = UserRace(userId=user.id, team=team)
        db_sess.add(userQuest)
        db_sess.commit()

        return userQuest
