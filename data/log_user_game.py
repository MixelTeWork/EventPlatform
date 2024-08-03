from sqlalchemy import Column, DateTime, Integer
from sqlalchemy_serializer import SerializerMixin

from .db_session import SqlAlchemyBase


class UserGameLog(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "UserGameLog"

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    gameId = Column(Integer)
    userId = Column(Integer)
    clicks = Column(Integer)
    lastClick = Column(DateTime)
    hackAlert = Column(Integer)
