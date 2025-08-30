from datetime import datetime
from typing import Optional, override

from bafser import Image, Log, ObjMixin, SqlAlchemyBase, UserBase
from flask import url_for
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

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

    def get_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "img": url_for("images.img", imgId=self.imgId),
            "orien": self.orien,
        }
