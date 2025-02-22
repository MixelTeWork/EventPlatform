from typing import Type, TypeVar
from sqlalchemy import Column, String
from sqlalchemy.orm import Session

from bfs import ObjMixin, randstr

T = TypeVar("T", bound="BigIdMixin")


class BigIdMixin:
    id_big = Column(String(8), unique=True, nullable=False)

    @classmethod
    def get_by_big_id(cls: Type[T], db_sess: Session, id_big: int, includeDeleted=False) -> T:
        if issubclass(cls, ObjMixin):
            return cls.query(db_sess, includeDeleted).filter(cls.id_big == id_big).first()
        else:
            return db_sess.query(cls).filter(cls.id_big == id_big).first()

    def set_unique_big_id(self, db_sess: Session):
        t = self
        while t is not None:
            id_big = randstr(8)
            t = self.get_by_big_id(db_sess, id_big, includeDeleted=True)
        self.id_big = id_big
