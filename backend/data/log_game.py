from datetime import datetime
from typing import Optional
from sqlalchemy import String
from sqlalchemy.orm import Session, Mapped, mapped_column

from bafser import SqlAlchemyBase, IdMixin
from data._tables import Tables
from data.game import Game
from data.log_user_game import UserGameLog
from data.user_game import UserGame


class GameLog(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.GameLog

    startStr: Mapped[str] = mapped_column(String(8))
    duration: Mapped[int]
    countdown: Mapped[int]
    opponent1Id: Mapped[Optional[int]]
    opponent2Id: Mapped[Optional[int]]
    startTime: Mapped[Optional[datetime]]
    clicks1: Mapped[int]
    clicks2: Mapped[int]
    winner: Mapped[int]

    @staticmethod
    def create(db_sess: Session):
        game = Game.get(db_sess)
        log = GameLog(
            startStr=game.startStr,
            duration=game.duration,
            countdown=game.countdown,
            opponent1Id=game.opponent1Id,
            opponent2Id=game.opponent2Id,
            startTime=game.startTime,
            clicks1=game.clicks1,
            clicks2=game.clicks2,
            winner=game.winner,
        )
        db_sess.add(log)
        db_sess.commit()
        game_id = log.id
        for v in db_sess.query(UserGame).all():
            db_sess.add(UserGameLog(
                gameId=game_id,
                userId=v.userId,
                team=v.team,
                clicks=v.clicks,
                lastClick=v.lastClick,
                hackAlert=v.hackAlert,
            ))
        db_sess.commit()
