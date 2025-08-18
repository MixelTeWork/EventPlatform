from datetime import datetime
from typing import Optional

from flask import url_for
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Session, Mapped, mapped_column, relationship

from bafser import SqlAlchemyBase, Log, ObjMixin, Image
from data._tables import Tables
from data.user import User


class DialogCharacter(SqlAlchemyBase, ObjMixin):
    __tablename__ = Tables.DialogCharacter

    name: Mapped[str] = mapped_column(String(128))
    imgId: Mapped[Optional[int]] = mapped_column(ForeignKey(f"{Tables.Image}.id"), default=None)
    orien: Mapped[int] = mapped_column(Integer, default=0)

    image: Mapped["Image"] = relationship(init=False)

    @staticmethod
    def new(creator: User, name: str, imgId: int, orien: int):
        db_sess = Session.object_session(creator)
        assert db_sess
        character = DialogCharacter(name=name, imgId=imgId, orien=orien)
        db_sess.add(character)

        Log.added(character, creator, [
            ("name", character.name),
            ("imgId", character.imgId),
            ("orien", character.orien),
        ])

        return character

    def update(self, actor: User, name: str | None, imgId: int | None, orien: int | None):
        changes = []

        if name is not None:
            changes.append(("name", self.name, name))
            self.name = name

        if imgId is not None:
            changes.append(("imgId", self.imgId, imgId))
            if self.image is not None:
                self.image.delete(actor)
            self.imgId = imgId

        if orien is not None:
            changes.append(("orien", self.orien, orien))
            self.orien = orien

        Log.updated(self, actor, changes)

    def delete(self, actor: User, commit=True, now: datetime | None = None, db_sess: Session | None = None):  # type: ignore
        super().delete(actor, commit, now, db_sess)

        if self.image is not None:
            self.image.delete(actor, commit, now, db_sess)

    def get_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "img": url_for("images.img", imgId=self.imgId),
            "orien": self.orien,
        }
