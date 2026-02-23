from bafser import IdMixin, SqlAlchemyBase, get_db_session
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from data import Tables


class GameStartTime(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.GameStartTime

    startStr: Mapped[str] = mapped_column(String(16))

    @staticmethod
    def get_all():
        return [v.startStr for v in GameStartTime.query2().order_by(GameStartTime.id.desc())]

    @staticmethod
    def update(times: list[str]):
        GameStartTime.query2().delete()
        db_sess = get_db_session()
        for v in times:
            db_sess.add(GameStartTime(startStr=v))
        db_sess.commit()
