from datetime import datetime
from typing import Optional, TypedDict, override

from bafser import Image, Log, ObjMixin, SqlAlchemyBase, UserBase
from flask import url_for
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

from data import Tables, User


class DialogCharacter(SqlAlchemyBase, ObjMixin):
    __tablename__ = Tables.DialogCharacter

    name: Mapped[str] = mapped_column(String(128))
    imgId: Mapped[Optional[int]] = mapped_column(ForeignKey(f"{Tables.Image}.id"), default=None)
    orien: Mapped[int] = mapped_column(Integer, default=0)

    image: Mapped["Image | None"] = relationship(init=False, lazy="joined")

    @staticmethod
    def new(name: str, imgId: int, orien: int, *, creator: User | None = None):
        character = DialogCharacter(name=name, imgId=imgId, orien=orien)
        Log.added(character, creator)
        return character

    def update(self, name: str | None, imgId: int | None, orien: int | None, *, actor: User | None = None):
        if name is not None:
            self.name = name

        if imgId is not None:
            if self.image is not None:
                self.image.delete2(actor=actor)
            self.imgId = imgId

        if orien is not None:
            self.orien = orien

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

    def get_dict(self) -> "DialogCharacterDict":
        return {
            "id": self.id,
            "name": self.name,
            "img": url_for("images.img", imgId=self.imgId) if self.imgId else None,
            "orien": self.orien,
        }


class DialogCharacterDict(TypedDict):
    id: int
    name: str
    img: str | None
    orien: int
