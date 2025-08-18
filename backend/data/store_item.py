from datetime import datetime
from typing import Optional

from flask import url_for
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Session, Mapped, mapped_column, relationship

from bafser import SqlAlchemyBase, ObjMixin, Log, Image
from data._tables import Tables
from data.user import User
from utils import BigIdMixin


class StoreItem(SqlAlchemyBase, ObjMixin, BigIdMixin):
    __tablename__ = Tables.StoreItem

    name: Mapped[str] = mapped_column(String(128))
    price: Mapped[int]
    count: Mapped[int]
    imgId: Mapped[Optional[int]] = mapped_column(ForeignKey(f"{Tables.Image}.id"), default=None)

    image: Mapped[Image] = relationship(init=False)

    @staticmethod
    def new(creator: User, name: str, price: int, count: int, imgId: int | None):
        db_sess = Session.object_session(creator)
        assert db_sess
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

    def update(self, actor: User, name: str | None, price: int | None, count: int | None, imgId: int | None):
        changes = []

        def updateField(field: str, value):
            cur = getattr(self, field)
            if value is not None and cur != value:
                changes.append((field, cur, value))
                setattr(self, field, value)

        if imgId is not None and imgId != self.imgId:
            if self.image is None:
                changes.append(("imgId", None, imgId))
            else:
                self.image.delete(actor)
                changes.append(("imgId", self.imgId, imgId))
            self.imgId = imgId

        updateField("name", name)
        updateField("price", price)
        updateField("count", count)

        Log.updated(self, actor, changes)

    def delete(self, actor: User, commit=True, now: datetime | None = None, db_sess: Session | None = None):  # type: ignore
        super().delete(actor, commit, now, db_sess)

        image: Image = self.image
        if image is not None:
            image.delete(actor, commit, now, db_sess)

    def decrease(self, actor: User | None = None, v=1):
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
