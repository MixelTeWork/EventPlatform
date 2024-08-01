from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin
from .db_session import SqlAlchemyBase


class UserGame(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "UserGame"

    userId = Column(Integer, ForeignKey("User.id"), primary_key=True)
    team   = Column(String(8), nullable=False)

    def __repr__(self):
        return f"<UserGame> user: {self.userId} team: {self.team}"

    @staticmethod
    def new(user, team):
        db_sess = Session.object_session(user)
        userGame = UserGame(userId=user.id, team=team)
        db_sess.add(userGame)
        db_sess.commit()

        return userGame
