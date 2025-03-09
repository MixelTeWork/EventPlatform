from datetime import timedelta
from sqlalchemy import Column, DateTime, DefaultClause, ForeignKey, Integer
from sqlalchemy.orm import Session

from bfs import SqlAlchemyBase, get_datetime_now
from data._tables import Tables
from data.user import User


class UserGame(SqlAlchemyBase):
    __tablename__ = Tables.UserGame

    userId = Column(Integer, ForeignKey("User.id"), primary_key=True)
    team = Column(Integer, DefaultClause("0"), nullable=False)
    clicks = Column(Integer, nullable=False)
    lastClick = Column(DateTime, nullable=True)
    hackAlert = Column(Integer, DefaultClause("0"), nullable=False)

    def __repr__(self):
        return f"<UserGame> user: {self.userId}"

    @staticmethod
    def get(user: User):
        db_sess = Session.object_session(user)
        ug = db_sess.get(UserGame, user.id)
        if ug is None:
            ug = UserGame(userId=user.id, clicks=0, hackAlert=0)
            db_sess.add(ug)

        return ug

    @staticmethod
    def get_team(user: User):
        db_sess = Session.object_session(user)
        r = db_sess.query(UserGame.team).where(UserGame.userId == user.id).first()
        if r:
            return r[0]
        return 0

    @staticmethod
    def set_team(user: User, team: int):
        db_sess = Session.object_session(user)
        ug = UserGame.get(user)
        ug.team = team
        db_sess.commit()

    @staticmethod
    def click(user: User, clicks: int):
        db_sess = Session.object_session(user)
        ug = UserGame.get(user)

        now = get_datetime_now().replace(tzinfo=None)
        hackAlert = int(ug.hackAlert)
        if ug.lastClick is None:
            if clicks > 100:
                hackAlert |= 1
        else:
            td: timedelta = now - ug.lastClick
            dt = td.seconds + td.microseconds / 1000000
            if clicks / dt > 16:
                hackAlert |= 2

        ug.lastClick = now
        if hackAlert != 0:
            ug.hackAlert = hackAlert
            db_sess.commit()
            return False

        ug.clicks += clicks
        db_sess.commit()
        return True
