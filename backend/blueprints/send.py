from bafser import get_json_values_from_req, permission_required, response_not_found, use_db_session, use_user
from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session

from data._operations import Operations
from data.send import Send
from data.user import User

blueprint = Blueprint("send", __name__)


@blueprint.post("/api/send")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.send_any)
def send(db_sess: Session, user: User):
    value, positive, reusable = get_json_values_from_req(("value", int), ("positive", bool), ("reusable", bool))

    send = Send.new(db_sess, user.id, value, positive, reusable)

    return send.get_dict()


@blueprint.post("/api/send_check")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.send_any)
def send_check(db_sess: Session, user: User):
    sendId = get_json_values_from_req(("id", str))

    send = Send.get_by_big_id(db_sess, sendId)
    if send is None:
        return response_not_found("send", sendId)

    return {"successful": send.used}
