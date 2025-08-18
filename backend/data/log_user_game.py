from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Mapped

from bafser import SqlAlchemyBase, IdMixin
from data._tables import Tables


class UserGameLog(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.UserGameLog

    gameId: Mapped[int]
    userId: Mapped[int]
    team: Mapped[int]
    clicks: Mapped[int]
    lastClick: Mapped[Optional[datetime]]
    hackAlert: Mapped[int]
