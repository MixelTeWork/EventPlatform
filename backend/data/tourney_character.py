from datetime import datetime
from typing import Optional, TypedDict, override

from bafser import Image, Log, ObjMixin, SqlAlchemyBase, UserBase
from flask import url_for
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

from data import Tables


class TourneyCharacter(SqlAlchemyBase, ObjMixin):
    __tablename__ = Tables.TourneyCharacter

    name: Mapped[str] = mapped_column(String(128))
    color: Mapped[str] = mapped_column(String(32))
    imgId: Mapped[Optional[int]] = mapped_column(ForeignKey(f"{Tables.Image}.id"), default=None)

    image: Mapped[Image | None] = relationship(init=False)

    @staticmethod
    def new(name: str, color: str, imgId: int | None = None, *, creator: UserBase | None = None):
        character = TourneyCharacter(name=name, color=color, imgId=imgId)
        Log.added(character, creator)
        return character

    def update(self, name: str | None, color: str | None, imgId: int | None, *, actor: UserBase | None = None):
        if name is not None:
            self.name = name
        if color is not None:
            self.color = color
        if imgId is not None:
            if self.image is not None:
                self.image.delete2(actor=actor)
            self.imgId = imgId

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

    def get_dict(self) -> "TourneyCharacterDict":
        return {
            "id": self.id,
            "name": self.name,
            "color": self.color,
            "img": url_for("images.img", imgId=self.imgId) if self.imgId else None,
        }


class TourneyCharacterDict(TypedDict):
    id: int
    name: str
    color: str
    img: str | None
