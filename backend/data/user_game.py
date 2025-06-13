from datetime import timedelta
from sqlalchemy import Column, DateTime, DefaultClause, ForeignKey, Integer
from sqlalchemy.orm import Session

from bafser import SqlAlchemyBase, get_datetime_now
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
    def get(db_sess: Session, userId: int):
        ug = db_sess.get(UserGame, userId)
        if ug is None:
            ug = UserGame(userId=userId, clicks=0, hackAlert=0, team=0)
            db_sess.add(ug)

        return ug

    def set_team(ug, team: int):
        db_sess = Session.object_session(ug)
        ug.team = team
        db_sess.commit()

    def click(ug, clicks: int):
        db_sess = Session.object_session(ug)

        now = get_datetime_now().replace(tzinfo=None)
        now_hack = 0
        if ug.lastClick is None:
            if clicks > 100:
                now_hack = 1
        else:
            td: timedelta = now - ug.lastClick
            dt = td.seconds + td.microseconds / 1000000
            if clicks / dt > 16:
                now_hack = 2

        ug.lastClick = now
        if ug.hackAlert >= 10 or now_hack > 0:
            if now_hack >= 2:
                ug.hackAlert += 1
            db_sess.commit()
            return False

        ug.clicks += clicks
        db_sess.commit()
        return True
