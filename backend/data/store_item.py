from typing import Union
from flask import url_for
from sqlalchemy import Boolean, Column, DefaultClause, orm, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.log import Actions, Log, Tables
from data.user import User
from data.get_datetime_now import get_datetime_now
from .db_session import SqlAlchemyBase


class StoreItem(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "StoreItem"

    id      = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    deleted = Column(Boolean, DefaultClause("0"), nullable=False)
    name    = Column(String(128), nullable=False)
    price   = Column(Integer, nullable=False)
    count   = Column(Integer, nullable=False)
    imgId   = Column(Integer, ForeignKey("Image.id"), nullable=True)

    image = orm.relationship("Image")

    def __repr__(self):
        return f"<StoreItem> [{self.id}] {self.name}"

    @staticmethod
    def new(db_sess: Session, actor: User, name: str, price: int, count: int, imgId: Union[int, None]):
        item = StoreItem(name=name, price=price, count=count, imgId=imgId)
        db_sess.add(item)

        now = get_datetime_now()
        log = Log(
            date=now,
            actionCode=Actions.added,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.StoreItem,
            recordId=-1,
            changes=item.get_creation_changes()
        )
        db_sess.add(log)
        db_sess.commit()

        log.recordId = item.id
        db_sess.commit()

        return item

    @staticmethod
    def get(db_sess: Session, id: int, includeDeleted=False):
        item = db_sess.get(StoreItem, id)
        if item is None or (not includeDeleted and item.deleted):
            return None
        return item

    @staticmethod
    def all(db_sess: Session, includeDeleted=False):
        items = db_sess.query(StoreItem)
        if not includeDeleted:
            items = items.filter(StoreItem.deleted == False)
        return items.all()

    def delete(self, actor: User):
        db_sess = Session.object_session(self)
        self.deleted = True

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.deleted,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.StoreItem,
            recordId=self.id,
            changes=[]
        ))
        db_sess.commit()

    def get_creation_changes(self):
        return [
            ("name", None, self.name),
            ("price", None, self.price),
            ("count", None, self.count),
            ("imgId", None, self.imgId),
        ]

    def get_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "count": self.count,
            "img": None if self.imgId is None else url_for("/img/" + self.imgId, _external=True),
        }
