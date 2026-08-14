from datetime import datetime, timedelta
from logging import Logger
from typing import Optional

from bafser import SqlAlchemyBase, add_logger, create_log_handler, get_datetime_now, get_db_session
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, Session, mapped_column

import bafser_config
from data import Tables

logger_click: Logger | None = None


class UserGame(SqlAlchemyBase):
    __tablename__ = Tables.UserGame

    userId: Mapped[int] = mapped_column(ForeignKey(f"{Tables.User}.id"), primary_key=True)
    team: Mapped[int] = mapped_column(default=0)
    clicks: Mapped[int] = mapped_column(default=0)
    lastClick: Mapped[Optional[datetime]] = mapped_column(default=None)
    hackAlert: Mapped[int] = mapped_column(default=0)

    @staticmethod
    def get(userId: int, *, db_sess: Session | None = None):
        db_sess = db_sess or get_db_session()
        ug = db_sess.get(UserGame, userId)
        if ug is None:
            ug = UserGame(userId=userId, clicks=0, hackAlert=0, team=0)
            db_sess.add(ug)

        return ug

    def set_team(self, team: int):
        self.team = team
        self.db_sess.commit()

    def click(self, clicks: int):
        global logger_click
        if not logger_click:
            logger_click = add_logger(
                "clicks",
                create_log_handler(
                    bafser_config.log_clicks_path,
                    "%(uid)-6s;%(asctime)s;%(message)s",
                ),
            )
        now = get_datetime_now().replace(tzinfo=None)
        now_hack = 0
        if self.lastClick is None:
            logger_click.info(f"{clicks};;")
            if clicks > 100:
                now_hack = 1
        else:
            td: timedelta = now - self.lastClick
            dt = td.seconds + td.microseconds / 1000000
            logger_click.info(f"{clicks};{dt};{clicks / dt}")
            if clicks / dt > 40:  # 16 for single finger
                now_hack = 2

        self.lastClick = now
        if self.hackAlert >= 10 or now_hack > 0:
            if now_hack >= 2:
                self.hackAlert += 1
            self.db_sess.commit()
            return False

        self.clicks += clicks
        self.db_sess.commit()
        return True
