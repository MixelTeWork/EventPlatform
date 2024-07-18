from typing import Union
from flask import url_for
from sqlalchemy import Boolean, Column, DefaultClause, orm, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin
from data.image import Image

from data.log import Actions, Log, Tables
from data.randstr import randstr
from data.user import User
from data.get_datetime_now import get_datetime_now
from .db_session import SqlAlchemyBase


class StoreItem(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "StoreItem"

    id      = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    id_big  = Column(String(8), unique=True, nullable=False)
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

        t = item
        while t is not None:
            id_big = randstr(8)
            t = db_sess.query(StoreItem).filter(StoreItem.id_big == id_big).first()
        item.id_big = id_big

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
    def get_by_big_id(db_sess: Session, big_id: int):
        item = db_sess.query(StoreItem).filter(StoreItem.deleted == False, StoreItem.id_big == big_id).first()
        return item

    @staticmethod
    def all(db_sess: Session, includeDeleted=False):
        items = db_sess.query(StoreItem)
        if not includeDeleted:
            items = items.filter(StoreItem.deleted == False)
        return items.all()

    def update(self, actor: User, name: Union[str, None], price: Union[int, None], count: Union[int, None], img: Union[Image, None]):
        db_sess = Session.object_session(self)
        changes = []

        if img is not None:
            old_img: Union[Image, None] = self.image
            if old_img is None:
                changes.append(("imgId", None, img.id))
            else:
                old_img.delete(actor)
                changes.append(("imgId", self.imgId, img.id))
            self.image = img

        if name is not None:
            changes.append(("name", self.name, name))
            self.name = name
        if price is not None:
            changes.append(("price", self.price, price))
            self.price = price
        if count is not None:
            changes.append(("count", self.count, count))
            self.count = count

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.updated,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.StoreItem,
            recordId=self.id,
            changes=changes
        ))
        db_sess.commit()

    def delete(self, actor: User):
        db_sess = Session.object_session(self)
        self.deleted = True

        image: Image = self.image
        if image is not None:
            image.delete(actor)

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

    def decrease(self, actor: User = None, v=1):
        db_sess = Session.object_session(self)
        count = self.count
        self.count = count - v

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.updated,
            userId=actor.id if actor else 1,
            userName=actor.name if actor else "system",
            tableName=Tables.StoreItem,
            recordId=self.id,
            changes=[("count", count, count - v)]
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
        count = "many"
        if self.count <= 15:
            count = "few"
        if self.count <= 0:
            count = "no"

        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "count": count,
            "img": None if self.imgId is None else url_for("images.img", imgId=self.imgId),
        }

    def get_dict_full(self):
        return {
            "id": self.id,
            "id_big": self.id_big,
            "name": self.name,
            "price": self.price,
            "count": self.count,
            "img": None if self.imgId is None else url_for("images.img", imgId=self.imgId),
        }
