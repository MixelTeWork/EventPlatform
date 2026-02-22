from datetime import datetime
from typing import Optional, TypedDict, override

from bafser import BigIdMixin, Image, Log, ObjMixin, SqlAlchemyBase, UserBase, get_db_session
from flask import url_for
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

from data import Tables, User


class StoreItem(SqlAlchemyBase, ObjMixin, BigIdMixin):
    __tablename__ = Tables.StoreItem

    name: Mapped[str] = mapped_column(String(128))
    price: Mapped[int]
    count: Mapped[int]
    imgId: Mapped[Optional[int]] = mapped_column(ForeignKey(f"{Tables.Image}.id"), default=None)

    image: Mapped[Image | None] = relationship(init=False)

    @staticmethod
    def new(name: str, price: int, count: int, imgId: int | None, *, creator: UserBase | None = None):
        item = StoreItem(name=name, price=price, count=count, imgId=imgId)
        item.set_unique_big_id(db_sess=creator.db_sess if creator else get_db_session())

        Log.added(item, creator)
        return item

    def update(self, name: str | None, price: int | None, count: int | None, imgId: int | None, *, actor: UserBase | None = None):
        if imgId is not None and imgId != self.imgId:
            if self.image is not None:
                self.image.delete2(actor=actor)
            self.imgId = imgId

        if name is not None:
            self.name = name
        if price is not None:
            self.price = price
        if count is not None:
            self.count = count

        Log.updated(self, actor)

    @override
    def _on_delete(self, db_sess: Session, actor: UserBase, now: datetime, commit: bool) -> bool:
        if self.image is not None:
            self.image.delete(actor, commit, now, db_sess)
        return True

    @override
    def _on_restore(self, db_sess: Session, actor: UserBase, now: datetime, commit: bool) -> bool:
        if self.image is not None:
            if not self.image.restore(actor, commit, now, db_sess):
                self.imgId = None
        return True

    def decrease(self, v: int = 1, *, actor: User | None = None):
        self.count -= v
        Log.updated(self, actor)

    def get_dict(self) -> "StoreItemDict":
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

    def get_dict_full(self) -> "StoreItemFullDict":
        return {
            "id": self.id,
            "id_big": self.id_big,
            "name": self.name,
            "price": self.price,
            "count": self.count,
            "img": None if self.imgId is None else url_for("images.img", imgId=self.imgId),
        }


class StoreItemDict(TypedDict):
    id: int
    name: str
    price: int
    count: str
    img: str | None


class StoreItemFullDict(TypedDict):
    id: int
    id_big: str
    name: str
    price: int
    count: int
    img: str | None
