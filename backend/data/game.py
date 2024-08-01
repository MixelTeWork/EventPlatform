from datetime import timedelta
import math
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.get_datetime_now import get_datetime_now
from data.transaction import Actions, Transaction
from data.user import User
from data.user_game import UserGame
from .db_session import SqlAlchemyBase


class Game(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "Game"

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    winner = Column(String(8), nullable=True)
    startTime = Column(DateTime, nullable=True)
    reward = Column(Integer, nullable=True)
    startStr = Column(String(8), nullable=False)
    price = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=False)
    counter = Column(Integer, nullable=False)

    @staticmethod
    def init(db_sess: Session):
        game = db_sess.query(Game).filter(Game.id == 1).first()
        if game is not None:
            return
        db_sess.add(Game(id=1, duration=60, price=10, counter=150, startStr="16:30"))
        db_sess.commit()

    @staticmethod
    def get(db_sess: Session):
        return db_sess.query(Game).filter(Game.id == 1).first()

    @staticmethod
    def start(db_sess: Session):
        game = Game.get(db_sess)
        game.startTime = get_datetime_now()
        db_sess.commit()

    @staticmethod
    def get_state(db_sess: Session, user):
        game = Game.get(db_sess)
        if user is not None:
            ur = db_sess.query(UserGame).filter(UserGame.userId == user.id).first()
            team = ur.team if ur is not None else ""
            balance = user.balance
        else:
            team = ""
            balance = 0

        if game.winner is not None:
            if team == "":
                return {
                    "state": "end",
                    "team": "",
                    "winner": game.winner,
                    "counter": 0,
                    "price": game.price,
                    "start": game.startStr,
                    "balance": balance,
                    "reward": game.reward,
                }
            return {
                "state": "won" if team == game.winner else "loss",
                "team": team,
                "winner": game.winner,
                "counter": 0,
                "price": game.price,
                "start": game.startStr,
                "balance": balance,
                "reward": game.reward,
            }

        if game.startTime is None:
            return {
                "state": "title",
                "team": "",
                "winner": "",
                "counter": 0,
                "price": game.price,
                "start": game.startStr,
                "balance": balance,
                "reward": game.reward,
            }

        now = get_datetime_now().replace(tzinfo=None)
        dt = now - game.startTime
        if dt > timedelta(seconds=game.counter):
            return {
                "state": "nojoin" if team == "" else "play",
                "team": team,
                "winner": "",
                "counter": 0,
                "price": game.price,
                "start": game.startStr,
                "balance": balance,
                "reward": game.reward,
            }
        return {
            "state": "join" if team == "" else "wait",
            "team": team,
            "winner": "",
            "counter": game.counter - dt.seconds,
            "price": game.price,
            "start": game.startStr,
            "balance": balance,
            "reward": game.reward,
        }

    @staticmethod
    def finish(db_sess: Session, team):
        game = Game.get(db_sess)
        game.winner = team
        players = db_sess.query(User).join(UserGame, UserGame.userId == User.id).count()
        winners = list(db_sess.query(User).join(UserGame, UserGame.userId == User.id).filter(UserGame.team == team).all())
        winners_count = len(winners)
        if winners_count == 0:
            winners_count = 1
        all_value = game.price * players
        reward = all_value / winners_count / 2
        reward = math.floor(reward) + 10
        game.reward = reward
        for winner in winners:
            winner.balance += reward
            Transaction.new(db_sess, 1, winner.id, reward, Actions.gameWin, 1, True)
        db_sess.commit()


class GameTeams:
    red = "red"
    blue = "blue"
    green = "green"
    yellow = "yellow"
