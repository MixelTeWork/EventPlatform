from typing import Union
from flask import url_for
from sqlalchemy import Boolean, Column, DefaultClause, orm, ForeignKey, Integer, String
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin

from data.image import Image
from data.log import Actions, Log, Tables
from data.get_datetime_now import get_datetime_now
from .db_session import SqlAlchemyBase


class DialogCharacter(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "DialogCharacter"

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    deleted = Column(Boolean, DefaultClause("0"), nullable=False)
    name = Column(String(128), nullable=False)
    imgId = Column(Integer, ForeignKey("Image.id"), nullable=True)

    image = orm.relationship("Image")

    def __repr__(self):
        return f"<DialogCharacter> [{self.id}]"

    @staticmethod
    def new(db_sess: Session, actor, name: str, imgId: int):
        character = DialogCharacter(name=name, imgId=imgId)
        db_sess.add(character)

        now = get_datetime_now()
        log = Log(
            date=now,
            actionCode=Actions.added,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.DialogCharacter,
            recordId=-1,
            changes=[
                ("name", None, character.name),
                ("imgId", None, character.imgId),
            ]
        )
        db_sess.add(log)
        db_sess.commit()

        log.recordId = character.id
        db_sess.commit()

        return character

    @staticmethod
    def get(db_sess: Session, id: int, includeDeleted=False):
        character = db_sess.get(DialogCharacter, id)
        if character is None or (not includeDeleted and character.deleted):
            return None
        return character

    @staticmethod
    def all(db_sess: Session, includeDeleted=False):
        characters = db_sess.query(DialogCharacter)
        if not includeDeleted:
            characters = characters.filter(DialogCharacter.deleted == False)
        return characters.all()

    def update(self, actor, name: str, img: Union[Image, None]):
        db_sess = Session.object_session(self)
        changes = [
            ("name", self.name, name)
        ]
        self.name = name

        if img is not None:
            changes.append(("imgId", self.imgId, img.id))
            self.image.delete(actor)
            self.image = img

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.updated,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.DialogCharacter,
            recordId=self.id,
            changes=changes
        ))
        db_sess.commit()

    def delete(self, actor):
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
            tableName=Tables.DialogCharacter,
            recordId=self.id,
            changes=[]
        ))
        db_sess.commit()

    def get_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "img": url_for("images.img", imgId=self.imgId),
        }
