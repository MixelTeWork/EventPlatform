from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from data.send import Send
from utils import get_json_values_from_req, permission_required, response_not_found, use_db_session, use_user
from data.user import User


blueprint = Blueprint("send", __name__)


@blueprint.route("/api/send", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.send_any)
def send(db_sess: Session, user: User):
    value, positive, reusable = get_json_values_from_req("value", "positive", "reusable")

    send = Send.new(db_sess, user.id, value, positive, reusable)

    return jsonify(send.get_dict()), 200


@blueprint.route("/api/send_check", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.send_any)
def send_check(db_sess: Session, user: User):
    sendId = get_json_values_from_req("id")

    send = Send.get_by_big_id(db_sess, sendId)
    if send is None:
        return response_not_found("send", sendId)

    return jsonify({"successful": send.used}), 200
