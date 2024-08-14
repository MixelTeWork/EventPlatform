from sqlalchemy import Column, DateTime, DefaultClause, ForeignKey, Integer
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.get_datetime_now import get_datetime_now
from .db_session import SqlAlchemyBase


class UserGame(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "UserGame"

    userId = Column(Integer, ForeignKey("User.id"), primary_key=True)
    clicks = Column(Integer, nullable=False)
    lastClick = Column(DateTime, nullable=True)
    hackAlert = Column(Integer, DefaultClause("0"), nullable=False)

    def __repr__(self):
        return f"<UserGame> user: {self.userId}"

    @staticmethod
    def get(user):
        db_sess = Session.object_session(user)
        userGame = db_sess.get(UserGame, user.id)
        if userGame is None:
            userGame = UserGame(userId=user.id, clicks=0)
            db_sess.add(userGame)

        return userGame

    @staticmethod
    def click(user, clicks: int):
        db_sess = Session.object_session(user)
        userGame = UserGame.get(user)

        now = get_datetime_now().replace(tzinfo=None)
        hackAlert = 0
        if userGame.lastClick is None:
            if clicks > 100:
                hackAlert = 1
        else:
            dt = now - userGame.lastClick
            dt = dt.seconds + dt.microseconds / 1000000
            if clicks / dt > 16:
                hackAlert = 2

        userGame.lastClick = now
        if hackAlert != 0:
            userGame.hackAlert = hackAlert
            db_sess.commit()
            return False

        userGame.clicks += clicks
        db_sess.commit()
        return True
