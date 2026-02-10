from bafser import TJson, doc_api, get_json_values_from_req, protected_route, use_db_sess
from flask import Blueprint
from sqlalchemy import func
from sqlalchemy.orm import Session

from data import Operations, User
from data.other import Other
from data.user_quest import UserQuest

blueprint = Blueprint("other", __name__)


@blueprint.route("/api/other/ticketLoginEnabled")
@doc_api(res=TJson["value", bool])
def startStr():
    obj = Other.get2()
    return {"value": obj.ticketLoginEnabled}


@blueprint.post("/api/other/ticketLoginEnabled")
@doc_api(req=TJson["value", bool], res=TJson["value", bool])
@protected_route(perms=Operations.site_config)
def set_startStr():
    value = get_json_values_from_req(("value", bool))
    Other.set_ticketLoginEnabled(value)
    return {"value": value}


@blueprint.route("/api/other/stats")
@doc_api(res=TJson["group1_completed", int, "group1_members", int, "group2_completed", int, "group2_members", int])
@protected_route(perms=Operations.page_stats)
@use_db_sess
def stats(db_sess: Session):
    data_completed = db_sess.query(User.group, func.count(UserQuest.completeDate)).join(User, User.id == UserQuest.userId).group_by(User.group).all()
    data_members = db_sess.query(User.group, func.count(User.id)).group_by(User.group).all()
    r = {
        "group1_completed": 0,
        "group1_members": 0,
        "group2_completed": 0,
        "group2_members": 0,
    }
    for row in data_completed:
        group, count = row
        r[f"group{group}_completed"] = count

    for row in data_members:
        group, count = row
        r[f"group{group}_members"] = count

    return r
