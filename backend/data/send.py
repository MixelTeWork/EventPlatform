from sqlalchemy import Boolean, Column, DefaultClause, ForeignKey, Integer, String, orm
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.randstr import randstr
from .db_session import SqlAlchemyBase


class Send(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "Send"

    id        = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    id_big    = Column(String(8), unique=True, nullable=False)
    creatorId = Column(Integer, ForeignKey("User.id"), nullable=False)
    value     = Column(Integer, nullable=False)
    positive  = Column(Boolean, nullable=False)
    used      = Column(Boolean, DefaultClause("0"), nullable=False)

    creator = orm.relationship("User")

    def __repr__(self):
        return f"<Send> [{self.id}] {'+' if self.positive else '-'}{self.value}"

    @staticmethod
    def new(db_sess: Session, creatorId: int, value: int, positive: bool):
        send = Send(
            creatorId=creatorId,
            value=value,
            positive=positive,
        )

        s = send
        while s is not None:
            id_big = randstr(8)
            s = db_sess.query(Send).filter(Send.id_big == id_big).first()
        send.id_big = id_big

        db_sess.add(send)
        db_sess.commit()

        return send

    @staticmethod
    def get_by_big_id(db_sess: Session, big_id: int):
        send = db_sess.query(Send).filter(Send.id_big == big_id).first()
        return send

    def get_dict(self):
        return {
            "id": self.id_big,
            "value": self.value,
            "positive": self.positive,
        }


class Actions:
    buyItem = "buyItem"
    endQuest = "endQuest"
    sendMoney = "sendMoney"
