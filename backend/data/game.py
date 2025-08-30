from datetime import datetime, timedelta
from typing import Optional

from bafser import SingletonMixin, SqlAlchemyBase, get_datetime_now
from sqlalchemy import ForeignKey, String, func
from sqlalchemy.orm import Mapped, Session, mapped_column

from data._tables import Tables
from data.user_game import UserGame


class Game(SqlAlchemyBase, SingletonMixin):
    __tablename__ = Tables.Game

    startStr: Mapped[str] = mapped_column(String(8), default="17:30")
    duration: Mapped[int] = mapped_column(default="60")
    countdown: Mapped[int] = mapped_column(default="150")
    opponent1Id: Mapped[Optional[int]] = mapped_column(ForeignKey(f"{Tables.TourneyCharacter}.id"), default=None)
    opponent2Id: Mapped[Optional[int]] = mapped_column(ForeignKey(f"{Tables.TourneyCharacter}.id"), default=None)
    startTime: Mapped[Optional[datetime]] = mapped_column(default=None)
    clicks1: Mapped[int] = mapped_column(default=0)
    clicks2: Mapped[int] = mapped_column(default=0)
    winner: Mapped[int] = mapped_column(default=0)
    showGame: Mapped[bool] = mapped_column(default=False)
    tourneyEnded: Mapped[bool] = mapped_column(default=False)

    @staticmethod
    def start_new(db_sess: Session, opponent1Id: int, opponent2Id: int):
        game = Game.get(db_sess)
        game.startTime = get_datetime_now()
        game.showGame = True
        game.clicks1 = 0
        game.clicks2 = 0
        game.winner = 0
        game.opponent1Id = opponent1Id
        game.opponent2Id = opponent2Id
        db_sess.query(UserGame).delete()
        db_sess.commit()

    @staticmethod
    def reset(db_sess: Session):
        game = Game.get(db_sess)
        game.tourneyEnded = False
        game.showGame = False
        game.startTime = None
        game.clicks1 = 0
        game.clicks2 = 0
        game.winner = 0
        db_sess.commit()

    @staticmethod
    def get_winner(db_sess: Session):
        game = Game.get(db_sess)
        if game.winner == 1:
            return game.opponent1Id
        if game.winner == 2:
            return game.opponent2Id
        return -1

    @staticmethod
    def end_game(db_sess: Session):
        game = Game.get(db_sess)
        game.showGame = False
        clicks = Game.get_clicks(db_sess)
        game.clicks1 = clicks.get("clicks1", 0)
        game.clicks2 = clicks.get("clicks2", 0)
        game.winner = 1 if game.clicks1 > game.clicks2 else 2
        from data.log_game import GameLog
        GameLog.create(db_sess)
        db_sess.commit()

        if game.winner == 1:
            return game.opponent1Id
        if game.winner == 2:
            return game.opponent2Id
        return -1

    @staticmethod
    def get_state(db_sess: Session, game: "Game | None" = None, userId: int | None = None, usergame: dict | None = None):
        game = Game.get(db_sess) if game is None else game
        state = {
            "state": GameState.wait,
            "opponent1Id": game.opponent1Id,
            "opponent2Id": game.opponent2Id,
            "start": game.startStr,
            "counter": 0,
            "winner": game.winner,
            "team": 0,
            "tourneyWinner1": -1,
            "tourneyWinner2": -1,
            "tourneyWinner3": -1,
        }
        if userId is not None:
            ug = UserGame.get(db_sess, userId)
            if usergame is not None:
                usergame["v"] = ug
            state["team"] = ug.team

        if game.tourneyEnded:
            state["state"] = GameState.tourneyEnd
            from data.tourney import Tourney
            winner1, winner2, winner3 = Tourney.get_winners(db_sess)
            state["tourneyWinner1"] = winner1
            state["tourneyWinner2"] = winner2
            state["tourneyWinner3"] = winner3
            return state

        if game.winner != 0:
            state["state"] = GameState.end
            return state

        if game.startTime is None:
            return state

        now = get_datetime_now().replace(tzinfo=None)
        dt: timedelta = now - game.startTime
        if dt < timedelta(seconds=game.countdown):
            state["state"] = GameState.start
            state["counter"] = max(0, game.countdown - dt.seconds)
            return state

        if dt < timedelta(seconds=game.countdown + game.duration):
            state["state"] = GameState.going
            state["counter"] = max(0, game.countdown + game.duration - dt.seconds)
            return state

        state["state"] = GameState.end
        return state

    @staticmethod
    def get_state_update(db_sess: Session):
        game = Game.get(db_sess)
        state = Game.get_state(db_sess, game)
        state["clicks1"] = game.clicks1
        state["clicks2"] = game.clicks2
        state["showGame"] = game.showGame

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
                .query(UserGame.team, func.sum(UserGame.clicks), func.count(UserGame.userId))
                .group_by(UserGame.team)
                .filter(UserGame.hackAlert < 10)
                .filter(UserGame.clicks > 0)
                .all()}


def safeDiv(v1: int, v2: int):
    if v2 == 0:
        return v1
    return v1 // v2


class GameState:
    wait = "wait"
    start = "start"
    going = "going"
    end = "end"
    tourneyEnd = "tourneyEnd"
