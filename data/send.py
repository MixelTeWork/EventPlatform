from sqlalchemy import Boolean, Column, DateTime, DefaultClause, ForeignKey, Integer, orm
from sqlalchemy.orm import Session

from bfs import SqlAlchemyBase, IdMixin, get_datetime_now
from data._tables import Tables
from data.user import User
from utils import BigIdMixin


class Send(SqlAlchemyBase, IdMixin, BigIdMixin):
    __tablename__ = Tables.Send

    date = Column(DateTime, nullable=False)
    creatorId = Column(Integer, ForeignKey("User.id"), nullable=False)
    value = Column(Integer, nullable=False)
    positive = Column(Boolean, nullable=False)
    reusable = Column(Boolean, nullable=False)
    used = Column(Boolean, DefaultClause("0"), nullable=False)

    creator = orm.relationship("User")

    def __repr__(self):
        return f"<Send> [{self.id}] {'+' if self.positive else '-'}{self.value}"

    @staticmethod
    def new(db_sess: Session, creatorId: int, value: int, positive: bool, reusable: bool):
        send = Send(
            date=get_datetime_now(),
            creatorId=creatorId,
            value=value,
            positive=positive,
            reusable=reusable,
        )
        send.set_unique_big_id(db_sess)

        db_sess.add(send)
        db_sess.commit()

        return send

    def check_used_by(self, user: User):
        from data.user_send import UserSend
        db_sess = Session.object_session(self)
        used = db_sess\
            .query(UserSend)\
            .filter(UserSend.sendId == self.id, UserSend.userId == user.id)\
            .first()

        return used is not None

    def get_dict(self):
        return {
            "id": self.id_big,
            "value": self.value,
            "positive": self.positive,
            "reusable": self.reusable,
        }
