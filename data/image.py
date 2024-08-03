import base64
import os
from typing import TypedDict
from flask import current_app
from sqlalchemy import Boolean, Column, DefaultClause, String, Integer
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import Session
from data.log import Actions, Log, Tables
from data.user import User
from data.get_datetime_now import get_datetime_now

from utils import get_json_values
from .db_session import SqlAlchemyBase


class ImageJson(TypedDict):
    data: str
    name: str
    accessEventId: int


class Image(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "Image"

    id            = Column(Integer, primary_key=True, autoincrement=True, unique=True)
    deleted       = Column(Boolean, DefaultClause("0"), nullable=False)
    name          = Column(String(128), nullable=False)
    type          = Column(String(16), nullable=False)

    def __repr__(self):
        return f"<Image> [{self.id}]"

    def get_creation_changes(self):
        return [
            ("name", None, self.name),
            ("type", None, self.type),
        ]

    def get_path(self):
        return os.path.join(current_app.config["IMAGES_FOLDER"], f"{self.id}.{self.type}")

    @staticmethod
    def new(creator: User, json: ImageJson):
        db_sess = Session.object_session(creator)
        (data, name), values_error = get_json_values(json, "data", "name")
        if values_error:
            return None, values_error

        data_splited = data.split(',')
        if len(data_splited) != 2:
            return None, "img data is not base64"

        img_header, img_data = data_splited
        img_header_splited  = img_header.split(";")
        if len(img_header_splited) != 2 or img_header_splited[1] != "base64":
            return None, "img data is not base64"

        img_header_splited_splited = img_header_splited[0].split(":")
        if len(img_header_splited_splited) != 2:
            return None, "img data is not base64"
        mimetype = img_header_splited_splited[1]

        if mimetype not in ["image/png", "image/jpeg", "image/gif"]:
            return None, "img mimetype is not in [image/png, image/jpeg, image/gif]"

        type = mimetype.split("/")[1]

        img = Image(name=name, type=type)
        db_sess.add(img)
        db_sess.commit()

        path = img.get_path()
        with open(path, "wb") as f:
            f.write(base64.b64decode(img_data + '=='))

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.added,
            userId=creator.id,
            userName=creator.name,
            tableName=Tables.Image,
            recordId=img.id,
            changes=img.get_creation_changes()
        ))
        db_sess.commit()

        return img, None

    def delete(self, actor: User):
        db_sess = Session.object_session(self)
        now = get_datetime_now()
        self.deleted = True
        db_sess.add(Log(
            date=now,
            actionCode=Actions.deleted,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.Image,
            recordId=self.id,
            changes=[]
        ))
        db_sess.commit()

    def restore(self, actor: User):
        path = self.get_path()
        if not os.path.exists(path):
            return False

        db_sess = Session.object_session(self)
        self.deleted = False
        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.restored,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.Image,
            recordId=self.id,
            changes=[]
        ))
        db_sess.commit()

        return True
