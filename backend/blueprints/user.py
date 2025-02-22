from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session

from bfs import get_json_values_from_req, jsonify_list, permission_required, response_msg, use_db_session, use_user
from data._operations import Operations
from data.user import User


blueprint = Blueprint("user", __name__)


@blueprint.route("/api/users")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_users)
def users(db_sess: Session, user: User):
    users = User.all(db_sess, includeDeleted=True)
    return jsonify_list(users, "get_dict_full")


@blueprint.route("/api/user/change_password", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def change_password(db_sess: Session, user: User):
    password = get_json_values_from_req("password")

    user.update_password(password)

    return response_msg("ok")


@blueprint.route("/api/user/change_name", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def change_name(db_sess: Session, user: User):
    name = get_json_values_from_req("name")

    user.update_name(name)

    return response_msg("ok")


@blueprint.route("/api/user/set_group", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def set_group(db_sess: Session, user: User):
    group = get_json_values_from_req("group")

    group = user.set_group(group)

    return jsonify({"group": group})


@blueprint.route("/api/user/open_game", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def open_game(db_sess: Session, user: User):
    user.gameOpened = True
    db_sess.commit()

    return response_msg("ok")
