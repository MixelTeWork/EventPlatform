from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session

from bafser import get_json_values_from_req, jsonify_list, permission_required, response_msg, use_db_session, use_user, response_not_found
from data._roles import Roles
from data._operations import Operations
from data.user import User


blueprint = Blueprint("user", __name__)


@blueprint.route("/api/users")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_dev)
def users(db_sess: Session, user: User):
    users = User.all(db_sess, includeDeleted=True)
    return jsonify_list(users, "get_dict_full")


@blueprint.post("/api/users")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_dev)
def add_user(db_sess: Session, user: User):
    login, password, name, roles = get_json_values_from_req("login", "password", "name", "roles")

    u = User.new(user, login, password, name, roles)

    return u.get_dict_full()


@blueprint.route("/api/users/roles")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_dev)
def roles(db_sess: Session, user: User):
    return jsonify([{"id": v[0], "name": v[1]} for v in Roles.get_all()])


@blueprint.post("/api/users/<int:userId>/roles")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_dev)
def set_user_roles(userId, db_sess: Session, user: User):
    roles = get_json_values_from_req("roles")

    u = User.get(db_sess, userId, includeDeleted=True)
    if u is None:
        return response_not_found("user", userId)

    cur_roles = [v[0] for v in u.get_roles()]
    for role in set(cur_roles) - set(roles):
        u.remove_role(user, role)
    for role in set(roles) - set(cur_roles):
        u.add_role(user, role)

    return u.get_dict_full()


@blueprint.post("/api/users/<int:userId>/set_password")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_dev)
def set_user_password(userId, db_sess: Session, user: User):
    password = get_json_values_from_req("password")

    u = User.get(db_sess, userId, includeDeleted=True)
    if u is None:
        return response_not_found("user", userId)

    u.update_password(user, password)

    return u.get_dict_full()


@blueprint.post("/api/users/<int:userId>/set_name")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_dev)
def set_user_name(userId, db_sess: Session, user: User):
    name = get_json_values_from_req("name")

    u = User.get(db_sess, userId, includeDeleted=True)
    if u is None:
        return response_not_found("user", userId)

    u.update_name(user, name)

    return u.get_dict_full()


@blueprint.post("/api/user/change_password")
@jwt_required()
@use_db_session()
@use_user()
def change_password(db_sess: Session, user: User):
    password = get_json_values_from_req("password")

    user.update_password(user, password)

    return response_msg("ok")


@blueprint.post("/api/user/change_name")
@jwt_required()
@use_db_session()
@use_user()
def change_name(db_sess: Session, user: User):
    name = get_json_values_from_req("name")

    user.update_name(user, name)

    return response_msg("ok")


@blueprint.post("/api/user/set_group")
@jwt_required()
@use_db_session()
@use_user()
def set_group(db_sess: Session, user: User):
    group = get_json_values_from_req("group")

    group = user.set_group(group)

    return jsonify({"group": group})


@blueprint.post("/api/user/open_game")
@jwt_required()
@use_db_session()
@use_user()
def open_game(db_sess: Session, user: User):
    user.gameOpened = True
    db_sess.commit()

    return response_msg("ok")
