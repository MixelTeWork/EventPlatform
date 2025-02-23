from datetime import datetime
from typing import Union

from flask import url_for
from sqlalchemy import Column, ForeignKey, Integer, orm, String
from sqlalchemy.orm import Session

from bfs import SqlAlchemyBase, Log, ObjMixin, Image
from data._tables import Tables
from data.user import User


class TourneyCharacter(SqlAlchemyBase, ObjMixin):
    __tablename__ = Tables.TourneyCharacter

    name = Column(String(128), nullable=False)
    imgId = Column(Integer, ForeignKey("Image.id"), nullable=True)

    image = orm.relationship("Image")

    @staticmethod
    def new(creator: User, name: str, imgId: int):
        db_sess = Session.object_session(creator)
        character = TourneyCharacter(name=name, imgId=imgId)
        db_sess.add(character)

        Log.added(character, creator, [
            ("name", character.name),
            ("imgId", character.imgId),
        ])

        return character

    def update(self, actor: User, name: Union[str, None], imgId: Union[int, None]):
        changes = []

        if name is not None:
            changes.append(("name", self.name, name))
            self.name = name

        if imgId is not None:
            changes.append(("imgId", self.imgId, imgId))
            image: Image = self.image
            if image is not None:
                image.delete(actor)
            self.imgId = imgId

        Log.updated(self, actor, changes)

    def delete(self, actor: User, commit=True, now: datetime = None, db_sess: Session = None):
        super().delete(actor, commit, now, db_sess)

        image: Image = self.image
        if image is not None:
            image.delete(actor, commit, now, db_sess)

    def get_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "img": url_for("images.img", imgId=self.imgId),
        }
