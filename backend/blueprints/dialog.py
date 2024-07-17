from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from data.dialog import Dialog
from data.user import User
from utils import (get_json_values_from_req, jsonify_list, permission_required, permission_required_any,
                   response_msg, response_not_found, use_db_session, use_user, use_user_try)


blueprint = Blueprint("dialog", __name__)


@blueprint.route("/api/dialog/<int:dialogId>")
@use_db_session()
def dialog(dialogId, db_sess: Session):
    dialog = Dialog.get(db_sess, dialogId)
    if dialog is None:
        return response_not_found("dialog", dialogId)

    return jsonify(dialog.get_dict()), 200
