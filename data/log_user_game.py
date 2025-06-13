from sqlalchemy import Column, DateTime, Integer

from bafser import SqlAlchemyBase, IdMixin
from data._tables import Tables


class UserGameLog(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.UserGameLog

    gameId = Column(Integer)
    userId = Column(Integer)
    team = Column(Integer)
    clicks = Column(Integer)
    lastClick = Column(DateTime)
    hackAlert = Column(Integer)
