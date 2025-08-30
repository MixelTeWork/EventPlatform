from datetime import datetime
from typing import Optional, override

from bafser import Image, Log, ObjMixin, SqlAlchemyBase, UserBase
from flask import url_for
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship

from data._tables import Tables
from data.user import User


class TourneyCharacter(SqlAlchemyBase, ObjMixin):
    __tablename__ = Tables.TourneyCharacter

    name: Mapped[str] = mapped_column(String(128))
    color: Mapped[str] = mapped_column(String(32))
    imgId: Mapped[Optional[int]] = mapped_column(ForeignKey(f"{Tables.Image}.id"), default=None)

    image: Mapped[Image] = relationship(init=False)

    @staticmethod
    def new(creator: User, name: str, color: str, imgId: int):
        db_sess = Session.object_session(creator)
        assert db_sess
        character = TourneyCharacter(name=name, color=color, imgId=imgId)
        db_sess.add(character)

        Log.added(character, creator, [
            ("name", character.name),
            ("color", character.color),
            ("imgId", character.imgId),
        ])

        return character

    def update(self, actor: User, name: str | None, color: str | None, imgId: int | None):
        changes = []

        if name is not None:
            changes.append(("name", self.name, name))
            self.name = name

        if color is not None:
            changes.append(("color", self.color, color))
            self.color = color

        if imgId is not None:
            changes.append(("imgId", self.imgId, imgId))
            image: Image = self.image
            if image is not None:
                image.delete(actor)
            self.imgId = imgId

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
            "color": self.color,
            "img": url_for("images.img", imgId=self.imgId),
        }
