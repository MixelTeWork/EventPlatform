from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import Session

from bfs import SqlAlchemyBase, IdMixin
from data._tables import Tables
from data.game import Game
from data.log_user_game import UserGameLog
from data.user_game import UserGame


class GameLog(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.GameLog

    startStr = Column(String(8))
    duration = Column(Integer)
    counter = Column(Integer)
    startTime = Column(DateTime)
    clicks1 = Column(Integer)
    clicks2 = Column(Integer)
    winner = Column(Integer)

    @staticmethod
    def create(db_sess: Session):
        game = Game.get(db_sess)
        log = GameLog(
            startStr=game.startStr,
            duration=game.duration,
            counter=game.counter,
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
                clicks=v.clicks,
                lastClick=v.lastClick,
                hackAlert=v.hackAlert,
            ))
        db_sess.commit()
