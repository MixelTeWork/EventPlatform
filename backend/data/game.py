from datetime import timedelta

from sqlalchemy import Column, DateTime, DefaultClause, func, Integer, String
from sqlalchemy.orm import Session

from bfs import SqlAlchemyBase, IdMixin, get_datetime_now
from data._tables import Tables
from data.user import User
from data.user_game import UserGame


class Game(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.Game

    startStr = Column(String(8), DefaultClause("16:30"), nullable=False)
    duration = Column(Integer, DefaultClause("60"), nullable=False)
    counter = Column(Integer, DefaultClause("150"), nullable=False)
    startTime = Column(DateTime, nullable=True)
    clicks1 = Column(Integer, DefaultClause("0"), nullable=False)
    clicks2 = Column(Integer, DefaultClause("0"), nullable=False)
    winner = Column(Integer, DefaultClause("0"), nullable=False)

    @staticmethod
    def init(db_sess: Session):
        game = Game.get(db_sess)
        if game is not None:
            return
        db_sess.add(Game(id=1))
        db_sess.commit()

    @staticmethod
    def get(db_sess: Session):
        return db_sess.get(Game, 1)

    @staticmethod
    def start(db_sess: Session):
        game = Game.get(db_sess)
        game.startTime = get_datetime_now()
        db_sess.query(UserGame).delete()
        db_sess.commit()

    @staticmethod
    def reset(db_sess: Session):
        game = Game.get(db_sess)
        game.startTime = None
        game.clicks1 = 0
        game.clicks2 = 0
        game.winner = 0
        db_sess.commit()

    @staticmethod
    def get_state(db_sess: Session, game: "Game" = None):
        game = Game.get(db_sess) if game is None else game
        state = {
            "state": GameState.wait,
            "start": game.startStr,
            "counter": 0,
            "winner": game.winner,
        }
        if game.startTime is None:
            return state

        now = get_datetime_now().replace(tzinfo=None)
        dt: timedelta = now - game.startTime
        if dt < timedelta(seconds=game.counter):
            state["state"] = GameState.start
            state["counter"] = game.counter - dt.seconds
            return state

        if dt < timedelta(seconds=game.counter + game.duration):
            state["state"] = GameState.going
            state["counter"] = game.counter + game.duration - dt.seconds
            return state

        state["state"] = GameState.end
        return state

    @staticmethod
    def get_state_update(db_sess: Session):
        game = Game.get(db_sess)
        state = Game.get_state(db_sess, game)
        state["clicks1"] = game.clicks1
        state["clicks2"] = game.clicks2
        if state["state"] != GameState.going and state["state"] != GameState.end:
            return state

        if game.winner == 0:
            state = {**state, **Game.get_clicks(db_sess)}
            if state["state"] == GameState.end:
                game.clicks1 = state["clicks1"]
                game.clicks2 = state["clicks2"]
                game.winner = 1 if game.clicks1 > game.clicks2 else 2
                state["winner"] = game.winner
                from data.log_game import GameLog
                GameLog.create(db_sess)
                db_sess.commit()

        return state

    @staticmethod
    def get_clicks(db_sess: Session):
        return {(f"clicks{v[0]}"): safeDiv(int(v[1]), int(v[2])) for v in db_sess
                .query(User.group, func.sum(UserGame.clicks), func.count(UserGame.userId))
                .join(User, User.id == UserGame.userId)
                .group_by(User.group)
                .all()}


def safeDiv(v1, v2):
    if v2 == 0:
        return v1
    return v1 / v2


class GameState:
    wait = "wait"
    start = "start"
    going = "going"
    end = "end"
