from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.log import Actions, Log, Tables
from data.operation import Operations
from data.user import User
from data.get_datetime_now import get_datetime_now
from utils import get_json_values_from_req, jsonify_list, permission_required, use_db_session, use_user


blueprint = Blueprint("user", __name__)


@blueprint.route("/api/users")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_users)
def users(db_sess: Session, user: User):
    users = User.all(db_sess, True)
    return jsonify_list(users, "get_dict_full"), 200


@blueprint.route("/api/user/change_password", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def change_password(db_sess: Session, user: User):
    (password, ), errorRes = get_json_values_from_req("password")
    if errorRes:
        return errorRes

    user.set_password(password)

    db_sess.add(Log(
        date=get_datetime_now(),
        actionCode=Actions.updated,
        userId=user.id,
        userName=user.name,
        tableName=Tables.User,
        recordId=user.id,
        changes=[("password", "***", "***")]
    ))
    db_sess.commit()

    return "", 200


@blueprint.route("/api/user/change_name", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def change_name(db_sess: Session, user: User):
    (name, ), errorRes = get_json_values_from_req("name")
    if errorRes:
        return errorRes

    pastName = user.name
    user.name = name

    db_sess.add(Log(
        date=get_datetime_now(),
        actionCode=Actions.updated,
        userId=user.id,
        userName=user.name,
        tableName=Tables.User,
        recordId=user.id,
        changes=[("name", pastName, name)]
    ))
    db_sess.commit()

    return "", 200
