from datetime import datetime
from typing import Union

from flask import url_for
from sqlalchemy import Column, ForeignKey, Integer, orm, String
from sqlalchemy.orm import Session

from bfs import SqlAlchemyBase, ObjMixin, Log, Image
from data._tables import Tables
from data.user import User
from utils import BigIdMixin


class StoreItem(SqlAlchemyBase, ObjMixin, BigIdMixin):
    __tablename__ = Tables.StoreItem

    name = Column(String(128), nullable=False)
    price = Column(Integer, nullable=False)
    count = Column(Integer, nullable=False)
    imgId = Column(Integer, ForeignKey("Image.id"), nullable=True)

    image = orm.relationship("Image")

    def __repr__(self):
        return f"<StoreItem> [{self.id}] {self.name}"

    @staticmethod
    def new(creator: User, name: str, price: int, count: int, imgId: Union[int, None]):
        db_sess = Session.object_session(creator)
        item = StoreItem(name=name, price=price, count=count, imgId=imgId)
        item.set_unique_big_id(db_sess)

        db_sess.add(item)
        Log.added(item, creator, [
            ("name", item.name),
            ("price", item.price),
            ("count", item.count),
            ("imgId", item.imgId),
        ])

        return item

    def update(self, actor: User, name: Union[str, None], price: Union[int, None], count: Union[int, None], imgId: Union[int, None]):
        changes = []

        def updateField(field: str, value):
            cur = getattr(self, field)
            if value is not None and cur != value:
                changes.append((field, cur, value))
                setattr(self, field, value)

        if imgId is not None and imgId != self.imgId:
            old_img: Union[Image, None] = self.image
            if old_img is None:
                changes.append(("imgId", None, imgId))
            else:
                old_img.delete(actor)
                changes.append(("imgId", self.imgId, imgId))
            self.imgId = imgId

        updateField("name", name)
        updateField("price", price)
        updateField("count", count)

        Log.updated(self, actor, changes)

    def delete(self, actor: User, commit=True, now: datetime = None, db_sess: Session = None):
        super().delete(actor, commit, now, db_sess)

        image: Image = self.image
        if image is not None:
            image.delete(actor, commit, now, db_sess)

    def decrease(self, actor: User = None, v=1):
        count = self.count
        self.count = count - v

        Log.updated(self, actor, [("count", count, self.count)], db_sess=Session.object_session(self))

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
