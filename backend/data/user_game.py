from datetime import datetime, timedelta
from typing import Optional

from bafser import SqlAlchemyBase, get_datetime_now
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, Session, mapped_column

from data._tables import Tables


class UserGame(SqlAlchemyBase):
    __tablename__ = Tables.UserGame

    userId: Mapped[int] = mapped_column(ForeignKey(f"{Tables.User}.id"), primary_key=True)
    team: Mapped[int] = mapped_column(default=0)
    clicks: Mapped[int] = mapped_column(default=0)
    lastClick: Mapped[Optional[datetime]] = mapped_column(default=None)
    hackAlert: Mapped[int] = mapped_column(default=0)

    @staticmethod
    def get(db_sess: Session, userId: int):
        ug = db_sess.get(UserGame, userId)
        if ug is None:
            ug = UserGame(userId=userId, clicks=0, hackAlert=0, team=0)
            db_sess.add(ug)

        return ug

    def set_team(self, team: int):
        db_sess = Session.object_session(self)
        assert db_sess
        self.team = team
        db_sess.commit()

    def click(self, clicks: int):
        db_sess = Session.object_session(self)
        assert db_sess

        now = get_datetime_now().replace(tzinfo=None)
        now_hack = 0
        if self.lastClick is None:
            if clicks > 100:
                now_hack = 1
        else:
            td: timedelta = now - self.lastClick
            dt = td.seconds + td.microseconds / 1000000
            if clicks / dt > 16:
                now_hack = 2

        self.lastClick = now
        if self.hackAlert >= 10 or now_hack > 0:
            if now_hack >= 2:
                self.hackAlert += 1
            db_sess.commit()
            return False

        self.clicks += clicks
        db_sess.commit()
        return True
