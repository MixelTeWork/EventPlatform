from bafser import doc_api, log_frontend_error, use_db_session, use_user
from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session

from data.user import User, UserDict

blueprint = Blueprint("api", __name__)


@blueprint.route("/api/user")
@doc_api(res=UserDict, desc="Get current user")
@jwt_required()
@use_db_session
@use_user()
def user(db_sess: Session, user: User):
    return user.get_dict()


@blueprint.post("/api/frontend_error")
def frontend_error():
    log_frontend_error()
    return "ok"
