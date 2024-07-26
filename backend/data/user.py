from __future__ import annotations
from sqlalchemy import DefaultClause, Column, Integer, String, Boolean
from sqlalchemy.orm import Session
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash

from data.log import Actions, Log, Tables
from data.permission import Permission
from data.quest import Quest
from data.randstr import randstr
from data.role import Role, Roles
from data.user_quest import UserQuest
from data.user_role import UserRole
from data.get_datetime_now import get_datetime_now
from .db_session import SqlAlchemyBase


class User(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "User"

    id         = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    id_big     = Column(String(8), unique=True, nullable=False)
    deleted    = Column(Boolean, DefaultClause("0"), nullable=False)
    login      = Column(String(128), index=True, unique=True, nullable=False)
    password   = Column(String(128), nullable=False)
    name       = Column(String(128), nullable=False)
    lastName   = Column(String(128), nullable=True)
    imageUrl   = Column(String(256), nullable=True)
    ticketType = Column(String(128), nullable=True)
    ticketTId  = Column(Integer, nullable=True)
    balance    = Column(Integer, nullable=False)
    group      = Column(Integer, DefaultClause("0"), nullable=False)

    def __repr__(self):
        return f"<User> [{self.id} {self.login}] {self.name}"

    @staticmethod
    def new(db_sess: Session, actor: User, login: str, password: str, name: str, roles: list[int]):
        user = User(login=login, name=name, balance=0)
        user.set_password(password)

        u = user
        while u is not None:
            id_big = randstr(8)
            u = db_sess.query(User).filter(User.id_big == id_big).first()
        user.id_big = id_big

        db_sess.add(user)

        now = get_datetime_now()
        log = Log(
            date=now,
            actionCode=Actions.added,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.User,
            recordId=-1,
            changes=[
                ("login", None, user.login),
                ("name", None, user.name),
                ("password", None, "***"),
            ]
        )
        db_sess.add(log)
        db_sess.commit()

        userId = user.id
        log.recordId = user.id

        for roleId in roles:
            user_role = UserRole(userId=userId, roleId=roleId)
            db_sess.add(user_role)
            db_sess.add(Log(
                date=now,
                actionCode=Actions.added,
                userId=actor.id,
                userName=actor.name,
                tableName=Tables.UserRole,
                recordId=-1,
                changes=user_role.get_creation_changes()
            ))

        db_sess.commit()

        return user

    @staticmethod
    def get(db_sess: Session, id: int, includeDeleted=False):
        user = db_sess.get(User, id)
        if user is None or (not includeDeleted and user.deleted):
            return None
        return user

    @staticmethod
    def get_by_login(db_sess: Session, login: str, includeDeleted=False):
        user = db_sess.query(User).filter(User.login == login)
        if not includeDeleted:
            user = user.filter(User.deleted == False)
        return user.first()

    @staticmethod
    def get_by_big_id(db_sess: Session, big_id: int):
        user = db_sess.query(User).filter(User.deleted == False, User.id_big == big_id).first()
        return user

    @staticmethod
    def get_admin(db_sess: Session):
        admin = db_sess.query(User).join(UserRole).where(UserRole.roleId == Roles.admin).first()
        return admin

    @staticmethod
    def all(db_sess: Session, includeDeleted=False):
        items = db_sess.query(User)
        if not includeDeleted:
            items = items.filter(User.deleted == False)
        return items.all()

    def delete(self, actor: User):
        db_sess = Session.object_session(self)
        self.deleted = True

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.deleted,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.User,
            recordId=self.id,
            changes=[]
        ))
        db_sess.commit()

    def set_password(self, password: str):
        self.password = generate_password_hash(password)

    def check_password(self, password: str):
        return check_password_hash(self.password, password)

    def check_permission(self, operation: tuple[str, str]):
        return operation[0] in self.get_operations()

    def add_role(self, actor: User, roleId: int):
        db_sess = Session.object_session(self)
        existing = db_sess.query(UserRole).filter(UserRole.userId == self.id, UserRole.roleId == roleId).first()
        if existing:
            return False

        user_role = UserRole(userId=self.id, roleId=roleId)
        db_sess.add(user_role)
        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.added,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.UserRole,
            recordId=-1,
            changes=user_role.get_creation_changes()
        ))
        db_sess.commit()
        return True

    def remove_role(self, actor: User, roleId: int):
        db_sess = Session.object_session(self)
        user_role: UserRole = db_sess.query(UserRole).filter(UserRole.userId == self.id, UserRole.roleId == roleId).first()
        if not user_role:
            return False

        db_sess.delete(user_role)
        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.deleted,
            userId=actor.id,
            userName=actor.name,
            tableName=Tables.UserRole,
            recordId=-1,
            changes=user_role.get_deletion_changes()
        ))
        db_sess.commit()
        return True

    def set_group(self, group: int):
        db_sess = Session.object_session(self)
        if group not in (0, 1, 2):
            group = 0
        if self.group == group:
            return group

        db_sess.add(Log(
            date=get_datetime_now(),
            actionCode=Actions.updated,
            userId=self.id,
            userName=self.name,
            tableName=Tables.User,
            recordId=self.id,
            changes=[("group", self.group, group)]
        ))
        self.group = group

        db_sess.commit()
        return group

    def get_roles(self):
        db_sess = Session.object_session(self)
        roles = db_sess\
            .query(Role)\
            .join(UserRole, UserRole.roleId == Role.id)\
            .filter(UserRole.userId == self.id)\
            .values(Role.name)

        return list(map(lambda v: v[0], roles))

    def get_operations(self):
        db_sess = Session.object_session(self)
        operations = db_sess\
            .query(Permission)\
            .join(Role, Permission.roleId == Role.id)\
            .join(UserRole, UserRole.roleId == Role.id)\
            .filter(UserRole.userId == self.id)\
            .values(Permission.operationId)

        return list(map(lambda v: v[0], operations))

    def get_complited_quests(self):
        db_sess = Session.object_session(self)
        quests = db_sess\
            .query(Quest)\
            .join(UserQuest, UserQuest.questId == Quest.id)\
            .filter(UserQuest.userId == self.id, UserQuest.completeDate != None)\
            .all()

        return quests

    def get_complited_quest_ids(self):
        db_sess = Session.object_session(self)
        quests = db_sess\
            .query(UserQuest)\
            .filter(UserQuest.userId == self.id, UserQuest.completeDate != None)\
            .values(UserQuest.questId)

        return list(map(lambda v: v[0], quests))

    def get_dict(self):
        return {
            "id": self.id_big,
            "name": self.name,
            "last_name": self.lastName,
            "photo": self.imageUrl,
            "balance": self.balance,
            "roles": self.get_roles(),
            "operations": self.get_operations(),
            "group": self.group,
        }

    def get_dict_full(self):
        return {
            "id": self.id,
            "id_vk": self.id_vk,
            "id_big": self.id_big,
            "login": self.login,
            "name": self.name,
            "last_name": self.lastName,
            "photo": self.imageUrl,
            "balance": self.balance,
            "roles": self.get_roles(),
            "deleted": self.deleted,
            "operations": self.get_operations(),
            "group": self.group,
        }
