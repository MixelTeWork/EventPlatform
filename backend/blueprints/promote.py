from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from data.role import Roles
from data.user import User

from utils import get_json_values_from_req, permission_required, use_db_session, use_user


blueprint = Blueprint("promote", __name__)


@blueprint.route("/api/promote_worker", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.promote_worker)
def promote_worker(db_sess: Session, user: User):
    def promote(visitor: User):
        r = visitor.add_role(user, Roles.worker)
        return r

    return promoteTo(db_sess, promote)


@blueprint.route("/api/promote_manager", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.promote_manager)
def promote_manager(db_sess: Session, user: User):
    def promote(visitor: User):
        visitor.add_role(user, Roles.worker)
        r = visitor.add_role(user, Roles.manager)
        return r

    return promoteTo(db_sess, promote)


def promoteTo(db_sess: Session, promote):
    (userId,), errorRes = get_json_values_from_req("userId")
    if errorRes:
        return errorRes

    visitor = User.get_by_big_id(db_sess, userId)
    if visitor is None:
        return jsonify({"res": "no_user", "user": userId}), 200

    r = promote(visitor)
    if not r:
        return jsonify({"res": "already_has", "user": visitor.name}), 200
    return jsonify({"res": "ok", "user": visitor.name}), 200
