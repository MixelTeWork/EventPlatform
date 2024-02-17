from datetime import timedelta
import math
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, orm
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.get_datetime_now import get_datetime_now
from data.transaction import Actions, Transaction
from data.user import User
from data.user_race import UserRace
from .db_session import SqlAlchemyBase


class Race(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "Race"

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    winner = Column(String(8), nullable=True)
    startTime = Column(DateTime, nullable=True)
    startStr = Column(String(8), nullable=False)
    price = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=False)
    counter = Column(Integer, nullable=False)

    @staticmethod
    def init(db_sess: Session):
        race = db_sess.query(Race).filter(Race.id == 1).first()
        if race is not None:
            return
        db_sess.add(Race(id=1, duration=60, price=10, counter=150, startStr="16:30"))
        db_sess.commit()

    @staticmethod
    def get(db_sess: Session):
        return db_sess.query(Race).filter(Race.id == 1).first()

    @staticmethod
    def start(db_sess: Session):
        race = Race.get(db_sess)
        race.startTime = get_datetime_now()
        db_sess.commit()

    @staticmethod
    def get_state(db_sess: Session, user):
        race = Race.get(db_sess)
        ur = db_sess.query(UserRace).filter(UserRace.userId == user.id).first()
        team = ur.team if ur is not None else ""

        if race.winner is not None:
            if team == "":
                return {
                    "state": "end",
                    "team": "",
                    "winner": race.winner,
                    "counter": 0,
                    "price": race.price,
                    "start": race.startStr,
                }
            return {
                "state": "won" if team == race.winner else "loss",
                "team": team,
                "winner": race.winner,
                "counter": 0,
                "price": race.price,
                "start": race.startStr,
            }

        if race.startTime is None:
            return {
                "state": "title",
                "team": "",
                "winner": "",
                "counter": 0,
                "price": race.price,
                "start": race.startStr,
            }

        now = get_datetime_now().replace(tzinfo=None)
        dt = now - race.startTime
        if dt > timedelta(seconds=race.counter):
            return {
                "state": "nojoin" if team == "" else "play",
                "team": team,
                "winner": "",
                "counter": 0,
                "price": race.price,
                "start": race.startStr,
            }
        return {
            "state": "join" if team == "" else "wait",
            "team": team,
            "winner": "",
            "counter": race.counter - dt.seconds,
            "price": race.price,
            "start": race.startStr,
        }

    @staticmethod
    def finish(db_sess: Session, team):
        race = Race.get(db_sess)
        race.winner = team
        players = db_sess.query(User).join(UserRace, UserRace.userId == User.id).count()
        winners = list(db_sess.query(User).join(UserRace, UserRace.userId == User.id).filter(UserRace.team == team).all())
        all_value = race.price * players
        reward = all_value / len(winners) / 2
        reward = math.floor(reward) + 10
        for winner in winners:
            winner.balance += reward
            Transaction.new(db_sess, 1, winner.id, reward, Actions.raceWin, 1, True)
        db_sess.commit()


class RaceTeams:
    red = "red"
    blue = "blue"
    green = "green"
    yellow = "yellow"
