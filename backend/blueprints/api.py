from bafser import doc_api, log_frontend_error, protected_route
from flask import Blueprint

from data.user import User, UserDict

bp = Blueprint("api", __name__)


@bp.route("/api/user")
@doc_api(res=UserDict, desc="Get current user")
@protected_route()
def user():
    return User.current.get_dict()


@bp.post("/api/frontend_error")
def frontend_error():
    log_frontend_error()
    return "ok"
